import { createRandomProfile } from "@shared/game";
import type { PlayerProfile } from "@shared/protocol";

const CLIENT_ID_KEY = "inkognito-tab-client-id";
const PROFILE_KEY = "inkognito-profile";

export function ensureClientId() {
  const existing = window.sessionStorage.getItem(CLIENT_ID_KEY);
  if (existing) return existing;
  const value = crypto.randomUUID();
  window.sessionStorage.setItem(CLIENT_ID_KEY, value);
  return value;
}

export function getStoredProfile() {
  const raw = window.localStorage.getItem(PROFILE_KEY);
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
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getRoomCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("room")?.toUpperCase() ?? null;
}

export function setRoomCodeInUrl(roomCode: string | null) {
  const url = new URL(window.location.href);
  if (roomCode) {
    url.searchParams.set("room", roomCode);
  } else {
    url.searchParams.delete("room");
  }
  window.history.replaceState({}, "", url);
}
