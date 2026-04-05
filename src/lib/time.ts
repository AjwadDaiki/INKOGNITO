export function formatRemainingTime(endsAt: number | null) {
  if (!endsAt) return "--";
  const seconds = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function isEndingSoon(endsAt: number | null, thresholdSeconds = 10) {
  if (!endsAt) return false;
  return endsAt - Date.now() <= thresholdSeconds * 1000;
}
