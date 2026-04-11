import { io, type Socket } from "socket.io-client";
import { create } from "zustand";
import { normalizeProfile } from "@shared/game";
import type {
  ClientToServerEvents,
  DrawingStreamMessage,
  DrawingStroke,
  PlayerProfile,
  ReactionEmoji,
  RoomSettings,
  RoomView,
  ServerToClientEvents
} from "@shared/protocol";
import {
  ensureClientId,
  getRoomCodeFromUrl,
  getStoredProfile,
  persistProfile,
  setRoomCodeInUrl
} from "@/lib/session";

const socketUrl =
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : window.location.origin);

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

interface GameStoreState {
  clientId: string;
  profile: PlayerProfile;
  room: RoomView | null;
  loading: boolean;
  error: string | null;
  socketConnected: boolean;
  initialized: boolean;
  livePreviews: Record<string, DrawingStroke | null>;
  lightboxPlayerId: string | null;
  init: () => void;
  clearError: () => void;
  setLightboxPlayerId: (playerId: string | null) => void;
  updateProfile: (profile: Partial<PlayerProfile>) => void;
  createRoom: () => void;
  joinRoom: (roomCode: string) => void;
  autoJoinFromUrl: () => void;
  updateSettings: (settings: Partial<RoomSettings>) => void;
  toggleReady: () => void;
  startGame: () => void;
  confirmRole: () => void;
  readyForNextPhase: () => void;
  sendDrawingPreview: (stroke: DrawingStroke) => void;
  commitStroke: (stroke: DrawingStroke, snapshot: string | null) => void;
  undoStroke: () => void;
  clearDrawing: () => void;
  castVote: (targetPlayerId: string | null) => void;
  sendReaction: (targetPlayerId: string, emoji: ReactionEmoji) => void;
  pointFinger: (targetPlayerId: string | null) => void;
  sendChatMessage: (text: string) => void;
  submitMrWhiteGuess: (guess: string) => void;
  replayGame: () => void;
  returnToLobby: () => void;
}

function getSocket() {
  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: true,
      transports: ["websocket"],
      closeOnBeforeunload: true,
      reconnection: true,
      reconnectionAttempts: 50,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });
  }
  return socket;
}

function withRoomContext<T extends object>(payload: T, state: GameStoreState) {
  return {
    ...payload,
    roomCode: state.room?.roomCode,
    clientId: state.clientId
  };
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  clientId: ensureClientId(),
  profile: normalizeProfile(getStoredProfile()),
  room: null,
  loading: false,
  error: null,
  socketConnected: false,
  initialized: false,
  livePreviews: {},
  lightboxPlayerId: null,

  init: () => {
    if (get().initialized) return;
    const client = getSocket();
    client.on("connect", () => {
      set({ socketConnected: true });
      // Auto-rejoin room after reconnect
      const state = get();
      if (state.room) {
        client.emit(
          "join_room",
          {
            roomCode: state.room.roomCode,
            clientId: state.clientId,
            profile: state.profile
          },
          (response) => {
            if (!response.ok) {
              // Room no longer exists on server — reset to home
              set({ room: null, loading: false, error: null });
              setRoomCodeInUrl(null);
            }
          }
        );
      }
    });
    client.on("disconnect", () => set({ socketConnected: false }));
    client.on("room_state", (room) => {
      set((state) => ({
        room,
        loading: false,
        error: null,
        livePreviews: Object.fromEntries(
          Object.entries(state.livePreviews).filter(([playerId]) =>
            room.players.some((player) => player.id === playerId)
          )
        )
      }));
      setRoomCodeInUrl(room.roomCode);
    });
    client.on("drawing_stream", (message) => applyDrawingStreamMessage(message, set));
    client.on("server_error", (message) => set({ loading: false, error: message }));

    window.addEventListener("pagehide", () => {
      if (client.connected) {
        client.disconnect();
      }
    });

    set({ initialized: true });
  },

  clearError: () => set({ error: null }),
  setLightboxPlayerId: (lightboxPlayerId) => set({ lightboxPlayerId }),

  updateProfile: (profilePatch) => {
    const nextProfile = normalizeProfile({ ...get().profile, ...profilePatch });
    persistProfile(nextProfile);
    set({ profile: nextProfile });
    const room = get().room;
    if (!room) return;
    getSocket().emit("update_profile", {
      roomCode: room.roomCode,
      clientId: get().clientId,
      profile: nextProfile
    });
  },

  createRoom: () => {
    set({ loading: true, error: null });
    getSocket().emit(
      "create_room",
      { clientId: get().clientId, profile: get().profile },
      (response) => {
        if (!response.ok) {
          set({ loading: false, error: response.error ?? "Impossible de créer la room." });
          return;
        }
        setRoomCodeInUrl(response.roomCode ?? null);
      }
    );
  },

  joinRoom: (roomCode) => {
    const normalized = roomCode.trim().toUpperCase();
    if (!normalized) return;
    set({ loading: true, error: null });
    getSocket().emit(
      "join_room",
      {
        roomCode: normalized,
        clientId: get().clientId,
        profile: get().profile
      },
      (response) => {
        if (!response.ok) {
          if ((response.error ?? "").includes("Salon introuvable")) {
            setRoomCodeInUrl(null);
          }
          set({
            loading: false,
            error:
              response.error === "Salon introuvable."
                ? "Salon introuvable. En local, c'est normal si le serveur a redémarré ou si le lien est ancien."
                : response.error ?? "Impossible de rejoindre la room."
          });
          return;
        }
        setRoomCodeInUrl(response.roomCode ?? normalized);
      }
    );
  },

  autoJoinFromUrl: () => {
    const state = get();
    if (state.room || state.loading) return;
    const roomCode = getRoomCodeFromUrl();
    if (roomCode) {
      state.joinRoom(roomCode);
    }
  },

  updateSettings: (settings) => {
    if (!get().room) return;
    getSocket().emit("update_settings", withRoomContext({ settings }, get()));
  },

  toggleReady: () => {
    if (!get().room) return;
    getSocket().emit("toggle_ready", withRoomContext({}, get()));
  },

  startGame: () => {
    if (!get().room) return;
    getSocket().emit("start_game", withRoomContext({}, get()));
  },

  confirmRole: () => {
    if (!get().room) return;
    getSocket().emit("confirm_role", withRoomContext({}, get()));
  },

  readyForNextPhase: () => {
    if (!get().room) return;
    getSocket().emit("ready_for_next_phase", withRoomContext({}, get()));
  },

  sendDrawingPreview: (stroke) => {
    if (!get().room) return;
    getSocket().emit("drawing_stroke", withRoomContext({ stroke }, get()));
  },

  commitStroke: (stroke, snapshot) => {
    if (!get().room) return;
    getSocket().emit("commit_stroke", withRoomContext({ stroke, snapshot }, get()));
  },

  undoStroke: () => {
    if (!get().room) return;
    getSocket().emit("undo_stroke", withRoomContext({}, get()));
  },

  clearDrawing: () => {
    if (!get().room) return;
    getSocket().emit("clear_drawing", withRoomContext({}, get()));
  },

  castVote: (targetPlayerId) => {
    if (!get().room) return;
    getSocket().emit("cast_vote", withRoomContext({ targetPlayerId }, get()));
  },

  sendReaction: (targetPlayerId, emoji) => {
    if (!get().room) return;
    getSocket().emit("send_reaction", withRoomContext({ targetPlayerId, emoji }, get()));
  },

  pointFinger: (targetPlayerId) => {
    if (!get().room) return;
    getSocket().emit("point_finger", withRoomContext({ targetPlayerId }, get()));
  },

  sendChatMessage: (text) => {
    if (!get().room) return;
    getSocket().emit("chat_message", withRoomContext({ text }, get()));
  },

  submitMrWhiteGuess: (guess) => {
    if (!get().room) return;
    getSocket().emit("submit_mr_white_guess", withRoomContext({ guess }, get()));
  },

  replayGame: () => {
    if (!get().room) return;
    getSocket().emit("replay_game", withRoomContext({}, get()));
  },

  returnToLobby: () => {
    const room = get().room;
    if (!room) {
      setRoomCodeInUrl(null);
      return;
    }
    getSocket().emit("return_to_lobby", withRoomContext({}, get()));
  }
}));

function updateLivePreviews(
  prev: Record<string, DrawingStroke | null>,
  playerId: string,
  value: DrawingStroke | null
): Record<string, DrawingStroke | null> {
  // Avoid creating a new object if the value is already the same reference
  if (prev[playerId] === value) return prev;
  return { ...prev, [playerId]: value };
}

function applyDrawingStreamMessage(
  message: DrawingStreamMessage,
  set: (partial: Partial<GameStoreState> | ((state: GameStoreState) => Partial<GameStoreState>)) => void
) {
  set((state) => {
    if (message.type === "preview") {
      const next = updateLivePreviews(state.livePreviews, message.playerId, message.stroke ?? null);
      return next === state.livePreviews ? {} : { livePreviews: next };
    }

    const room = state.room;
    const round = room?.round;
    if (!room || !round) {
      const next = updateLivePreviews(state.livePreviews, message.playerId, null);
      return next === state.livePreviews ? {} : { livePreviews: next };
    }

    const currentDrawing = round.drawings[message.playerId];
    if (!currentDrawing) {
      const next = updateLivePreviews(state.livePreviews, message.playerId, null);
      return next === state.livePreviews ? {} : { livePreviews: next };
    }

    let nextDrawing = currentDrawing;
    if (message.type === "commit" && message.stroke) {
      nextDrawing = {
        ...currentDrawing,
        strokes: [...currentDrawing.strokes, message.stroke],
        lastUpdatedAt: Date.now()
      };
    } else if (message.type === "undo") {
      nextDrawing = {
        ...currentDrawing,
        strokes: currentDrawing.strokes.slice(0, -1),
        snapshot: null,
        lastUpdatedAt: Date.now()
      };
    } else if (message.type === "clear") {
      nextDrawing = {
        ...currentDrawing,
        strokes: [],
        snapshot: null,
        lastUpdatedAt: Date.now()
      };
    }

    const nextPreviews = updateLivePreviews(state.livePreviews, message.playerId, null);

    return {
      room:
        nextDrawing === currentDrawing
          ? room
          : {
              ...room,
              round: {
                ...round,
                drawings: {
                  ...round.drawings,
                  [message.playerId]: nextDrawing
                }
              }
            },
      ...(nextPreviews === state.livePreviews ? {} : { livePreviews: nextPreviews })
    };
  });
}
