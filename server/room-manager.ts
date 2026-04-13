import type { Server } from "socket.io";
import {
  CHAT_COOLDOWN_MS,
  DEFAULT_SETTINGS,
  MAX_PLAYERS,
  MIN_PLAYERS
} from "../shared/constants.js";
import {
  buildAwards,
  canStartGame,
  clampSettings,
  createEmptyStats,
  createId,
  generateRoomCode,
  normalizeProfile,
  pickWordPair,
  resolveSuspect,
  sanitizeChatMessage,
  scoreRound,
  assignRoles
} from "../shared/game.js";
import type {
  ChatMessage,
  ClientToServerEvents,
  CompletedRoundView,
  DrawingStateView,
  DrawingStroke,
  FinalResultsView,
  GamePhase,
  GameMode,
  GameStatus,
  PlayerProfile,
  PlayerRole,
  PlayerStatsView,
  QuickPlayPayload,
  ReactionEvent,
  RoundResolutionView,
  RoomSettings,
  RoomView,
  ServerToClientEvents,
  WordPair
} from "../shared/protocol.js";

interface ServerPlayer {
  id: string;
  clientId: string;
  socketId: string | null;
  connected: boolean;
  isHost: boolean;
  ready: boolean;
  joinedAt: number;
  lastActiveAt: number;
  lastChatAt: number;
  profile: PlayerProfile;
  points: number;
  stats: PlayerStatsView;
}

interface RoundState {
  roundNumber: number;
  wordPair: WordPair;
  roles: Record<string, PlayerRole>;
  words: Record<string, string | null>;
  drawings: Record<string, DrawingStateView>;
  votes: Record<string, string | null>;
  submittedVotePlayerIds: Set<string>;
  pointers: Record<string, string | null>;
  reactions: ReactionEvent[];
  chat: ChatMessage[];
  readyForPhaseAdvance: Set<string>;
  roleConfirmedPlayerIds: Set<string>;
  resolution: RoundResolutionView | null;
}

interface ServerRoom {
  code: string;
  createdAt: number;
  status: GameStatus;
  phase: GamePhase;
  phaseEndsAt: number | null;
  settings: RoomSettings;
  hostId: string;
  players: ServerPlayer[];
  lobbyChat: ChatMessage[];
  round: RoundState | null;
  completedRounds: CompletedRoundView[];
  currentRound: number;
  usedWordPairIds: string[];
  finalResults: FinalResultsView | null;
  systemNotice: string | null;
  timeoutHandle: NodeJS.Timeout | null;
}

export class RoomManager {
  private rooms = new Map<string, ServerRoom>();
  private removalTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly io: Server<ClientToServerEvents, ServerToClientEvents>
  ) {}

  createRoom(socketId: string, payload: { clientId: string; profile: PlayerProfile }) {
    const code = generateRoomCode(new Set(this.rooms.keys()));
    const playerId = createId("player");
    const player = this.createPlayer({
      id: playerId,
      clientId: payload.clientId,
      socketId,
      profile: payload.profile,
      isHost: true
    });

    const room: ServerRoom = {
      code,
      createdAt: Date.now(),
      status: "lobby",
      phase: "lobby",
      phaseEndsAt: null,
      settings: clampSettings({
        ...DEFAULT_SETTINGS,
        selectedCategories: [...DEFAULT_SETTINGS.selectedCategories],
        customWordPairs: []
      }),
      hostId: playerId,
      players: [player],
      lobbyChat: [],
      round: null,
      completedRounds: [],
      currentRound: 0,
      usedWordPairIds: [],
      finalResults: null,
      systemNotice: "Salon créé. Invite tes suspects.",
      timeoutHandle: null
    };

    this.rooms.set(code, room);
    this.io.sockets.sockets.get(socketId)?.join(code);
    this.emitRoomState(room);

    return {
      ok: true,
      roomCode: code,
      selfId: playerId
    };
  }

  joinRoom(
    socketId: string,
    payload: { roomCode: string; clientId: string; profile: PlayerProfile }
  ) {
    const room = this.rooms.get(payload.roomCode.toUpperCase());
    if (!room) {
      return { ok: false, error: "Salon introuvable." };
    }

    let player = room.players.find((entry) => entry.clientId === payload.clientId);
    const inGameJoin = room.status === "in_game" && !player;
    if (inGameJoin) {
      return { ok: false, error: "La partie a déjà commencé." };
    }

    if (!player && room.settings.locked) {
      return { ok: false, error: "La salle est verrouillée." };
    }

    if (!player && room.players.length >= MAX_PLAYERS) {
      return { ok: false, error: "Le salon est plein." };
    }

    if (player) {
      player.socketId = socketId;
      player.connected = true;
      player.profile = normalizeProfile(payload.profile);
      player.lastActiveAt = Date.now();
      // Cancel any pending removal — player is back
      this.cancelPlayerRemoval(room.code, player.id);
      if (!room.players.some((entry) => entry.isHost && entry.connected)) {
        player.isHost = true;
        room.hostId = player.id;
      }
      room.systemNotice = `${player.profile.name} s'est reconnecté.`;
    } else {
      player = this.createPlayer({
        id: createId("player"),
        clientId: payload.clientId,
        socketId,
        profile: payload.profile,
        isHost: false
      });
      room.players.push(player);
      room.systemNotice = `${player.profile.name} rejoint la pièce.`;
    }

    this.io.sockets.sockets.get(socketId)?.join(room.code);
    this.emitRoomState(room);

    return {
      ok: true,
      roomCode: room.code,
      selfId: player.id
    };
  }

  handleDisconnect(socketId: string) {
    const located = this.findRoomBySocketId(socketId);
    if (!located) {
      return;
    }
    const { room, player } = located;
    player.connected = false;
    player.socketId = null;
    player.ready = false;
    player.lastActiveAt = Date.now();

    this.ensureHost(room);
    room.systemNotice = `${player.profile.name} s'est déconnecté.`;

    if (room.players.every((entry) => !entry.connected) && room.status === "lobby") {
      this.clearRoomTimeout(room);
      this.rooms.delete(room.code);
      return;
    }

    this.emitRoomState(room);

    // Schedule auto-removal: 20s in lobby, 120s in game
    const delay = room.status === "lobby" ? 20_000 : 120_000;
    this.schedulePlayerRemoval(room, player.id, delay);
  }

  /** Remove a disconnected player after a grace period */
  private schedulePlayerRemoval(room: ServerRoom, playerId: string, delayMs: number) {
    const key = `${room.code}:${playerId}`;
    // Clear any existing timer for this player
    if (this.removalTimers.has(key)) {
      clearTimeout(this.removalTimers.get(key)!);
    }
    const timer = setTimeout(() => {
      this.removalTimers.delete(key);
      this.removePlayerIfStillGone(room.code, playerId);
    }, delayMs);
    this.removalTimers.set(key, timer);
  }

  /** Cancel scheduled removal (e.g. when player reconnects) */
  private cancelPlayerRemoval(roomCode: string, playerId: string) {
    const key = `${roomCode}:${playerId}`;
    const timer = this.removalTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.removalTimers.delete(key);
    }
  }

  private removePlayerIfStillGone(roomCode: string, playerId: string) {
    const room = this.rooms.get(roomCode);
    if (!room) return;
    const player = room.players.find((p) => p.id === playerId);
    if (!player || player.connected) return;

    // Remove the player
    room.players = room.players.filter((p) => p.id !== playerId);
    room.systemNotice = `${player.profile.name} a été retiré (déconnexion).`;

    // If no players left, delete room
    if (room.players.length === 0) {
      this.clearRoomTimeout(room);
      this.rooms.delete(roomCode);
      return;
    }

    this.ensureHost(room);
    this.emitRoomState(room);
  }

  updateProfile(payload: { roomCode: string; clientId: string; profile: PlayerProfile }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located) {
      return;
    }
    const { room, player } = located;
    player.profile = normalizeProfile(payload.profile);
    this.touch(player);
    this.emitRoomState(room);
  }

  updateSettings(payload: {
    roomCode: string;
    clientId: string;
    settings: Partial<RoomSettings>;
  }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located) return;
    const { room, player } = located;
    if (room.phase !== "lobby" || room.hostId !== player.id) {
      return;
    }
    room.settings = clampSettings({
      ...room.settings,
      ...payload.settings,
      customWordPairs: payload.settings.customWordPairs ?? room.settings.customWordPairs
    });
    this.touch(player);
    this.emitRoomState(room);
  }

  toggleReady(payload: { roomCode: string; clientId: string }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located) return;
    const { room, player } = located;
    if (room.phase !== "lobby") return;
    player.ready = !player.ready;
    this.touch(player);
    this.emitRoomState(room);
  }

  startGame(payload: { roomCode: string; clientId: string }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located) return;
    const { room, player } = located;
    if (room.phase !== "lobby" || room.hostId !== player.id) {
      return;
    }

    // Host clicking "Lancer" counts as ready
    player.ready = true;
    const connectedPlayers = room.players.filter((entry) => entry.connected);
    const readyCount = connectedPlayers.filter((entry) => entry.ready).length;
    if (connectedPlayers.length < MIN_PLAYERS) {
      this.sendErrorToPlayer(player, `Il faut au moins ${MIN_PLAYERS} joueurs connectés.`);
      return;
    }
    if (!canStartGame(readyCount, connectedPlayers.length)) {
      this.sendErrorToPlayer(player, `Tous les joueurs doivent être prêts.`);
      return;
    }

    room.players.forEach((entry) => {
      entry.ready = false;
      entry.points = 0;
      entry.stats = createEmptyStats();
    });
    room.currentRound = 1;
    room.status = "in_game";
    room.finalResults = null;
    room.usedWordPairIds = [];
    room.completedRounds = [];
    room.systemNotice = "Les cartes sont distribuées.";
    this.beginRound(room);
  }

  confirmRole(payload: { roomCode: string; clientId: string }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located || located.room.phase !== "role_reveal" || !located.room.round) {
      return;
    }
    const { room, player } = located;
    const round = room.round!;
    round.roleConfirmedPlayerIds.add(player.id);
    this.touch(player);
    this.emitRoomState(room);

    const everyoneConfirmed = room.players.every(
      (entry) => !entry.connected || round.roleConfirmedPlayerIds.has(entry.id)
    );
    if (everyoneConfirmed) {
      this.setPhase(room, "drawing", room.settings.drawingSeconds * 1000);
    }
  }

  readyForNextPhase(_payload: { roomCode: string; clientId: string }) {
    // Gallery phase removed — no-op kept for protocol compatibility
  }

  drawingStroke(payload: { roomCode: string; clientId: string; stroke: DrawingStroke }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located || located.room.phase !== "drawing" || !located.room.round) {
      return;
    }
    const { room, player } = located;
    this.touch(player);
    this.io.to(room.code).emit("drawing_stream", {
      type: "preview",
      playerId: player.id,
      stroke: payload.stroke
    });
  }

  commitStroke(payload: {
    roomCode: string;
    clientId: string;
    stroke: DrawingStroke;
    snapshot: string | null;
  }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located || located.room.phase !== "drawing" || !located.room.round) {
      return;
    }
    const { room, player } = located;
    const round = room.round!;
    const drawing = round.drawings[player.id];
    drawing.strokes.push(payload.stroke);
    drawing.snapshot = payload.snapshot;
    drawing.lastUpdatedAt = Date.now();
    this.touch(player);

    this.io.to(room.code).emit("drawing_stream", {
      type: "commit",
      playerId: player.id,
      stroke: payload.stroke
    });
  }

  undoStroke(payload: { roomCode: string; clientId: string }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located || located.room.phase !== "drawing" || !located.room.round) {
      return;
    }
    const { room, player } = located;
    const round = room.round!;
    const drawing = round.drawings[player.id];
    drawing.strokes.pop();
    drawing.snapshot = null;
    drawing.lastUpdatedAt = Date.now();
    this.touch(player);

    this.io.to(room.code).emit("drawing_stream", {
      type: "undo",
      playerId: player.id
    });
  }

  clearDrawing(payload: { roomCode: string; clientId: string }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located || located.room.phase !== "drawing" || !located.room.round) {
      return;
    }
    const { room, player } = located;
    const round = room.round!;
    round.drawings[player.id] = {
      strokes: [],
      snapshot: null,
      lastUpdatedAt: Date.now()
    };
    this.touch(player);

    this.io.to(room.code).emit("drawing_stream", {
      type: "clear",
      playerId: player.id
    });
  }

  castVote(payload: {
    roomCode: string;
    clientId: string;
    targetPlayerId: string | null;
  }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located || located.room.phase !== "vote" || !located.room.round) {
      return;
    }
    const { room, player } = located;
    const round = room.round!;
    if (round.submittedVotePlayerIds.has(player.id)) {
      return;
    }
    if (payload.targetPlayerId === player.id) {
      return;
    }
    if (payload.targetPlayerId !== null && !(payload.targetPlayerId in round.votes)) {
      return;
    }
    round.votes[player.id] = payload.targetPlayerId;
    round.submittedVotePlayerIds.add(player.id);
    round.pointers[player.id] = null;
    this.touch(player);

    // If everyone voted, speed up timer to 3s
    const connectedIds = room.players.filter((p) => p.connected).map((p) => p.id);
    const allVoted = connectedIds.every((id) => round.submittedVotePlayerIds.has(id));
    if (allVoted && room.phaseEndsAt) {
      const remaining = room.phaseEndsAt - Date.now();
      if (remaining > 3000) {
        this.clearRoomTimeout(room);
        room.phaseEndsAt = Date.now() + 3000;
        room.timeoutHandle = setTimeout(() => this.handlePhaseTimeout(room.code), 3000);
      }
    }

    this.emitRoomState(room);
  }

  sendReaction(payload: {
    roomCode: string;
    clientId: string;
    targetPlayerId: string;
    emoji: ReactionEvent["emoji"];
  }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (
      !located ||
      !located.room.round ||
      located.room.phase !== "resolution"
    ) {
      return;
    }
    const { room, player } = located;
    const round = room.round!;
    const reaction: ReactionEvent = {
      id: createId("reaction"),
      fromPlayerId: player.id,
      targetPlayerId: payload.targetPlayerId,
      emoji: payload.emoji,
      createdAt: Date.now()
    };
    round.reactions.push(reaction);
    const target = room.players.find((entry) => entry.id === payload.targetPlayerId);
    if (target) {
      target.stats.reactionCounts[payload.emoji] =
        (target.stats.reactionCounts[payload.emoji] ?? 0) + 1;
    }
    this.touch(player);
    this.emitRoomState(room);
  }

  pointFinger(payload: {
    roomCode: string;
    clientId: string;
    targetPlayerId: string | null;
  }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located || !located.room.round || located.room.phase !== "vote") {
      return;
    }
    const { room, player } = located;
    const round = room.round!;
    if (round.submittedVotePlayerIds.has(player.id)) return;
    if (payload.targetPlayerId === player.id) return;
    round.pointers[player.id] = payload.targetPlayerId;
    this.touch(player);
    this.emitRoomState(room);
  }

  chatMessage(payload: { roomCode: string; clientId: string; text: string }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located) return;
    const { room, player } = located;
    const now = Date.now();
    if (now - player.lastChatAt < CHAT_COOLDOWN_MS) {
      this.sendErrorToPlayer(player, "Doucement sur le chat.");
      return;
    }
    const text = sanitizeChatMessage(payload.text);
    if (!text) return;

    let flair: ChatMessage["flair"];
    if (text === "/gg") flair = "gg";
    if (text.startsWith("/sus")) flair = "sus";
    if (text === "/rip") flair = "rip";

    const message: ChatMessage = {
      id: createId("chat"),
      playerId: player.id,
      text,
      createdAt: now,
      scope: room.phase === "lobby" ? "lobby" : "game",
      flair
    };

    if (message.scope === "lobby") {
      room.lobbyChat.push(message);
      room.lobbyChat = room.lobbyChat.slice(-30);
    } else if (room.round) {
      room.round.chat.push(message);
      room.round.chat = room.round.chat.slice(-50);
    }

    player.lastChatAt = now;
    this.touch(player);
    this.emitRoomState(room);
  }

  submitMrWhiteGuess(payload: { roomCode: string; clientId: string; guess: string }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located || located.room.phase !== "resolution" || !located.room.round?.resolution) {
      return;
    }
    const { room, player } = located;
    const round = room.round!;
    const resolution = round.resolution!;
    if (!resolution.mrWhiteGuess.pending || resolution.mrWhiteGuess.playerId !== player.id) {
      return;
    }

    const normalizedGuess = payload.guess.trim().toLowerCase();
    const correct = normalizedGuess === round.wordPair.civilWord.trim().toLowerCase();
    resolution.mrWhiteGuess.guess = payload.guess.trim();
    resolution.mrWhiteGuess.correct = correct;
    resolution.mrWhiteGuess.pending = false;
    resolution.mrWhiteGuess.deadlineAt = null;

    this.clearRoomTimeout(room);
    this.applyRoundOutcome(room, correct);
    this.scheduleAfterResolution(room);
    this.emitRoomState(room);
  }

  replayGame(payload: { roomCode: string; clientId: string }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located) return;
    const { room, player } = located;
    if (room.hostId !== player.id || room.phase !== "final") return;
    this.resetRoomToLobby(room, "Nouvelle manche. Les rôles sont mélangés.");
  }

  returnToLobby(payload: { roomCode: string; clientId: string }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located) return;
    const { room, player } = located;
    if (room.hostId !== player.id) return;
    this.resetRoomToLobby(room, "Retour au lobby.");
  }

  kickPlayer(payload: { roomCode: string; clientId: string; targetPlayerId: string }) {
    const located = this.findPlayer(payload.roomCode, payload.clientId);
    if (!located) return;
    const { room, player } = located;
    if (room.hostId !== player.id) return;
    if (room.phase !== "lobby") return;

    const target = room.players.find((p) => p.id === payload.targetPlayerId);
    if (!target || target.id === player.id) return;

    // Disconnect target socket from room
    if (target.socketId) {
      const targetSocket = this.io.sockets.sockets.get(target.socketId);
      targetSocket?.leave(room.code);
      this.io.to(target.socketId).emit("server_error", "Tu as été expulsé de la salle.");
    }

    room.players = room.players.filter((p) => p.id !== target.id);
    this.cancelPlayerRemoval(room.code, target.id);
    room.systemNotice = `${target.profile.name} a été expulsé.`;
    this.emitRoomState(room);
  }

  // ─── Matchmaking Queue ───

  private matchmakingQueue: Array<{
    clientId: string;
    socketId: string;
    profile: PlayerProfile;
    language: string;
    mode: GameMode;
    joinedAt: number;
  }> = [];

  private matchmakingTimer: NodeJS.Timeout | null = null;

  quickPlay(socketId: string, payload: QuickPlayPayload) {
    // Remove if already in queue
    this.matchmakingQueue = this.matchmakingQueue.filter((e) => e.clientId !== payload.clientId);

    this.matchmakingQueue.push({
      clientId: payload.clientId,
      socketId,
      profile: payload.profile,
      language: payload.language || "en",
      mode: payload.mode || "classic",
      joinedAt: Date.now()
    });

    // Try to match immediately
    const result = this.tryMatch(payload.language, payload.mode);
    if (result) return result;

    // Start periodic matching if not already running
    if (!this.matchmakingTimer) {
      this.matchmakingTimer = setInterval(() => {
        if (this.matchmakingQueue.length === 0) {
          clearInterval(this.matchmakingTimer!);
          this.matchmakingTimer = null;
          return;
        }
        // Try matching for each unique lang+mode combo in queue
        const combos = new Set(this.matchmakingQueue.map((e) => `${e.language}_${e.mode}`));
        for (const combo of combos) {
          const [lang, mode] = combo.split("_");
          this.tryMatch(lang, mode as GameMode);
        }
      }, 5000);
    }

    return { ok: true, roomCode: undefined, selfId: undefined };
  }

  cancelQuickPlay(payload: { clientId: string }) {
    this.matchmakingQueue = this.matchmakingQueue.filter((e) => e.clientId !== payload.clientId);
  }

  private tryMatch(language: string, mode: GameMode) {
    const candidates = this.matchmakingQueue.filter(
      (e) => e.language === language && e.mode === mode
    );

    const MIN_MATCH = 4;
    if (candidates.length < MIN_MATCH) return null;

    // Take up to 6 players
    const matched = candidates.slice(0, 6);

    // Remove from queue
    const matchedIds = new Set(matched.map((e) => e.clientId));
    this.matchmakingQueue = this.matchmakingQueue.filter((e) => !matchedIds.has(e.clientId));

    // Create room with the first player as host
    const host = matched[0];
    const code = generateRoomCode(new Set(this.rooms.keys()));
    const hostPlayer = this.createPlayer({
      id: createId("player"),
      clientId: host.clientId,
      socketId: host.socketId,
      profile: host.profile,
      isHost: true
    });

    const allKeywords: Record<string, string> = { fr: "Tout", en: "All", es: "Todo", pt: "Tudo", de: "Alle" };

    const room: ServerRoom = {
      code,
      createdAt: Date.now(),
      status: "lobby",
      phase: "lobby",
      phaseEndsAt: null,
      settings: clampSettings({
        ...DEFAULT_SETTINGS,
        mode,
        language,
        selectedCategories: [allKeywords[language] || "All"],
        customWordPairs: []
      }),
      hostId: hostPlayer.id,
      players: [hostPlayer],
      lobbyChat: [],
      round: null,
      completedRounds: [],
      currentRound: 0,
      usedWordPairIds: [],
      finalResults: null,
      systemNotice: "Matchmaking — Partie trouvée !",
      timeoutHandle: null
    };

    this.rooms.set(code, room);
    this.io.sockets.sockets.get(host.socketId)?.join(code);

    // Add other matched players
    for (let i = 1; i < matched.length; i++) {
      const entry = matched[i];
      const player = this.createPlayer({
        id: createId("player"),
        clientId: entry.clientId,
        socketId: entry.socketId,
        profile: entry.profile,
        isHost: false
      });
      room.players.push(player);
      this.io.sockets.sockets.get(entry.socketId)?.join(code);
    }

    this.emitRoomState(room);

    return {
      ok: true,
      roomCode: code,
      selfId: hostPlayer.id
    };
  }

  private beginRound(room: ServerRoom) {
    const playerIds = room.players.map((player) => player.id);
    const assignments = assignRoles(playerIds, room.settings.mode);
    const wordPair = pickWordPair(room.settings, room.usedWordPairIds);
    room.usedWordPairIds.push(wordPair.id);

    const roles = Object.fromEntries(playerIds.map((id) => [id, assignments.get(id)!]));
    const words = Object.fromEntries(
      playerIds.map((id) => [
        id,
        roles[id] === "civil"
          ? wordPair.civilWord
          : roles[id] === "undercover"
            ? wordPair.undercoverWord
            : null
      ])
    );
    const drawings = Object.fromEntries(
      playerIds.map((id) => [
        id,
        {
          strokes: [],
          snapshot: null,
          lastUpdatedAt: null
        } satisfies DrawingStateView
      ])
    );
    room.round = {
      roundNumber: room.currentRound,
      wordPair,
      roles,
      words,
      drawings,
      votes: Object.fromEntries(playerIds.map((id) => [id, null])),
      submittedVotePlayerIds: new Set<string>(),
      pointers: Object.fromEntries(playerIds.map((id) => [id, null])),
      reactions: [],
      chat: [],
      readyForPhaseAdvance: new Set<string>(),
      roleConfirmedPlayerIds: new Set<string>(),
      resolution: null
    };
    room.status = "in_game";
    room.finalResults = null;
    room.completedRounds = [];
    room.systemNotice = `Round ${room.currentRound}/${room.settings.rounds}`;
    this.setPhase(room, "role_reveal", null);
  }

  private setPhase(room: ServerRoom, phase: GamePhase, durationMs: number | null) {
    room.phase = phase;
    room.phaseEndsAt = durationMs ? Date.now() + durationMs : null;
    this.clearRoomTimeout(room);
    if (durationMs) {
      room.timeoutHandle = setTimeout(() => this.handlePhaseTimeout(room.code), durationMs);
    }
    this.emitRoomState(room);
  }

  private handlePhaseTimeout(roomCode: string) {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    switch (room.phase) {
      case "drawing":
        room.systemNotice = "Qui est l'Undercover ?";
        room.round?.readyForPhaseAdvance.clear();
        this.setPhase(room, "vote", room.settings.voteSeconds * 1000);
        break;
      case "vote":
        // Auto-confirm pending votes from pointers
        if (room.round) {
          for (const player of room.players) {
            if (!player.connected) continue;
            if (room.round.submittedVotePlayerIds.has(player.id)) continue;
            const pendingTarget = room.round.pointers[player.id];
            if (pendingTarget) {
              room.round.votes[player.id] = pendingTarget;
              room.round.submittedVotePlayerIds.add(player.id);
            }
          }
        }
        this.resolveVotePhase(room);
        break;
      case "resolution":
        if (room.round?.resolution?.mrWhiteGuess.pending) {
          const resolution = room.round.resolution!;
          resolution.mrWhiteGuess.pending = false;
          resolution.mrWhiteGuess.correct = false;
          resolution.mrWhiteGuess.deadlineAt = null;
          this.applyRoundOutcome(room, false);
        }
        this.advanceAfterResolution(room);
        break;
      default:
        break;
    }
  }

  private resolveVotePhase(room: ServerRoom) {
    if (!room.round) return;
    const suspectPlayerId = resolveSuspect(room.round.votes);
    const resolution: RoundResolutionView = {
      suspectPlayerId,
      revealedRoles: room.round.roles,
      votes: room.round.votes,
      pointsAwarded: {} as Record<string, number>,
      civilWord: room.round.wordPair.civilWord,
      undercoverWord: room.round.wordPair.undercoverWord,
      mrWhiteGuess: {
        pending: false,
        playerId: null as string | null,
        guess: null as string | null,
        correct: null as boolean | null,
        deadlineAt: null as number | null
      }
    };

    room.round.resolution = resolution;
    room.systemNotice = "Révélation du round.";

    const suspectRole = suspectPlayerId ? room.round.roles[suspectPlayerId] : null;
    if (suspectRole === "mr_white") {
      resolution.mrWhiteGuess.pending = true;
      resolution.mrWhiteGuess.playerId = suspectPlayerId;
      resolution.mrWhiteGuess.deadlineAt = Date.now() + 15_000;
      this.setPhase(room, "resolution", 15_000);
      return;
    }

    this.applyRoundOutcome(room, null);
    this.setPhase(room, "resolution", room.settings.resolutionSeconds * 1000);
  }

  private applyRoundOutcome(room: ServerRoom, mrWhiteGuessCorrect: boolean | null) {
    if (!room.round?.resolution || Object.keys(room.round.resolution.pointsAwarded).length > 0) {
      return;
    }
    const round = room.round!;
    const resolution = round.resolution!;
    const pointsAwarded = scoreRound({
      playerIds: room.players.map((player) => player.id),
      roles: round.roles,
      votes: round.votes,
      suspectPlayerId: resolution.suspectPlayerId,
      mrWhiteGuessCorrect
    });
    resolution.pointsAwarded = pointsAwarded;
    resolution.mrWhiteGuess.correct = mrWhiteGuessCorrect;

    const suspectRole = resolution.suspectPlayerId
      ? round.roles[resolution.suspectPlayerId]
      : null;
    const suspectId = resolution.suspectPlayerId;

    room.players.forEach((player) => {
      const role = round.roles[player.id];
      const vote = round.votes[player.id] ?? null;
      player.points += pointsAwarded[player.id] ?? 0;
      if (role === "undercover") {
        player.stats.pointsAsUndercover += pointsAwarded[player.id] ?? 0;
      }
      if (vote && round.roles[vote] === "undercover") {
        player.stats.correctVotes += 1;
      }
      if (suspectId && vote === suspectId) {
        player.stats.followedMajority += 1;
      }
      if (suspectId === player.id && suspectRole === "civil") {
        player.stats.accusedAsInnocent += 1;
      }
    });

    this.emitRoomState(room);
  }

  private scheduleAfterResolution(room: ServerRoom) {
    this.clearRoomTimeout(room);
    room.phaseEndsAt = Date.now() + room.settings.resolutionSeconds * 1000;
    room.timeoutHandle = setTimeout(
      () => this.advanceAfterResolution(room),
      room.settings.resolutionSeconds * 1000
    );
  }

  private advanceAfterResolution(room: ServerRoom) {
    this.archiveRound(room);
    if (room.currentRound >= room.settings.rounds) {
      room.finalResults = this.buildFinalResults(room);
      room.status = "final";
      this.setPhase(room, "final", null);
      room.systemNotice = "Partie terminée.";
      return;
    }

    room.currentRound += 1;
    this.beginRound(room);
  }

  private buildFinalResults(room: ServerRoom): FinalResultsView {
    const leaderboard = [...room.players]
      .sort((a, b) => b.points - a.points)
      .map((player, index) => ({
        playerId: player.id,
        points: player.points,
        rank: index + 1
      }));

    const awards = buildAwards({
      playerIds: room.players.map((player) => player.id),
      playerNames: Object.fromEntries(room.players.map((player) => [player.id, player.profile.name])),
      playerStats: Object.fromEntries(room.players.map((player) => [player.id, player.stats]))
    });

    return { leaderboard, awards, rounds: room.completedRounds };
  }

  private resetRoomToLobby(room: ServerRoom, notice: string) {
    room.status = "lobby";
    room.phase = "lobby";
    room.phaseEndsAt = null;
    room.currentRound = 0;
    room.round = null;
    room.completedRounds = [];
    room.finalResults = null;
    room.systemNotice = notice;
    room.usedWordPairIds = [];
    room.players.forEach((player) => {
      player.ready = false;
      player.points = 0;
      player.stats = createEmptyStats();
    });
    this.clearRoomTimeout(room);
    this.emitRoomState(room);
  }

  private emitRoomState(room: ServerRoom) {
    room.players.forEach((player) => {
      if (!player.socketId) return;
      this.io.to(player.socketId).emit("room_state", this.serializeRoom(room, player.id));
    });
  }

  private serializeRoom(room: ServerRoom, selfId: string): RoomView {
    return {
      roomCode: room.code,
      selfId,
      status: room.status,
      phase: room.phase,
      phaseEndsAt: room.phaseEndsAt,
      createdAt: room.createdAt,
      settings: room.settings,
      players: room.players
        .slice()
        .sort((a, b) => a.joinedAt - b.joinedAt)
        .map((player) => ({
          id: player.id,
          profile: player.profile,
          isHost: player.isHost,
          connected: player.connected,
          ready: player.ready,
          points: player.points,
          stats: player.stats
        })),
      currentRound: room.currentRound,
      totalRounds: room.settings.rounds,
      roleConfirmedPlayerIds: room.round ? [...room.round.roleConfirmedPlayerIds] : [],
      roomChat: room.lobbyChat,
      round: room.round
        ? {
            roundNumber: room.round.roundNumber,
            role: {
              ownRole: room.round.roles[selfId] ?? null,
              ownWord: room.round.words[selfId] ?? null
            },
            drawings: room.round.drawings,
            selfVote: room.round.votes[selfId] ?? null,
            votedPlayerIds: [...room.round.submittedVotePlayerIds],
            liveVotes: room.phase === "vote" || room.phase === "resolution" || room.phase === "final"
              ? Object.fromEntries(
                  Object.entries(room.round.votes).filter(([, target]) => target !== null)
                )
              : {},
            pointers: room.round.pointers,
            readyForPhaseAdvance: [...room.round.readyForPhaseAdvance],
            reactions: room.round.reactions,
            chat: room.round.chat,
            resolution: room.phase === "resolution" || room.phase === "final" ? room.round.resolution : null
          }
        : null,
      finalResults: room.finalResults,
      systemNotice: room.systemNotice
    };
  }

  private archiveRound(room: ServerRoom) {
    const round = room.round;
    if (!round || !round.resolution) {
      return;
    }
    if (room.completedRounds.some((entry) => entry.roundNumber === round.roundNumber)) {
      return;
    }

    room.completedRounds.push({
      roundNumber: round.roundNumber,
      civilWord: round.wordPair.civilWord,
      undercoverWord: round.wordPair.undercoverWord,
      suspectPlayerId: round.resolution.suspectPlayerId,
      revealedRoles: round.resolution.revealedRoles,
      votes: round.resolution.votes,
      pointsAwarded: round.resolution.pointsAwarded,
      drawingSnapshots: Object.fromEntries(
        Object.entries(round.drawings).map(([playerId, drawing]) => [playerId, drawing.snapshot])
      )
    });
  }

  private createPlayer(params: {
    id: string;
    clientId: string;
    socketId: string;
    profile: PlayerProfile;
    isHost: boolean;
  }): ServerPlayer {
    const now = Date.now();
    return {
      id: params.id,
      clientId: params.clientId,
      socketId: params.socketId,
      connected: true,
      isHost: params.isHost,
      ready: params.isHost,
      joinedAt: now,
      lastActiveAt: now,
      lastChatAt: 0,
      profile: normalizeProfile(params.profile),
      points: 0,
      stats: createEmptyStats()
    };
  }

  private findPlayer(roomCode: string, clientId: string) {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;
    const player = room.players.find((entry) => entry.clientId === clientId);
    if (!player) return null;
    return { room, player };
  }

  private findRoomBySocketId(socketId: string) {
    for (const room of this.rooms.values()) {
      const player = room.players.find((entry) => entry.socketId === socketId);
      if (player) {
        return { room, player };
      }
    }
    return null;
  }

  private ensureHost(room: ServerRoom) {
    const currentHost = room.players.find((player) => player.id === room.hostId && player.connected);
    if (currentHost) return;

    room.players.forEach((player) => {
      player.isHost = false;
    });
    const nextHost = room.players
      .filter((player) => player.connected)
      .sort((a, b) => a.joinedAt - b.joinedAt)[0];
    if (nextHost) {
      nextHost.isHost = true;
      room.hostId = nextHost.id;
      room.systemNotice = `${nextHost.profile.name} devient hôte.`;
    }
  }

  private clearRoomTimeout(room: ServerRoom) {
    if (room.timeoutHandle) {
      clearTimeout(room.timeoutHandle);
      room.timeoutHandle = null;
    }
  }

  private touch(player: ServerPlayer) {
    player.lastActiveAt = Date.now();
  }

  private sendErrorToPlayer(player: ServerPlayer, message: string) {
    if (!player.socketId) return;
    this.io.to(player.socketId).emit("server_error", message);
  }
}
