import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CompletedRoundView, PlayerRole, PlayerView, RoomView } from "@shared/protocol";
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
      <GlassPanel className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 text-sm uppercase tracking-[0.2em] text-ink-300">Fin de partie</div>
            <h1 className="font-display text-5xl text-white">Resultat final</h1>
            <p className="mt-3 text-sm text-ink-300">
              Score, imposteurs reveles et recap rapide des rounds.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onReplay} disabled={!selfPlayer.isHost}>
              Rejouer
            </Button>
            <Button tone="secondary" onClick={onReturnToLobby} disabled={!selfPlayer.isHost}>
              Retour lobby
            </Button>
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassPanel className="space-y-5 p-5">
          <div className="text-sm uppercase tracking-[0.18em] text-ink-300">Classement</div>
          <div className="space-y-3">
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
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-[0.18em] text-ink-300">#{entry.rank}</div>
                    <div className="truncate text-lg font-semibold text-white">
                      {player?.profile.emoji} {player?.profile.name}
                    </div>
                  </div>
                  <div className="font-display text-2xl text-white">{entry.points}</div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {finalResults.awards.slice(0, 4).map((award) => (
              <div key={award.key} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-ink-300">{award.title}</div>
                <div className="mt-2 text-base font-semibold text-white">
                  {award.playerId ? playersById[award.playerId]?.profile.name : "Personne"}
                </div>
              </div>
            ))}
          </div>

          {!selfPlayer.isHost ? (
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink-300">
              Seul l'hote peut relancer ou renvoyer tout le monde au lobby.
            </div>
          ) : null}
        </GlassPanel>

        <GlassPanel className="space-y-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm uppercase tracking-[0.18em] text-ink-300">Rounds</div>
              <div className="mt-1 text-2xl font-semibold text-white">
                {selectedRound ? `Round ${selectedRound.roundNumber}` : "Aucun round"}
              </div>
            </div>
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
                <RoundReveal
                  round={selectedRound}
                  roomPlayers={room.players}
                  playersById={playersById}
                  revealedImpostors={revealedImpostors}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </GlassPanel>
      </div>
    </div>
  );
}

function RoundReveal({
  round,
  roomPlayers,
  playersById,
  revealedImpostors
}: {
  round: CompletedRoundView;
  roomPlayers: RoomView["players"];
  playersById: Record<string, PlayerView>;
  revealedImpostors: PlayerView[];
}) {
  return (
    <>
      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Mots</div>
        <div className="mt-2 text-lg font-semibold text-white">
          {round.civilWord} <span className="text-ink-300">/</span> {round.undercoverWord}
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Imposteurs</div>
        <div className="mt-3 flex flex-wrap gap-3">
          {revealedImpostors.length > 0 ? (
            revealedImpostors.map((player) => {
              const role = round.revealedRoles[player.id];
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
            })
          ) : (
            <div className="text-sm text-ink-300">Aucun role special.</div>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {roomPlayers.map((player) => {
          const role = round.revealedRoles[player.id];
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
              {round.drawingSnapshots[player.id] ? (
                <img
                  src={round.drawingSnapshots[player.id] ?? undefined}
                  alt={`Dessin de ${player.profile.name}`}
                  className="aspect-square w-full rounded-2xl border border-white/10 bg-white object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white text-sm text-ink-300">
                  Vide
                </div>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-ink-300">
                <span>
                  Vote: {round.votes[player.id] ? playersById[round.votes[player.id]]?.profile.name ?? "?" : "Blanc"}
                </span>
                <span className="font-semibold text-white">+{round.pointsAwarded[player.id] ?? 0}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
