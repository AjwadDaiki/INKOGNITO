import { createRandomProfile } from "@shared/game";
import type { PlayerProfile } from "@shared/protocol";

const CLIENT_ID_KEY = "inkognito-tab-client-id";
const PROFILE_KEY = "inkognito-profile";

function canUseWindow() {
  return typeof window !== "undefined";
}

function safeSessionStorage() {
  if (!canUseWindow()) return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function safeLocalStorage() {
  if (!canUseWindow()) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function ensureClientId() {
  // Use sessionStorage so each tab gets its own ID (allows multi-tab testing).
  // Fall back to a fresh ID if sessionStorage is unavailable.
  // On page refresh the same tab keeps its ID → reconnection still works.
  const session = safeSessionStorage();
  const existing = session?.getItem(CLIENT_ID_KEY);
  if (existing) return existing;
  const value =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `client_${Math.random().toString(36).slice(2, 10)}`;
  session?.setItem(CLIENT_ID_KEY, value);
  return value;
}

export function getStoredProfile() {
  const storage = safeLocalStorage();
  const raw = storage?.getItem(PROFILE_KEY);
  if (!raw) {
    const fallback = createRandomProfile();
    persistProfile(fallback);
    return fallback;
  }
  try {
    return JSON.parse(raw) as PlayerProfile;
  } catch {
    const fallback = createRandomProfile();
    persistProfile(fallback);
    return fallback;
  }
}

export function persistProfile(profile: PlayerProfile) {
  safeLocalStorage()?.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getRoomCodeFromUrl() {
  if (!canUseWindow()) return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("room")?.toUpperCase() ?? null;
}

export function setRoomCodeInUrl(roomCode: string | null) {
  if (!canUseWindow()) return;
  const url = new URL(window.location.href);
  if (roomCode) {
    url.searchParams.set("room", roomCode);
  } else {
    url.searchParams.delete("room");
  }
  window.history.replaceState({}, "", url);
}
