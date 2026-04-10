import type { PlayerRole, RoomView } from "@shared/protocol";

export function phaseBg(phase: RoomView["phase"]) {
  if (phase === "drawing") return "bg-primary-light text-ink-950";
  if (phase === "vote") return "bg-[#f5e8c0] text-[#8B6914]";
  if (phase === "resolution") return "bg-tertiary-light text-tertiary";
  return "bg-surface-low text-ink-700";
}

export function phaseLabel(phase: RoomView["phase"]) {
  if (phase === "drawing") return "Dessin";
  if (phase === "gallery") return "Galerie";
  if (phase === "vote") return "Vote";
  if (phase === "resolution") return "Verdict";
  return phase;
}

export function phaseSubtitle(phase: RoomView["phase"]) {
  if (phase === "drawing") return "Dessine ton mot";
  if (phase === "gallery") return "Observe les dessins";
  if (phase === "vote") return "Vote pour le suspect";
  if (phase === "resolution") return "Qui etait l'imposteur ?";
  return "";
}

export function roleBadge(role: PlayerRole | null | undefined) {
  if (role === "undercover") return { label: "UNDERCOVER", bg: "bg-tertiary-light text-tertiary" };
  if (role === "mr_white") return { label: "MR.WHITE", bg: "bg-[#f5e8c0] text-[#8B6914]" };
  if (role === "civil") return { label: "CIVIL", bg: "bg-[#e0eddb] text-[#3d6b30]" };
  return null;
}

/** Grid cols for right panel (drawing phase — others only) */
export function drawingCols(n: number) {
  if (n <= 1) return 1;
  if (n <= 4) return 2;
  return 3;
}

/** Grid cols for full-width (non-drawing — all players) */
export function fullCols(n: number, mobile = false) {
  if (mobile) {
    if (n <= 2) return n;
    return 2;
  }
  if (n <= 2) return n;
  if (n <= 4) return 2;
  if (n <= 6) return 3;
  return 4;
}

export function previewSize(n: number) {
  if (n <= 2) return 340;
  if (n <= 4) return 300;
  if (n <= 6) return 250;
  return 210;
}
