import { useState } from "react";
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

  // Group votes by target: { targetId -> [voterPlayer, ...] }
  const votesByTarget: Record<string, PlayerView[]> = {};
  const blankVoters: PlayerView[] = [];
  for (const [fromId, toId] of Object.entries(round.resolution.votes)) {
    const voter = playersById[fromId];
    if (!voter) continue;
    if (toId) {
      if (!votesByTarget[toId]) votesByTarget[toId] = [];
      votesByTarget[toId].push(voter);
    } else {
      blankVoters.push(voter);
    }
  }

  const allPlayers = room.players.filter((p) => p.connected);
  const cols = isMobile ? Math.min(allPlayers.length, 2) : Math.min(allPlayers.length, 4);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">

      {/* ── Top strip: Words + Points ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 22 }}
        className="flex shrink-0 flex-wrap items-center gap-2 rounded-[20px] bg-surface-card/90 px-4 py-3 backdrop-blur-md"
      >
        {/* Result label */}
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 18 }}
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${
            isCaught ? "bg-tertiary-light text-tertiary" : "bg-[#e0eddb] text-[#3d6b30]"
          }`}
        >
          {isCaught ? "Imposteur elimine !" : "Innocent elimine..."}
        </motion.span>

        {/* Words */}
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-[#e0eddb] px-2.5 py-1 text-xs font-bold text-[#3d6b30]">
            {round.resolution.civilWord}
          </span>
          <span className="text-xs text-ink-300">/</span>
          <span className="rounded-full bg-[#f5e8c0] px-2.5 py-1 text-xs font-bold text-[#8B6914]">
            {round.resolution.undercoverWord}
          </span>
        </div>

        {/* Points */}
        <div className="ml-auto flex items-center gap-1">
          {room.players.map((p, i) => {
            const pts = round.resolution?.pointsAwarded[p.id] ?? 0;
            return (
              <motion.span
                key={p.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.05, type: "spring", stiffness: 400, damping: 18 }}
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  pts > 0 ? "bg-[#e0eddb] text-[#3d6b30]" : "bg-surface-low text-ink-500"
                }`}
              >
                {p.profile.emoji} {pts > 0 ? `+${pts}` : "0"}
              </motion.span>
            );
          })}
        </div>
      </motion.div>

      {/* ── Mr White guess form ── */}
      {round.resolution.mrWhiteGuess.pending &&
        round.resolution.mrWhiteGuess.playerId === selfPlayer.id && (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="shrink-0 rounded-[20px] bg-gradient-to-r from-[#fef3c7] to-[#fff8e1] p-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (guess.trim()) { onSubmitGuess(guess.trim()); setGuess(""); }
            }}
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8B6914]">
              Derniere chance — devine le mot civil !
            </div>
            <div className="flex items-center gap-3">
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="h-11 flex-1 rounded-2xl bg-surface-card px-4 text-sm text-ink-950 shadow-inner outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Mot civil..."
                autoFocus
              />
              <Button type="submit" className="min-h-11 px-5 text-sm">Deviner</Button>
            </div>
          </motion.form>
        )}

      {/* ── Among Us style vote grid ── */}
      <div
        className="grid min-h-0 flex-1 gap-2 overflow-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
        }}
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
              transition={{
                delay: 0.15 + idx * 0.08,
                type: "spring",
                stiffness: 320,
                damping: 22
              }}
              className={`flex flex-col rounded-[20px] border-2 p-2 transition-all ${
                isSuspect
                  ? isImpostor
                    ? "border-tertiary bg-gradient-to-b from-tertiary-light to-paper shadow-[0_4px_20px_rgba(196,62,46,0.15)]"
                    : "border-primary bg-gradient-to-b from-primary-light to-paper shadow-[0_4px_20px_rgba(212,160,23,0.15)]"
                  : isImpostor
                    ? "border-tertiary/30 bg-gradient-to-b from-tertiary-light/40 to-paper"
                    : "border-surface-low/60 bg-surface-card/90"
              }`}
            >
              {/* Drawing */}
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[14px] bg-paper-warm">
                <MiniDrawingCanvas
                  strokes={round.drawings[player.id]?.strokes ?? []}
                  size={180}
                  className="aspect-square max-h-full max-w-full rounded-[14px]"
                />
              </div>

              {/* Name + Role badge */}
              <div className="mt-1.5 flex items-center justify-between gap-1 px-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{
                      background: `linear-gradient(160deg, ${player.profile.color}44, ${player.profile.color}18)`
                    }}
                  >
                    {player.profile.emoji}
                  </span>
                  <span className="truncate text-xs font-bold text-ink-950">
                    {player.profile.name}
                  </span>
                </div>
                {badge && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.08, type: "spring", stiffness: 400, damping: 16 }}
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] ${badge.bg}`}
                  >
                    {badge.label}
                  </motion.span>
                )}
              </div>

              {/* Votes received — small avatar bubbles */}
              <div className="mt-1.5 min-h-[28px] rounded-[12px] bg-surface-low/60 px-2 py-1">
                {voters.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9px] font-bold uppercase text-ink-400 mr-0.5">
                      {voters.length}×
                    </span>
                    {voters.map((voter, vi) => (
                      <motion.div
                        key={voter.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: 0.6 + idx * 0.08 + vi * 0.1,
                          type: "spring",
                          stiffness: 450,
                          damping: 18
                        }}
                        title={`${voter.profile.name} a vote pour ${player.profile.name}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs shadow-sm"
                        style={{
                          background: `linear-gradient(160deg, ${voter.profile.color}55, ${voter.profile.color}22)`
                        }}
                      >
                        {voter.profile.emoji}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[9px] text-ink-300">Aucun vote</span>
                )}
              </div>

              {/* Points */}
              {pts !== 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + idx * 0.05, type: "spring", stiffness: 400, damping: 18 }}
                  className={`mt-1 text-center text-[10px] font-bold ${
                    pts > 0 ? "text-[#3d6b30]" : "text-ink-400"
                  }`}
                >
                  {pts > 0 ? `+${pts} pts` : `${pts} pts`}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Blank votes (if any) */}
      {blankVoters.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="shrink-0 flex items-center gap-2 rounded-[16px] bg-surface-low/60 px-3 py-2"
        >
          <span className="text-[10px] font-bold uppercase text-ink-400">Vote blanc :</span>
          {blankVoters.map((v) => (
            <span
              key={v.id}
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
              style={{ background: `linear-gradient(160deg, ${v.profile.color}44, ${v.profile.color}18)` }}
            >
              {v.profile.emoji}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
