import { useState } from "react";
import { motion } from "framer-motion";
import type { PlayerProfile } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { ProfileEditor } from "@/components/ui/ProfileEditor";

export function HomeScreen({
  profile,
  loading,
  error,
  onProfileChange,
  onCreate,
  onJoin
}: {
  profile: PlayerProfile;
  loading: boolean;
  error: string | null;
  onProfileChange: (patch: Partial<PlayerProfile>) => void;
  onCreate: () => void;
  onJoin: (roomCode: string) => void;
}) {
  const [accessValue, setAccessValue] = useState("");

  function extractRoomCode(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    try {
      const url = new URL(trimmed);
      return url.searchParams.get("room")?.toUpperCase() ?? "";
    } catch {
      return trimmed.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    }
  }

  const normalizedRoomCode = extractRoomCode(accessValue);

  return (
    <div className="flex h-[100svh] flex-col items-center justify-center overflow-hidden p-4">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-5 text-center"
      >
        <h1 className="font-display text-6xl font-extrabold tracking-[-0.04em] text-ink-950 md:text-8xl">
          INKOGNITO
        </h1>
        <p className="mt-1 text-sm font-medium text-ink-500">Imposteur dessin</p>
      </motion.div>

      {/* Single card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bento-card w-full max-w-lg p-5"
      >
        <ProfileEditor profile={profile} onChange={onProfileChange} compact hideColor />

        <div className="mt-4 flex flex-col gap-3">
          <input
            value={accessValue}
            onChange={(e) => setAccessValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && normalizedRoomCode.length === 6 && !loading) {
                onJoin(normalizedRoomCode);
              }
            }}
            placeholder="Code ou lien d'invitation..."
            className="min-h-11 w-full rounded-2xl bg-surface-low px-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-300 focus:bg-surface-high"
          />

          <div className="grid grid-cols-2 gap-2">
            <Button fullWidth onClick={onCreate} disabled={loading}>
              {loading ? "..." : "Creer une salle"}
            </Button>
            <Button
              fullWidth
              tone="secondary"
              onClick={() => onJoin(normalizedRoomCode)}
              disabled={normalizedRoomCode.length < 6 || loading}
            >
              Rejoindre
            </Button>
          </div>

          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-tertiary-light px-4 py-3 text-sm font-medium text-tertiary"
            >
              {error}
            </motion.div>
          ) : null}
        </div>

        {/* Rules */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-ink-500">
          <div className="rounded-2xl bg-surface-low px-2 py-2.5">
            <div className="text-base">🎨</div>
            <div className="mt-1 font-semibold">Dessine</div>
          </div>
          <div className="rounded-2xl bg-surface-low px-2 py-2.5">
            <div className="text-base">🕵️</div>
            <div className="mt-1 font-semibold">Trouve l'intrus</div>
          </div>
          <div className="rounded-2xl bg-surface-low px-2 py-2.5">
            <div className="text-base">🗳️</div>
            <div className="mt-1 font-semibold">Vote</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
