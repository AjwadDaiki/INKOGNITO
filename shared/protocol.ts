import type {
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  AVATAR_SHAPES,
  DRAWING_TOOLS,
  REACTION_EMOJIS
} from "./constants.js";

export type GameMode = "classic" | "mr_white";
export type Difficulty = "easy" | "normal" | "hard" | "random";
export type GameStatus = "lobby" | "in_game" | "final";
export type GamePhase =
  | "lobby"
  | "role_reveal"
  | "drawing"
  | "gallery"
  | "discussion"
  | "vote"
  | "resolution"
  | "final";
export type PlayerRole = "civil" | "undercover" | "mr_white";
export type AvatarEmoji = (typeof AVATAR_EMOJIS)[number];
export type AvatarColor = (typeof AVATAR_COLORS)[number];
export type AvatarShape = (typeof AVATAR_SHAPES)[number];
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];
export type DrawingTool = (typeof DRAWING_TOOLS)[number];

export interface PlayerProfile {
  name: string;
  emoji: AvatarEmoji;
  color: AvatarColor;
  shape: AvatarShape;
}

export interface RoomSettings {
  mode: GameMode;
  rounds: number;
  drawingSeconds: number;
  discussionSeconds: number;
  voteSeconds: number;
  gallerySeconds: number;
  resolutionSeconds: number;
  difficulty: Difficulty;
  customWordPairs: WordPair[];
}

export interface WordPair {
  id: string;
  civilWord: string;
  undercoverWord: string;
  difficulty: Exclude<Difficulty, "random">;
  category: string;
  custom?: boolean;
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  playerId: string;
  tool: DrawingTool;
  color: string;
  size: number;
  points: StrokePoint[];
  createdAt: number;
}

export interface DrawingStateView {
  strokes: DrawingStroke[];
  snapshot: string | null;
  lastUpdatedAt: number | null;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  text: string;
  createdAt: number;
  scope: "lobby" | "game";
  flair?: "gg" | "sus" | "rip";
}

export interface ReactionEvent {
  id: string;
  fromPlayerId: string;
  targetPlayerId: string;
  emoji: ReactionEmoji;
  createdAt: number;
}

export interface RoundRoleView {
  ownRole: PlayerRole | null;
  ownWord: string | null;
}

export interface PlayerStatsView {
  correctVotes: number;
  pointsAsUndercover: number;
  followedMajority: number;
  accusedAsInnocent: number;
  totalPointedAt: number;
  reactionCounts: Partial<Record<ReactionEmoji, number>>;
}

export interface PlayerView {
  id: string;
  profile: PlayerProfile;
  isHost: boolean;
  connected: boolean;
  ready: boolean;
  points: number;
  stats: PlayerStatsView;
}

export interface RoundResolutionView {
  suspectPlayerId: string | null;
  revealedRoles: Record<string, PlayerRole>;
  votes: Record<string, string | null>;
  pointsAwarded: Record<string, number>;
  civilWord: string;
  undercoverWord: string;
  mrWhiteGuess: {
    pending: boolean;
    playerId: string | null;
    guess: string | null;
    correct: boolean | null;
    deadlineAt: number | null;
  };
}

export interface RoundView {
  roundNumber: number;
  role: RoundRoleView;
  drawings: Record<string, DrawingStateView>;
  selfVote: string | null;
  votedPlayerIds: string[];
  pointers: Record<string, string | null>;
  readyForPhaseAdvance: string[];
  reactions: ReactionEvent[];
  chat: ChatMessage[];
  resolution: RoundResolutionView | null;
}

export interface AwardView {
  key: string;
  title: string;
  playerId: string | null;
  subtitle: string;
}

export interface CompletedRoundView {
  roundNumber: number;
  civilWord: string;
  undercoverWord: string;
  suspectPlayerId: string | null;
  revealedRoles: Record<string, PlayerRole>;
  votes: Record<string, string | null>;
  pointsAwarded: Record<string, number>;
  drawingSnapshots: Record<string, string | null>;
}

export interface FinalResultsView {
  leaderboard: Array<{
    playerId: string;
    points: number;
    rank: number;
  }>;
  awards: AwardView[];
  rounds: CompletedRoundView[];
}

export interface RoomView {
  roomCode: string;
  selfId: string | null;
  status: GameStatus;
  phase: GamePhase;
  phaseEndsAt: number | null;
  createdAt: number;
  settings: RoomSettings;
  players: PlayerView[];
  currentRound: number;
  totalRounds: number;
  roleConfirmedPlayerIds: string[];
  roomChat: ChatMessage[];
  round: RoundView | null;
  finalResults: FinalResultsView | null;
  systemNotice: string | null;
}

export interface DrawingStreamMessage {
  type: "preview" | "commit" | "undo" | "clear";
  playerId: string;
  stroke?: DrawingStroke;
}

export interface CreateRoomPayload {
  profile: PlayerProfile;
  clientId: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  profile: PlayerProfile;
  clientId: string;
}

export interface UpdateProfilePayload {
  roomCode: string;
  clientId: string;
  profile: PlayerProfile;
}

export interface UpdateSettingsPayload {
  roomCode: string;
  clientId: string;
  settings: Partial<RoomSettings>;
}

export interface ClientRoomAck {
  ok: boolean;
  roomCode?: string;
  selfId?: string;
  error?: string;
}

export interface ClientToServerEvents {
  create_room: (
    payload: CreateRoomPayload,
    callback: (response: ClientRoomAck) => void
  ) => void;
  join_room: (
    payload: JoinRoomPayload,
    callback: (response: ClientRoomAck) => void
  ) => void;
  update_profile: (payload: UpdateProfilePayload) => void;
  update_settings: (payload: UpdateSettingsPayload) => void;
  toggle_ready: (payload: { roomCode: string; clientId: string }) => void;
  start_game: (payload: { roomCode: string; clientId: string }) => void;
  confirm_role: (payload: { roomCode: string; clientId: string }) => void;
  ready_for_next_phase: (payload: { roomCode: string; clientId: string }) => void;
  drawing_stroke: (
    payload: { roomCode: string; clientId: string; stroke: DrawingStroke }
  ) => void;
  commit_stroke: (
    payload: {
      roomCode: string;
      clientId: string;
      stroke: DrawingStroke;
      snapshot: string | null;
    }
  ) => void;
  undo_stroke: (payload: { roomCode: string; clientId: string }) => void;
  clear_drawing: (payload: { roomCode: string; clientId: string }) => void;
  cast_vote: (
    payload: { roomCode: string; clientId: string; targetPlayerId: string | null }
  ) => void;
  send_reaction: (
    payload: {
      roomCode: string;
      clientId: string;
      targetPlayerId: string;
      emoji: ReactionEmoji;
    }
  ) => void;
  point_finger: (
    payload: { roomCode: string; clientId: string; targetPlayerId: string | null }
  ) => void;
  chat_message: (
    payload: { roomCode: string; clientId: string; text: string }
  ) => void;
  submit_mr_white_guess: (
    payload: { roomCode: string; clientId: string; guess: string }
  ) => void;
  replay_game: (payload: { roomCode: string; clientId: string }) => void;
  return_to_lobby: (payload: { roomCode: string; clientId: string }) => void;
}

export interface ServerToClientEvents {
  room_state: (room: RoomView) => void;
  drawing_stream: (message: DrawingStreamMessage) => void;
  server_error: (message: string) => void;
}
