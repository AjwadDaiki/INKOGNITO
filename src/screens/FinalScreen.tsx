import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PlayerRole, PlayerView, RoomView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { InkSplatter } from "@/components/ui/InkSplatter";

function roleLabel(role: PlayerRole) {
  if (role === "undercover") return "UNDERCOVER";
  if (role === "mr_white") return "MR.WHITE";
  return "CIVIL";
}

function roleBg(role: PlayerRole) {
  if (role === "mr_white") return "bg-[#f5e8c0] text-[#8B6914]";
  if (role === "undercover") return "bg-tertiary-light text-tertiary";
  return "bg-[#e0eddb] text-[#3d6b30]";
}

export function FinalScreen({
  room,
  selfPlayer,
  onReplay,
  onReturnToLobby
}: {
  room: RoomView;
  selfPlayer: PlayerView;
  onReplay: () => void;
  onReturnToLobby: () => void;
}) {
  const finalResults = room.finalResults;
  if (!finalResults) return null;

  const playersById = useMemo(
    () => Object.fromEntries(room.players.map((p) => [p.id, p])),
    [room.players]
  );
  const [selectedRoundNumber, setSelectedRoundNumber] = useState<number>(
    finalResults.rounds.at(-1)?.roundNumber ?? 1
  );
  const selectedRound =
    finalResults.rounds.find((r) => r.roundNumber === selectedRoundNumber) ??
    finalResults.rounds.at(-1) ??
    null;
  const revealedImpostors = selectedRound
    ? room.players.filter((p) => {
        const role = selectedRound.revealedRoles[p.id];
        return role === "undercover" || role === "mr_white";
      })
    : [];

  return (
    <div className="relative flex h-[100dvh] flex-col gap-3 overflow-hidden p-3 md:p-4">

      {/* Ink splatters */}
      <InkSplatter variant={0} className="left-[8%] top-[15%]" size={190} opacity={0.04} />
      <InkSplatter variant={2} className="bottom-[10%] right-[6%]" size={160} opacity={0.05} />
      <InkSplatter variant={1} className="left-[60%] top-[8%]" size={100} opacity={0.03} />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 24 }}
        className="bento-card shrink-0 px-5 py-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-extrabold text-ink-950">
            Résultats
          </h1>
          <div className="flex gap-2">
            <Button onClick={onReplay} disabled={!selfPlayer.isHost}>
              Rejouer
            </Button>
            <Button tone="secondary" onClick={onReturnToLobby} disabled={!selfPlayer.isHost}>
              Lobby
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Bento grid ── */}
      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[0.75fr_1.25fr]">

        {/* Classement */}
        <div className="bento-card flex min-h-0 flex-col p-4">
          <h2 className="mb-3 shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-ink-500">
            Classement
          </h2>
          <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto">
            {finalResults.leaderboard.map((entry, index) => {
              const player = playersById[entry.playerId];
              const isSelf = player?.id === selfPlayer.id;
              return (
                <motion.div
                  key={entry.playerId}
                  initial={{ opacity: 0, x: -20, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: index * 0.08, type: "spring", stiffness: 340, damping: 22 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className={`flex items-center justify-between rounded-[20px] px-4 py-3 ${
                    index === 0
                      ? "bg-gradient-to-r from-primary-light to-[#f5e8c0] shadow-[0_4px_16px_rgba(212,160,23,0.2)]"
                      : isSelf
                        ? "bg-primary-light"
                        : "bg-surface-low"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-ink-950">
                    <span className={`text-lg font-extrabold ${index === 0 ? "text-primary" : "text-ink-300"}`}>
                      #{entry.rank}
                    </span>
                    {player?.profile.emoji} {player?.profile.name}
                  </div>
                  <motion.div
                    key={entry.points}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="font-display text-xl font-extrabold text-ink-950"
                  >
                    {entry.points}
                    <span className="ml-0.5 text-sm font-medium text-ink-500">pts</span>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Détail rounds */}
        <div className="bento-card flex min-h-0 flex-col p-4">
          {/* Round selector */}
          <div className="mb-3 flex shrink-0 flex-wrap gap-2">
            {finalResults.rounds.map((round) => (
              <button
                key={round.roundNumber}
                type="button"
                onClick={() => setSelectedRoundNumber(round.roundNumber)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] transition ${
                  selectedRoundNumber === round.roundNumber
                    ? "bg-primary text-ink-950 shadow-primary"
                    : "bg-surface-low text-ink-700 hover:bg-surface-high"
                }`}
              >
                R{round.roundNumber}
              </button>
            ))}
          </div>

          {/* Round content */}
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" initial={false}>
              {selectedRound ? (
                <motion.div
                  key={selectedRound.roundNumber}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-3"
                >
                  {/* Mots */}
                  <div className="rounded-[20px] bg-surface-low px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink-500">Mots du round</span>
                    <div className="mt-1 text-lg font-bold text-ink-950">
                      {selectedRound.civilWord}{" "}
                      <span className="text-ink-300">/</span>{" "}
                      {selectedRound.undercoverWord}
                    </div>
                  </div>

                  {/* Imposteurs */}
                  {revealedImpostors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {revealedImpostors.map((player) => {
                        const role = selectedRound.revealedRoles[player.id];
                        return (
                          <div key={player.id} className={`rounded-[18px] px-4 py-2 ${roleBg(role)}`}>
                            <div className="text-sm font-bold">
                              {player.profile.emoji} {player.profile.name}
                            </div>
                            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] opacity-70">
                              {roleLabel(role)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {/* Dessins */}
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {room.players.map((player) => {
                      const role = selectedRound.revealedRoles[player.id];
                      const snapshot = selectedRound.drawingSnapshots[player.id];
                      return (
                        <div key={player.id} className={`rounded-[20px] p-3 ${roleBg(role)}`}>
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="text-xs font-bold text-ink-950">
                              {player.profile.emoji} {player.profile.name}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                              {roleLabel(role)}
                            </div>
                          </div>
                          {snapshot ? (
                            <img
                              src={snapshot}
                              alt={`Dessin de ${player.profile.name}`}
                              referrerPolicy="no-referrer"
                              className="aspect-square w-full rounded-2xl bg-paper-warm object-cover"
                            />
                          ) : (
                            <div className="flex aspect-square items-center justify-center rounded-2xl bg-paper-warm text-sm text-ink-300">
                              Vide
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
