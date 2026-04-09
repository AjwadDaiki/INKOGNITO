import { useState } from "react";
import { motion } from "framer-motion";
import type { PlayerView, RoundView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { roleBadge } from "./gameHelpers";

export function ResolutionShowcase({
  round,
  playersById,
  suspectPlayer,
  impostors,
  selfPlayer,
  onSubmitGuess
}: {
  round: RoundView;
  playersById: Record<string, PlayerView>;
  suspectPlayer: PlayerView | null;
  impostors: PlayerView[];
  selfPlayer: PlayerView;
  onSubmitGuess: (guess: string) => void;
}) {
  const [guess, setGuess] = useState("");

  if (!round.resolution) return null;
  const voteEntries = Object.entries(round.resolution.votes);
  const suspectRole = suspectPlayer ? round.resolution.revealedRoles[suspectPlayer.id] : null;
  const badge = roleBadge(suspectRole);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassPanel className="overflow-hidden p-0">
        <div className="grid lg:grid-cols-2">
          {/* Left: who was voted out */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#fff4d6] via-white to-[#ffe2dc] p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
              Joueur vise
            </div>
            <div className="mt-3 flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 18 }}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-4xl shadow-card"
                style={{
                  background: suspectPlayer
                    ? `linear-gradient(160deg,${suspectPlayer.profile.color}55,${suspectPlayer.profile.color}22)`
                    : "#f5f5f5"
                }}
              >
                {suspectPlayer?.profile.emoji ?? "?"}
              </motion.div>
              <div>
                <div className="font-display text-3xl font-extrabold text-ink-950">
                  {suspectPlayer?.profile.name ?? "Aucun"}
                </div>
                {badge && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${badge.bg}`}
                  >
                    {badge.label}
                  </motion.span>
                )}
              </div>
            </div>

            {/* Mots */}
            <div className="mt-4 flex gap-3">
              <div className="rounded-2xl bg-white/70 px-3 py-2">
                <div className="text-[9px] font-bold uppercase text-ink-400">Civil</div>
                <div className="text-lg font-extrabold text-ink-950">{round.resolution.civilWord}</div>
              </div>
              <div className="rounded-2xl bg-white/70 px-3 py-2">
                <div className="text-[9px] font-bold uppercase text-ink-400">Undercover</div>
                <div className="text-lg font-extrabold text-ink-950">{round.resolution.undercoverWord}</div>
              </div>
            </div>

            {/* Mr White guess */}
            {round.resolution.mrWhiteGuess.pending &&
              round.resolution.mrWhiteGuess.playerId === selfPlayer.id && (
                <form
                  className="mt-4 flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (guess.trim()) { onSubmitGuess(guess.trim()); setGuess(""); }
                  }}
                >
                  <input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    className="h-10 flex-1 rounded-2xl bg-white px-3 text-sm text-ink-950 outline-none"
                    placeholder="Devine le mot civil..."
                  />
                  <Button type="submit" className="min-h-10 px-4 text-xs">Envoyer</Button>
                </form>
              )}
          </div>

          {/* Right: votes */}
          <div className="flex flex-col gap-3 bg-white/50 p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
              Qui a vote pour qui
            </div>
            <div className="space-y-1.5">
              {voteEntries.map(([fromId, toId], i) => {
                const from = playersById[fromId];
                const to = toId ? playersById[toId] : null;
                return (
                  <motion.div
                    key={fromId}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between rounded-2xl bg-surface-low px-3 py-2 text-sm"
                  >
                    <span className="font-semibold text-ink-950">
                      {from?.profile.emoji} {from?.profile.name}
                    </span>
                    <span className="text-ink-500">
                      → {to ? `${to.profile.emoji} ${to.profile.name}` : "Blanc"}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Impostors */}
            {impostors.length > 0 && (
              <div className="mt-auto flex flex-wrap gap-2">
                {impostors.map((p, i) => {
                  const role = round.resolution?.revealedRoles[p.id];
                  const b = roleBadge(role);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                      className={`rounded-[18px] px-4 py-2.5 text-sm font-bold ${b?.bg ?? ""}`}
                    >
                      {p.profile.emoji} {p.profile.name} — {b?.label}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
