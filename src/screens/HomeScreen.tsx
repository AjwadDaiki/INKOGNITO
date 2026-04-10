import { useState } from "react";
import { motion } from "framer-motion";
import type { PlayerProfile } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { ProfileEditor } from "@/components/ui/ProfileEditor";
import { InkSplatter } from "@/components/ui/InkSplatter";

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
    <div className="relative flex h-[100svh] items-center justify-center overflow-hidden p-4 md:p-6">
      <InkSplatter variant={0} className="left-[4%] top-[4%]" size={220} opacity={0.08} />
      <InkSplatter variant={1} className="bottom-[4%] right-[4%]" size={210} opacity={0.09} />

      <motion.div
        initial={{ opacity: 0, y: 28, rotate: -1.4 }}
        animate={{ opacity: 1, y: 0, rotate: -0.8 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="paper-sheet notebook-page desk-shadow animate-page-settle relative w-full max-w-2xl overflow-hidden px-6 py-7 md:px-10 md:py-9"
      >
        <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(90,68,47,0.08),transparent)]" />
        <div className="absolute -right-10 top-8 h-24 w-24 rounded-full bg-ink-950/10" />
        <div className="absolute bottom-10 left-8 h-14 w-14 rounded-full bg-ink-950/6" />

        <div className="pl-7 md:pl-10">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className="font-sketch text-6xl font-bold leading-none text-ink-950 md:text-8xl"
            >
              Inkognito
            </motion.h1>
            <p className="mt-2 font-sketch text-2xl text-ink-700 md:text-3xl">
              Carnet de croquis tache d&apos;encre
            </p>
          </div>

          <div className="paper-divider my-6" />

          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div>
                <div className="mb-2 font-sketch text-2xl font-semibold text-ink-900">
                  Entrer dans la partie
                </div>
                <input
                  value={accessValue}
                  onChange={(e) => setAccessValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && normalizedRoomCode.length === 6 && !loading) {
                      onJoin(normalizedRoomCode);
                    }
                  }}
                  placeholder="Code ou lien d'invitation"
                  className="min-h-12 w-full rounded-[1.2rem] px-4 text-sm text-ink-950 outline-none placeholder:text-ink-300"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button onClick={onCreate} disabled={loading} fullWidth>
                  {loading ? "..." : "Creer une salle"}
                </Button>
                <Button
                  tone="secondary"
                  onClick={() => onJoin(normalizedRoomCode)}
                  disabled={normalizedRoomCode.length < 6 || loading}
                  fullWidth
                >
                  Rejoindre
                </Button>
              </div>

              {error ? (
                <div className="rounded-[1.2rem] border border-[rgba(120,42,33,0.16)] bg-tertiary-light px-4 py-3 text-sm font-medium text-tertiary">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="rounded-[1.6rem] border border-[rgba(74,60,46,0.12)] bg-paper/80 px-4 py-4">
              <div className="mb-3 font-sketch text-2xl font-semibold text-ink-900">
                Ta page
              </div>
              <ProfileEditor profile={profile} onChange={onProfileChange} compact />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
