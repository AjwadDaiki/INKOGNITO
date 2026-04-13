import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PlayerRole, PlayerView, RoomView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { InkSplatter } from "@/components/ui/InkSplatter";
import { CoffeeStain } from "@/components/ui/CoffeeStain";
import { StackedPages } from "@/components/ui/StackedPages";
import { WashiTape } from "@/components/ui/WashiTape";
import { SpiralBinding } from "@/components/ui/SpiralBinding";
import { InkBleed } from "@/components/ui/InkBleed";
import { ShareRecap } from "@/components/game/ShareRecap";
import { useI18n } from "@/i18n";

function roleLabel(role: PlayerRole, t: (key: string) => string) {
  if (role === "undercover") return t("role.undercover");
  if (role === "mr_white") return t("role.mrWhite");
  return t("role.civil");
}

function roleBg(role: PlayerRole) {
  if (role === "mr_white") return "border-[rgba(139,105,20,0.24)] bg-primary-light text-primary-dark";
  if (role === "undercover") return "border-[rgba(120,42,33,0.24)] bg-tertiary-light text-tertiary";
  return "border-[rgba(74,60,46,0.1)] bg-paper text-ink-700";
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
  const t = useI18n((s) => s.t);
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
    <div className="relative flex min-h-[100dvh] items-start justify-center overflow-y-auto p-3 md:p-5 lg:h-[100dvh] lg:min-h-0 lg:items-center lg:overflow-hidden">
      <InkSplatter variant={0} className="left-[7%] top-[12%]" size={220} opacity={0.08} />
      <InkSplatter variant={1} className="bottom-[8%] right-[7%]" size={230} opacity={0.09} />
      <CoffeeStain className="right-[10%] top-[6%] rotate-[30deg]" size={130} opacity={0.06} />

      <StackedPages className="w-full max-w-[1580px] lg:h-full">
      <div className="paper-sheet notebook-page desk-shadow animate-page-settle flex w-full flex-col px-5 py-5 md:px-8 lg:h-full lg:overflow-hidden">
        <SpiralBinding />
        <div className="absolute right-10 top-8 h-24 w-24 rounded-full bg-ink-950/8" />
        <div className="absolute bottom-12 left-8 h-16 w-16 rounded-full bg-ink-950/6" />
        <WashiTape className="-right-2 top-4" variant={1} rotate={-10} width={110} />
        <WashiTape className="bottom-6 -left-1" variant={2} rotate={5} width={95} />
        <div className="pl-7 md:pl-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-500">{t("final.gameOver")}</div>
              <div className="mt-1 font-sketch text-5xl font-bold leading-none text-ink-950 md:text-6xl">
                {t("final.scoreboard")}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ShareRecap
                finalResults={finalResults}
                players={room.players}
                roomCode={room.roomCode}
              />
              <Button onClick={onReplay} disabled={!selfPlayer.isHost}>
                {t("final.replay")}
              </Button>
              <Button tone="secondary" onClick={onReturnToLobby} disabled={!selfPlayer.isHost}>
                {t("final.backToLobby")}
              </Button>
              {!selfPlayer.isHost ? (
                <span className="text-xs text-ink-400">{t("final.hostDecides")}</span>
              ) : null}
            </div>
          </div>

          <div className="paper-divider my-5" />

          <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[0.72fr_1.28fr]">
            <div className="min-h-0 rounded-[1.7rem] border border-[rgba(74,60,46,0.12)] bg-paper/84 px-4 py-4">
              <div className="mb-3 font-sketch text-3xl font-semibold text-ink-900">{t("final.leaderboard")}</div>
              <div className="scrollbar-thin flex max-h-[62vh] flex-col gap-3 overflow-y-auto pr-1">
                {finalResults.leaderboard.map((entry, index) => {
                  const player = playersById[entry.playerId];
                  const isSelf = player?.id === selfPlayer.id;
                  return (
                    <motion.div
                      key={entry.playerId}
                      initial={{ opacity: 0, y: 12, rotate: index % 2 === 0 ? -1 : 1 }}
                      animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -1 : 1 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 240, damping: 22 }}
                      className={`paper-sheet px-4 py-3 ${isSelf ? "border-[rgba(212,160,23,0.22)]" : ""} ${entry.rank === 1 ? "ring-2 ring-primary/30" : ""}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-sketch text-3xl font-semibold leading-none text-ink-950">
                            {entry.rank === 1 ? "👑" : `#${entry.rank}`} {player?.profile.name}
                          </div>
                          <div className="mt-1 text-sm text-ink-500">{player?.profile.emoji}</div>
                        </div>
                        <div className="rounded-full bg-ink-950 px-3 py-1 text-sm font-semibold text-paper">
                          {entry.points} pts
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 rounded-[1.7rem] border border-[rgba(74,60,46,0.12)] bg-paper/84 px-4 py-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {finalResults.rounds.map((round) => (
                  <button
                    key={round.roundNumber}
                    type="button"
                    onClick={() => setSelectedRoundNumber(round.roundNumber)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selectedRoundNumber === round.roundNumber
                        ? "border-ink-950 bg-ink-950 text-paper"
                        : "border-[rgba(74,60,46,0.12)] bg-paper text-ink-700"
                    }`}
                  >
                    Round {round.roundNumber}
                  </button>
                ))}
              </div>

              <div className="scrollbar-thin min-h-0 max-h-[62vh] overflow-y-auto pr-1">
                <AnimatePresence mode="wait" initial={false}>
                  {selectedRound ? (
                    <motion.div
                      key={selectedRound.roundNumber}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-4"
                    >
                      <div className="paper-sheet px-4 py-4">
                        <div className="font-sketch text-3xl font-semibold text-ink-950">
                          {t("final.roundWords")}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="ink-chip text-sm text-ink-700"><InkBleed>{selectedRound.civilWord}</InkBleed></span>
                          <span className="ink-chip text-sm text-ink-700"><InkBleed intensity={1.3}>{selectedRound.undercoverWord}</InkBleed></span>
                        </div>
                      </div>

                      {revealedImpostors.length ? (
                        <div className="flex flex-wrap gap-2">
                          {revealedImpostors.map((player) => {
                            const role = selectedRound.revealedRoles[player.id];
                            return (
                              <div key={player.id} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${roleBg(role)}`}>
                                {player.profile.name} · {roleLabel(role, t)}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {room.players.map((player, index) => {
                          const role = selectedRound.revealedRoles[player.id];
                          const snapshot = selectedRound.drawingSnapshots[player.id];
                          return (
                            <motion.div
                              key={player.id}
                              initial={{ opacity: 0, y: 12, rotate: index % 2 === 0 ? -1.2 : 1.2 }}
                              animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -1.2 : 1.2 }}
                              transition={{ delay: index * 0.04, type: "spring", stiffness: 240, damping: 22 }}
                              className="paper-sheet overflow-hidden px-3 py-3"
                            >
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <div className="truncate font-sketch text-3xl font-semibold text-ink-950">
                                  {player.profile.name}
                                </div>
                                <div className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${roleBg(role)}`}>
                                  {roleLabel(role, t)}
                                </div>
                              </div>
                              {snapshot ? (
                                <img
                                  src={snapshot}
                                  alt={player.profile.name}
                                  referrerPolicy="no-referrer"
                                  className="aspect-square w-full rounded-[1rem] border border-[rgba(74,60,46,0.08)] bg-[#fbf7f0] object-cover"
                                />
                              ) : (
                                <div className="flex aspect-square items-center justify-center rounded-[1rem] bg-[#fbf7f0] text-sm text-ink-300">
                                  {t("final.empty")}
                                </div>
                              )}
                            </motion.div>
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
      </div>
      </StackedPages>
    </div>
  );
}
