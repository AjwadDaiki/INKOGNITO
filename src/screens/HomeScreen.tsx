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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative flex h-[100dvh] flex-col items-center justify-center overflow-hidden p-4">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="mb-6 text-center"
      >
        <h1 className="font-display text-6xl font-extrabold tracking-[-0.03em] text-ink-950 md:text-8xl">
          INKOGNITO
        </h1>
        <p className="mt-1 text-sm font-medium text-ink-500 md:text-base">
          Dessin · Bluff · Deduction
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.08 }}
        className="grid w-full max-w-3xl gap-3 md:grid-cols-2"
      >
        <motion.div
          variants={cardVariants}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          className="bento-card flex flex-col gap-4 p-5"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
            Ton profil
          </h2>

          <ProfileEditor profile={profile} onChange={onProfileChange} compact hideColor />

          <div className="rounded-[24px] bg-surface-low px-4 py-4 text-sm text-ink-700">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
              Regles
            </div>
            <div className="grid gap-2">
              <div>1. Chaque joueur recoit un mot secret.</div>
              <div>2. Tout le monde dessine sans parler ni ecrire.</div>
              <div>3. Les civils ont le meme mot, l&apos;Undercover un mot proche.</div>
              <div>4. Vous observez, discutez, puis votez.</div>
              <div>5. Trouvez l&apos;intrus avant qu&apos;il retourne la manche.</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          className="bento-card flex flex-col gap-4 p-5"
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
            Rejoins la partie
          </h2>

          <input
            value={accessValue}
            onChange={(event) => setAccessValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && normalizedRoomCode.length === 6 && !loading) {
                onJoin(normalizedRoomCode);
              }
            }}
            placeholder="Code ou lien d'invitation..."
            className="min-h-11 w-full rounded-2xl bg-surface-low px-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-300 focus:bg-surface-high"
          />

          <div className="grid grid-cols-2 gap-2">
            <Button fullWidth onClick={onCreate} disabled={loading}>
              {loading ? "..." : "Creer"}
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
            <div className="rounded-2xl bg-tertiary-light px-4 py-3 text-sm font-medium text-tertiary">
              {error}
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </div>
  );
}
