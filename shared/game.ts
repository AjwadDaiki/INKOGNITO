import {
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  AVATAR_SHAPES,
  CHAT_MESSAGE_LIMIT,
  DEFAULT_SETTINGS,
  MAX_PLAYERS,
  MIN_PLAYERS,
  ROOM_CODE_ALPHABET
} from "./constants.js";
import type {
  AwardView,
  Difficulty,
  PlayerProfile,
  PlayerRole,
  PlayerStatsView,
  RoomSettings,
  WordPair
} from "./protocol.js";
import { BASE_WORD_PAIRS } from "./words.js";

export function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function sanitizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, 18) || "Inconnu";
}

export function sanitizeChatMessage(message: string) {
  return message.trim().slice(0, CHAT_MESSAGE_LIMIT);
}

export function generateRoomCode(existingCodes: Set<string>) {
  let code = "";
  do {
    code = Array.from({ length: 6 }, () =>
      ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]
    ).join("");
  } while (existingCodes.has(code));
  return code;
}

export function clampSettings(settings?: Partial<RoomSettings>): RoomSettings {
  return {
    mode: settings?.mode === "mr_white" ? "mr_white" : DEFAULT_SETTINGS.mode,
    rounds: clampNumber(settings?.rounds ?? DEFAULT_SETTINGS.rounds, 3, 5),
    drawingSeconds: [30, 45, 60, 90].includes(settings?.drawingSeconds ?? 45)
      ? (settings?.drawingSeconds ?? 45)
      : DEFAULT_SETTINGS.drawingSeconds,
    discussionSeconds: clampNumber(
      settings?.discussionSeconds ?? DEFAULT_SETTINGS.discussionSeconds,
      20,
      60
    ),
    voteSeconds: clampNumber(settings?.voteSeconds ?? DEFAULT_SETTINGS.voteSeconds, 20, 45),
    gallerySeconds: clampNumber(
      settings?.gallerySeconds ?? DEFAULT_SETTINGS.gallerySeconds,
      8,
      20
    ),
    resolutionSeconds: clampNumber(
      settings?.resolutionSeconds ?? DEFAULT_SETTINGS.resolutionSeconds,
      8,
      20
    ),
    difficulty: normalizeDifficulty(settings?.difficulty),
    customWordPairs: (settings?.customWordPairs ?? [])
      .map((pair, index) => sanitizeWordPair(pair, index))
      .filter((pair): pair is WordPair => pair !== null)
  };
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeDifficulty(value?: Difficulty): Difficulty {
  if (value === "easy" || value === "normal" || value === "hard") {
    return value;
  }
  return "random";
}

function sanitizeWordPair(pair: WordPair, index: number): WordPair | null {
  const civilWord = pair.civilWord?.trim();
  const undercoverWord = pair.undercoverWord?.trim();
  if (!civilWord || !undercoverWord) {
    return null;
  }
  return {
    id: pair.id || `custom-${index}-${civilWord.toLowerCase()}-${undercoverWord.toLowerCase()}`,
    civilWord: civilWord.slice(0, 24),
    undercoverWord: undercoverWord.slice(0, 24),
    difficulty: normalizeDifficulty(pair.difficulty) === "random" ? "normal" : pair.difficulty,
    category: pair.category?.trim() || "Custom",
    custom: true
  };
}

export function createRandomProfile(): PlayerProfile {
  return {
    name: `Player ${Math.floor(Math.random() * 90) + 10}`,
    emoji: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    shape: AVATAR_SHAPES[Math.floor(Math.random() * AVATAR_SHAPES.length)]
  };
}

export function normalizeProfile(profile: PlayerProfile): PlayerProfile {
  return {
    name: sanitizeName(profile.name),
    emoji: AVATAR_EMOJIS.includes(profile.emoji) ? profile.emoji : AVATAR_EMOJIS[0],
    color: AVATAR_COLORS.includes(profile.color) ? profile.color : AVATAR_COLORS[0],
    shape: AVATAR_SHAPES.includes(profile.shape) ? profile.shape : AVATAR_SHAPES[0]
  };
}

export function canStartGame(readyCount: number, playerCount: number) {
  return playerCount >= MIN_PLAYERS && playerCount <= MAX_PLAYERS && readyCount >= MIN_PLAYERS;
}

export function getRoleCounts(playerCount: number, mode: RoomSettings["mode"]) {
  const undercoverCount = playerCount <= 6 ? 1 : 2;
  if (mode === "classic") {
    return { undercoverCount, mrWhiteCount: 0 };
  }
  if (playerCount <= 5) {
    return { undercoverCount: 1, mrWhiteCount: 0 };
  }
  if (playerCount <= 7) {
    return { undercoverCount: 1, mrWhiteCount: 1 };
  }
  if (playerCount <= 10) {
    return { undercoverCount: 2, mrWhiteCount: 1 };
  }
  return { undercoverCount: 2, mrWhiteCount: 2 };
}

export function assignRoles(playerIds: string[], mode: RoomSettings["mode"]) {
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
  const { undercoverCount, mrWhiteCount } = getRoleCounts(playerIds.length, mode);
  const assignments = new Map<string, PlayerRole>();

  shuffled.forEach((id) => assignments.set(id, "civil"));
  shuffled.slice(0, undercoverCount).forEach((id) => assignments.set(id, "undercover"));
  shuffled
    .slice(undercoverCount, undercoverCount + mrWhiteCount)
    .forEach((id) => assignments.set(id, "mr_white"));

  return assignments;
}

export function pickWordPair(settings: RoomSettings, usedIds: string[]) {
  const pool = [...BASE_WORD_PAIRS, ...settings.customWordPairs];
  const filtered = pool.filter((pair) => {
    if (usedIds.includes(pair.id)) {
      return false;
    }
    if (settings.difficulty === "random") {
      return true;
    }
    return pair.difficulty === settings.difficulty;
  });
  const source = filtered.length > 0 ? filtered : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export function createEmptyStats(): PlayerStatsView {
  return {
    correctVotes: 0,
    pointsAsUndercover: 0,
    followedMajority: 0,
    accusedAsInnocent: 0,
    totalPointedAt: 0,
    reactionCounts: {}
  };
}

export function resolveSuspect(votes: Record<string, string | null>) {
  const counts = new Map<string, number>();
  for (const targetId of Object.values(votes)) {
    if (!targetId) continue;
    counts.set(targetId, (counts.get(targetId) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) {
    return null;
  }
  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) {
    return null;
  }
  return ranked[0][0];
}

export function scoreRound(params: {
  playerIds: string[];
  roles: Record<string, PlayerRole>;
  votes: Record<string, string | null>;
  suspectPlayerId: string | null;
  mrWhiteGuessCorrect: boolean | null;
}) {
  const { playerIds, roles, votes, suspectPlayerId, mrWhiteGuessCorrect } = params;
  const result: Record<string, number> = Object.fromEntries(playerIds.map((id) => [id, 0]));
  const undercoverIds = playerIds.filter((id) => roles[id] === "undercover");
  const mrWhiteIds = playerIds.filter((id) => roles[id] === "mr_white");
  const suspectRole = suspectPlayerId ? roles[suspectPlayerId] : null;

  playerIds.forEach((playerId) => {
    if (roles[playerId] === "civil" && votes[playerId] && roles[votes[playerId] as string] === "undercover") {
      result[playerId] += 2;
    }
  });

  if (suspectRole === "undercover") {
    playerIds.forEach((playerId) => {
      if (roles[playerId] === "civil") {
        result[playerId] += 1;
      }
    });
  }

  const undercoversAvoidedDetection = suspectRole !== "undercover";
  if (undercoversAvoidedDetection) {
    undercoverIds.forEach((playerId) => {
      result[playerId] += 3;
    });
  }

  if (suspectRole === "civil") {
    undercoverIds.forEach((playerId) => {
      result[playerId] += 1;
    });
  }

  if (mrWhiteIds.length > 0) {
    mrWhiteIds.forEach((playerId) => {
      if (playerId !== suspectPlayerId) {
        result[playerId] += 2;
      }
    });
  }

  if (mrWhiteGuessCorrect) {
    mrWhiteIds.forEach((playerId) => {
      if (playerId === suspectPlayerId) {
        result[playerId] += 2;
      }
    });
  }

  return result;
}

export function buildAwards(params: {
  playerIds: string[];
  playerNames: Record<string, string>;
  playerStats: Record<string, PlayerStatsView>;
}) {
  const { playerIds, playerNames, playerStats } = params;
  return [
    awardFromMetric("best_artist", "🎨 Meilleur dessinateur", playerIds, playerNames, playerStats, (stats) => stats.reactionCounts["🎨"] ?? 0, "Le plus de réactions 🎨"),
    awardFromMetric("worst_artist", "🤡 Pire dessinateur", playerIds, playerNames, playerStats, (stats) => stats.reactionCounts["💀"] ?? 0, "Le plus de réactions 💀"),
    awardFromMetric("detective", "🕵️ Meilleur détective", playerIds, playerNames, playerStats, (stats) => stats.correctVotes, "Le plus de votes justes"),
    awardFromMetric("liar", "🎭 Meilleur menteur", playerIds, playerNames, playerStats, (stats) => stats.pointsAsUndercover, "Le plus de points undercover"),
    awardFromMetric("sheep", "🐑 Mouton du groupe", playerIds, playerNames, playerStats, (stats) => stats.followedMajority, "Suit souvent la majorité"),
    awardFromMetric("scapegoat", "😱 Bouc émissaire", playerIds, playerNames, playerStats, (stats) => stats.accusedAsInnocent, "Souvent accusé à tort")
  ];
}

function awardFromMetric(
  key: string,
  title: string,
  playerIds: string[],
  playerNames: Record<string, string>,
  playerStats: Record<string, PlayerStatsView>,
  getter: (stats: PlayerStatsView) => number,
  subtitle: string
): AwardView {
  const sorted = [...playerIds]
    .map((playerId) => ({ playerId, value: getter(playerStats[playerId]) }))
    .sort((a, b) => b.value - a.value);
  const winner = sorted[0];
  return {
    key,
    title,
    playerId: winner && winner.value > 0 ? winner.playerId : null,
    subtitle
  };
}
