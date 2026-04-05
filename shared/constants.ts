export const ROOM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export const AVATAR_EMOJIS = [
  "🦊",
  "👻",
  "🎮",
  "💀",
  "🔥",
  "🌙",
  "🎭",
  "🍕",
  "🎨",
  "🧠",
  "⚡",
  "🦄"
] as const;

export const AVATAR_COLORS = [
  "#7B2FFF",
  "#00F0FF",
  "#FF2D78",
  "#00FF88",
  "#F59E0B",
  "#14B8A6",
  "#FB7185",
  "#38BDF8"
] as const;

export const AVATAR_SHAPES = ["circle", "rounded", "hex", "diamond"] as const;

export const REACTION_EMOJIS = ["😂", "🤔", "🎨", "💀", "👀", "🧠", "🤡", "🔥"] as const;

export const DRAWING_TOOLS = ["pen", "brush", "fill", "eraser"] as const;

export const DRAWING_COLORS = [
  "#111111",
  "#7C4A1F",
  "#E11D48",
  "#F97316",
  "#FACC15",
  "#22C55E",
  "#2563EB",
  "#7C3AED",
  "#FFFFFF",
  "#9CA3AF",
  "#EC4899",
  "#FDBA74",
  "#EAB308",
  "#86EFAC",
  "#7DD3FC",
  "#C4B5FD"
] as const;

export const DEFAULT_SETTINGS = {
  mode: "classic",
  drawingSeconds: 45,
  discussionSeconds: 40,
  voteSeconds: 30,
  gallerySeconds: 12,
  resolutionSeconds: 10,
  rounds: 3,
  difficulty: "random"
} as const;

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;

export const CHAT_MESSAGE_LIMIT = 100;
export const CHAT_COOLDOWN_MS = 2_000;
export const DRAWING_SIZE = 600;
export const DRAWING_PREVIEW_SIZE = 240;
