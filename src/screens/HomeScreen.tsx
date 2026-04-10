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
    <div className="relative flex h-[100svh] flex-col items-center justify-center overflow-hidden p-4">
      {/* Ink splatters instead of gradient orbs */}
      <InkSplatter variant={0} className="left-[5%] top-[10%]" size={200} opacity={0.04} />
      <InkSplatter variant={1} className="bottom-[8%] right-[6%]" size={180} opacity={0.05} />
      <InkSplatter variant={2} className="left-[55%] top-[65%]" size={120} opacity={0.03} />
      <InkSplatter variant={3} className="right-[40%] top-[5%]" size={90} opacity={0.04} />

      {/* Title — Ink identity */}
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative mb-5 text-center"
      >
        <motion.h1
          className="font-display text-6xl font-extrabold tracking-[-0.04em] md:text-8xl"
        >
          <span className="text-ink-drip">INK</span>
          <span className="text-gradient-gold">OGNITO</span>
        </motion.h1>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 400, damping: 20 }}
          className="ml-2 inline-block rounded-full bg-primary/20 px-2 py-0.5 align-top font-sketch text-xs font-bold text-primary-dark"
        >
          v2
        </motion.span>
        {/* Ink drip under the title */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-1 h-[3px] w-32 origin-left rounded-full bg-gradient-to-r from-ink-950 via-ink-700 to-transparent"
        />
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 22 }}
          className="mt-2 font-sketch text-lg font-medium text-ink-500"
        >
          Dessine. Bluffe. Demasque.
        </motion.p>
      </motion.div>

      {/* Main card — sketchbook page */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 250, damping: 22 }}
        className="bento-card relative w-full max-w-lg p-5"
      >
        {/* Decorative corner ink spots */}
        <div className="ink-spot -left-2 -top-2 h-6 w-6 rounded-full bg-ink-950" />
        <div className="ink-spot -bottom-1 -right-2 h-4 w-4 rounded-full bg-ink-700" />

        <ProfileEditor profile={profile} onChange={onProfileChange} compact hideColor />

        <div className="mt-4 flex flex-col gap-3">
          <motion.input
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 350, damping: 24 }}
            value={accessValue}
            onChange={(e) => setAccessValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && normalizedRoomCode.length === 6 && !loading) {
                onJoin(normalizedRoomCode);
              }
            }}
            placeholder="Code ou lien d'invitation..."
            className="min-h-11 w-full rounded-2xl bg-surface-low px-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-300 focus:bg-surface-high focus:ring-2 focus:ring-primary/30"
          />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 22 }}
            className="grid grid-cols-2 gap-2"
          >
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
          </motion.div>

          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="rounded-2xl bg-tertiary-light px-4 py-3 text-sm font-medium text-tertiary"
            >
              {error}
            </motion.div>
          ) : null}
        </div>

        {/* Rules — sketchbook style with handwritten font */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, type: "spring", stiffness: 280, damping: 22 }}
          className="mt-4 grid grid-cols-3 gap-2 text-center"
        >
          {[
            { emoji: "🎨", label: "Dessine" },
            { emoji: "🕵️", label: "Trouve l'intrus" },
            { emoji: "🗳️", label: "Vote" }
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.08, type: "spring", stiffness: 350, damping: 20 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="overflow-hidden rounded-xl border border-ink-100/60 bg-paper-warm px-2 py-2.5"
            >
              <div className="text-base leading-none">{item.emoji}</div>
              <div className="mt-1.5 font-sketch text-sm font-semibold text-ink-700">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
