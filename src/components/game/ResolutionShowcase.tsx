import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { PlayerView, RoomView, RoundView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { roleBadge } from "./gameHelpers";
import { MiniDrawingCanvas } from "./MiniDrawingCanvas";
import { useIsMobile } from "@/lib/useIsMobile";

export function ResolutionShowcase({
  round,
  room,
  playersById,
  suspectPlayer,
  selfPlayer,
  onSubmitGuess
}: {
  round: RoundView;
  room: RoomView;
  playersById: Record<string, PlayerView>;
  suspectPlayer: PlayerView | null;
  selfPlayer: PlayerView;
  onSubmitGuess: (guess: string) => void;
}) {
  const [guess, setGuess] = useState("");
  const isMobile = useIsMobile();

  if (!round.resolution) return null;

  const suspectRole = suspectPlayer ? round.resolution.revealedRoles[suspectPlayer.id] : null;
  const isCaught = suspectRole === "undercover" || suspectRole === "mr_white";

  const { votesByTarget, blankVoters } = useMemo(() => {
    const nextVotesByTarget: Record<string, PlayerView[]> = {};
    const nextBlankVoters: PlayerView[] = [];
    for (const [fromId, toId] of Object.entries(round.resolution!.votes)) {
      const voter = playersById[fromId];
      if (!voter) continue;
      if (toId) {
        if (!nextVotesByTarget[toId]) nextVotesByTarget[toId] = [];
        nextVotesByTarget[toId].push(voter);
      } else {
        nextBlankVoters.push(voter);
      }
    }
    return { votesByTarget: nextVotesByTarget, blankVoters: nextBlankVoters };
  }, [playersById, round.resolution]);

  const allPlayers = useMemo(() => room.players.filter((player) => player.connected), [room.players]);
  const cols = isMobile ? Math.min(allPlayers.length, 2) : Math.min(allPlayers.length, 4);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">

      {/* Top strip */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex shrink-0 flex-wrap items-center gap-2 rounded-[16px] bg-surface-card/90 px-3 py-2"
      >
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
          isCaught ? "bg-tertiary-light text-tertiary" : "bg-[#e0eddb] text-[#3d6b30]"
        }`}>
          {isCaught ? "Elimine !" : "Innocent..."}
        </span>
        <span className="rounded-full bg-[#e0eddb] px-2 py-0.5 text-[10px] font-bold text-[#3d6b30]">
          {round.resolution.civilWord}
        </span>
        <span className="text-ink-300">/</span>
        <span className="rounded-full bg-[#f5e8c0] px-2 py-0.5 text-[10px] font-bold text-[#8B6914]">
          {round.resolution.undercoverWord}
        </span>
      </motion.div>

      {/* Mr White guess */}
      {round.resolution.mrWhiteGuess.pending &&
        round.resolution.mrWhiteGuess.playerId === selfPlayer.id && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 rounded-[16px] bg-gradient-to-r from-[#f5e8c0] to-[#faf3e0] p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (guess.trim()) { onSubmitGuess(guess.trim()); setGuess(""); }
            }}
          >
            <div className="mb-2 font-sketch text-sm font-bold text-[#8B6914]">
              Derniere chance — devine le mot civil !
            </div>
            <div className="flex items-center gap-2">
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="h-10 flex-1 rounded-xl bg-surface-card px-3 text-sm text-ink-950 outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Mot civil..."
                autoFocus
              />
              <Button type="submit" className="min-h-10 px-4 text-xs">Deviner</Button>
            </div>
          </motion.form>
        )}

      {/* Player cards grid — Among Us style */}
      <div
        className="grid flex-1 gap-2 place-items-center overflow-auto"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {allPlayers.map((player, idx) => {
          const role = round.resolution!.revealedRoles[player.id];
          const badge = roleBadge(role);
          const isImpostor = role === "undercover" || role === "mr_white";
          const isSuspect = player.id === suspectPlayer?.id;
          const voters = votesByTarget[player.id] ?? [];
          const pts = round.resolution!.pointsAwarded[player.id] ?? 0;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.06, type: "spring", stiffness: 320, damping: 22 }}
              className={`flex w-full flex-col items-center gap-1 rounded-[14px] border-2 p-2 ${
                isSuspect
                  ? isImpostor
                    ? "border-tertiary bg-gradient-to-b from-tertiary-light to-paper"
                    : "border-primary bg-gradient-to-b from-primary-light to-paper"
                  : isImpostor
                    ? "border-tertiary/30 bg-tertiary-light/30"
                    : "border-ink-100/50 bg-surface-card/80"
              }`}
            >
              {/* Drawing */}
              <MiniDrawingCanvas
                strokes={round.drawings[player.id]?.strokes ?? []}
                size={160}
                className="rounded-[10px]"
              />

              {/* Name + role */}
              <div className="flex w-full items-center justify-between gap-1 px-0.5">
                <div className="flex min-w-0 items-center gap-1">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]"
                    style={{ background: `linear-gradient(160deg, ${player.profile.color}44, ${player.profile.color}18)` }}
                  >
                    {player.profile.emoji}
                  </span>
                  <span className="truncate text-[10px] font-bold text-ink-950">{player.profile.name}</span>
                </div>
                {badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.06 }}
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase ${badge.bg}`}
                  >
                    {badge.label}
                  </motion.span>
                )}
              </div>

              {/* Votes received — emoji + pseudo for each voter */}
              <div className="w-full rounded-lg bg-surface-low/50 px-1.5 py-1">
                {voters.length > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    {voters.map((voter, vi) => (
                      <motion.div
                        key={voter.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.06 + vi * 0.08 }}
                        className="flex items-center gap-1"
                      >
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded-full text-[8px]"
                          style={{ background: `linear-gradient(160deg, ${voter.profile.color}55, ${voter.profile.color}22)` }}
                        >
                          {voter.profile.emoji}
                        </span>
                        <span className="text-[9px] font-semibold text-ink-700">{voter.profile.name}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[8px] text-ink-300">Aucun vote</span>
                )}
              </div>

              {/* Points */}
              {pts !== 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + idx * 0.05 }}
                  className={`rounded-full px-2 py-0.5 text-[8px] font-bold ${
                    pts > 0 ? "bg-[#e0eddb] text-[#3d6b30]" : "bg-surface-low text-ink-400"
                  }`}
                >
                  {pts > 0 ? `+${pts}` : pts} pts
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Blank voters */}
      {blankVoters.length > 0 && (
        <div className="shrink-0 flex items-center gap-1.5 rounded-[12px] bg-surface-low/50 px-2.5 py-1.5">
          <span className="text-[9px] font-bold uppercase text-ink-400">Blanc :</span>
          {blankVoters.map((v) => (
            <div key={v.id} className="flex items-center gap-0.5">
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-[8px]"
                style={{ background: `linear-gradient(160deg, ${v.profile.color}44, ${v.profile.color}18)` }}
              >
                {v.profile.emoji}
              </span>
              <span className="text-[8px] font-semibold text-ink-500">{v.profile.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
