import { useState } from "react";
import type { PlayerView, RoomView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";

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

  const playersById = Object.fromEntries(room.players.map((player) => [player.id, player]));
  const [selectedRoundNumber, setSelectedRoundNumber] = useState<number>(
    finalResults.rounds.at(-1)?.roundNumber ?? 1
  );
  const selectedRound =
    finalResults.rounds.find((round) => round.roundNumber === selectedRoundNumber) ??
    finalResults.rounds.at(-1) ??
    null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <div>
        <div className="mb-2 text-sm uppercase tracking-[0.2em] text-ink-300">Fin de partie</div>
        <h1 className="font-display text-5xl text-white">Tableau final</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel className="space-y-6">
          <div>
            <div className="mb-3 text-sm uppercase tracking-[0.18em] text-ink-300">Leaderboard</div>
            <div className="space-y-3">
              {finalResults.leaderboard.map((entry) => {
                const player = playersById[entry.playerId];
                return (
                  <div
                    key={entry.playerId}
                    className={`flex items-center justify-between rounded-[24px] border px-5 py-4 ${
                      player?.id === selfPlayer.id
                        ? "border-neon-cyan/40 bg-neon-cyan/10"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-mono text-2xl text-white">#{entry.rank}</div>
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {player?.profile.emoji} {player?.profile.name}
                        </div>
                        <div className="text-sm text-ink-300">{player?.stats.correctVotes ?? 0} votes justes</div>
                      </div>
                    </div>
                    <div className="font-display text-2xl text-white">{entry.points} pts</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm uppercase tracking-[0.18em] text-ink-300">Derniers dessins</div>
            {selectedRound ? (
              <>
                <div className="mb-3 flex flex-wrap gap-2">
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
                      Round {round.roundNumber}
                    </button>
                  ))}
                </div>
                <div className="mb-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-sm text-ink-300">Mots révélés</div>
                  <div className="mt-1 font-display text-2xl text-white">
                    {selectedRound.civilWord} <span className="text-ink-300">vs</span>{" "}
                    {selectedRound.undercoverWord}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {room.players.map((player) => (
                    <div key={player.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-white">
                          {player.profile.emoji} {player.profile.name}
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-300">
                          {selectedRound.revealedRoles[player.id]}
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
                          Canvas vide
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-between text-xs text-ink-300">
                        <span>
                          Vote:{" "}
                          {selectedRound.votes[player.id]
                            ? playersById[selectedRound.votes[player.id]]?.profile.name ?? "?"
                            : "Blanc"}
                        </span>
                        <span className="font-semibold text-white">
                          +{selectedRound.pointsAwarded[player.id] ?? 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </GlassPanel>

        <div className="grid gap-6">
          <GlassPanel className="space-y-4">
            <div className="text-sm uppercase tracking-[0.18em] text-ink-300">Awards</div>
            <div className="space-y-3">
              {finalResults.awards.map((award) => (
                <div key={award.key} className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4">
                  <div className="text-sm text-ink-300">{award.title}</div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    {award.playerId ? playersById[award.playerId]?.profile.name : "Pas de gagnant"}
                  </div>
                  <div className="mt-1 text-sm text-ink-300">{award.subtitle}</div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="space-y-3">
            <Button fullWidth onClick={onReplay} disabled={!selfPlayer.isHost}>
              🔄 Rejouer
            </Button>
            <Button fullWidth tone="secondary" onClick={onReturnToLobby} disabled={!selfPlayer.isHost}>
              🏠 Retour au lobby
            </Button>
            {!selfPlayer.isHost ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink-300">
                Seul l’hôte peut relancer ou renvoyer tout le monde au lobby.
              </div>
            ) : null}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
