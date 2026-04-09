import type { PlayerRole, RoomView } from "@shared/protocol";

export function phaseBg(phase: RoomView["phase"]) {
  if (phase === "drawing") return "bg-primary-light text-ink-950";
  if (phase === "vote") return "bg-[#FEF3C7] text-[#92400e]";
  if (phase === "resolution") return "bg-tertiary-light text-tertiary";
  return "bg-surface-low text-ink-700";
}

export function phaseLabel(phase: RoomView["phase"]) {
  if (phase === "drawing") return "Dessin";
  if (phase === "gallery") return "Galerie";
  if (phase === "discussion") return "Discussion";
  if (phase === "vote") return "Vote";
  if (phase === "resolution") return "Verdict";
  return phase;
}

export function phaseSubtitle(phase: RoomView["phase"]) {
  if (phase === "drawing") return "Dessine ton mot";
  if (phase === "gallery") return "Observe les dessins";
  if (phase === "discussion") return "Clique sur un dessin pour accuser";
  if (phase === "vote") return "Selectionne puis confirme ton vote";
  if (phase === "resolution") return "Qui etait l'imposteur ?";
  return "";
}

export function roleBadge(role: PlayerRole | null | undefined) {
  if (role === "undercover") return { label: "UNDERCOVER", bg: "bg-tertiary-light text-tertiary" };
  if (role === "mr_white") return { label: "MR.WHITE", bg: "bg-[#FEF3C7] text-[#92400e]" };
  if (role === "civil") return { label: "CIVIL", bg: "bg-[#dcfce7] text-[#15803d]" };
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
  if (n <= 2) return 240;
  if (n <= 4) return 200;
  if (n <= 6) return 170;
  return 150;
}
