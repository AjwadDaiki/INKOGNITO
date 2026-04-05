import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PlayerRole, PlayerView, RoomView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";

function roleLabel(role: PlayerRole) {
  if (role === "undercover") return "UNDERCOVER";
  if (role === "mr_white") return "MR.WHITE";
  return "CIVIL";
}

function revealTone(role: PlayerRole) {
  if (role === "mr_white") return "border-amber-300/30 bg-amber-300/10";
  if (role === "undercover") return "border-neon-rose/30 bg-neon-rose/10";
  return "border-white/10 bg-white/[0.03]";
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
    () => Object.fromEntries(room.players.map((player) => [player.id, player])),
    [room.players]
  );
  const [selectedRoundNumber, setSelectedRoundNumber] = useState<number>(
    finalResults.rounds.at(-1)?.roundNumber ?? 1
  );
  const selectedRound =
    finalResults.rounds.find((round) => round.roundNumber === selectedRoundNumber) ??
    finalResults.rounds.at(-1) ??
    null;
  const revealedImpostors = selectedRound
    ? room.players.filter((player) => {
        const role = selectedRound.revealedRoles[player.id];
        return role === "undercover" || role === "mr_white";
      })
    : [];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <GlassPanel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-4xl text-white">Fin</h1>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onReplay} disabled={!selfPlayer.isHost}>
              Rejouer
            </Button>
            <Button tone="secondary" onClick={onReturnToLobby} disabled={!selfPlayer.isHost}>
              Lobby
            </Button>
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassPanel className="space-y-3 p-4">
          {finalResults.leaderboard.map((entry) => {
            const player = playersById[entry.playerId];
            return (
              <div
                key={entry.playerId}
                className={`flex items-center justify-between rounded-[22px] border px-4 py-4 ${
                  player?.id === selfPlayer.id
                    ? "border-neon-cyan/35 bg-neon-cyan/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="min-w-0 text-lg font-semibold text-white">
                  #{entry.rank} {player?.profile.emoji} {player?.profile.name}
                </div>
                <div className="font-display text-2xl text-white">{entry.points}</div>
              </div>
            );
          })}
        </GlassPanel>

        <GlassPanel className="space-y-4 p-4">
          <div className="flex flex-wrap gap-2">
            {finalResults.rounds.map((round) => (
              <button
                key={round.roundNumber}
                type="button"
                onClick={() => setSelectedRoundNumber(round.roundNumber)}
                className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] transition ${
                  selectedRoundNumber === round.roundNumber
                    ? "border-neon-cyan/40 bg-neon-cyan/10 text-white"
                    : "border-white/10 bg-white/[0.03] text-ink-300"
                }`}
              >
                {round.roundNumber}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {selectedRound ? (
              <motion.div
                key={selectedRound.roundNumber}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="space-y-4"
              >
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-lg font-semibold text-white">
                    {selectedRound.civilWord} <span className="text-ink-300">/</span> {selectedRound.undercoverWord}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {revealedImpostors.map((player) => {
                    const role = selectedRound.revealedRoles[player.id];
                    return (
                      <div key={player.id} className={`rounded-[20px] border px-4 py-3 ${revealTone(role)}`}>
                        <div className="text-sm font-semibold text-white">
                          {player.profile.emoji} {player.profile.name}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-200">
                          {roleLabel(role)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {room.players.map((player) => {
                    const role = selectedRound.revealedRoles[player.id];
                    return (
                      <div key={player.id} className={`rounded-[22px] border p-3 ${revealTone(role)}`}>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-white">
                            {player.profile.emoji} {player.profile.name}
                          </div>
                          <div className="text-[10px] uppercase tracking-[0.18em] text-ink-200">
                            {roleLabel(role)}
                          </div>
                        </div>
                        {selectedRound.drawingSnapshots[player.id] ? (
                          <img
                            src={selectedRound.drawingSnapshots[player.id] ?? undefined}
                            alt={`Dessin de ${player.profile.name}`}
                            className="aspect-square w-full rounded-2xl border border-white/10 bg-white object-cover"
                          />
                        ) : (
                          <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white text-sm text-ink-300">
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
        </GlassPanel>
      </div>
    </div>
  );
}
