import { memo } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import type { DrawingStroke, PlayerRole, PlayerView, RoomView } from "@shared/protocol";
import { MiniDrawingCanvas } from "@/components/game/MiniDrawingCanvas";

function roleLabel(role: PlayerRole | null | undefined) {
  if (role === "undercover") return "UNDERCOVER";
  if (role === "mr_white") return "MR.WHITE";
  if (role === "civil") return "CIVIL";
  return null;
}

function chipClasses(tone: "neutral" | "accent" | "danger" | "success" = "neutral") {
  if (tone === "accent") return "bg-primary-light text-primary-dark";
  if (tone === "danger") return "bg-tertiary-light text-tertiary";
  if (tone === "success") return "bg-[#e0eddb] text-[#3d6b30]";
  return "bg-surface-low text-ink-700";
}

function PlayerBoardCardComponent({
  phase,
  player,
  strokes,
  previewStroke,
  previewSize,
  dense = false,
  isSelf = false,
  selectedVoteTargetId,
  hasVoted = false,
  voters = [],
  revealedRole,
  pointsAwarded,
  onVote
}: {
  phase: RoomView["phase"];
  player: PlayerView;
  strokes: DrawingStroke[];
  previewStroke?: DrawingStroke | null;
  previewSize: number;
  dense?: boolean;
  isSelf?: boolean;
  selectedVoteTargetId: string | null;
  hasVoted?: boolean;
  /** Players who voted for this player (live during vote phase) */
  voters?: PlayerView[];
  revealedRole?: PlayerRole | null;
  pointsAwarded?: number;
  onVote: (targetPlayerId: string | null) => void;
}) {
  const isVoteSelected = selectedVoteTargetId === player.id;
  const liveLabel = phase === "drawing" && previewStroke ? "LIVE" : null;
  const revealedRoleLabel = roleLabel(revealedRole);
  const isInteractive = phase === "vote" && !isSelf;

  function handleClick() {
    if (phase === "vote") {
      onVote(player.id);
    }
  }

  const MotionContainer = isInteractive ? motion.button : motion.article;

  return (
    <MotionContainer
      {...(isInteractive ? { type: "button" as const, onClick: handleClick } : {})}
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={isInteractive ? { scale: 1.04, y: -3 } : {}}
      whileTap={isInteractive ? { scale: 0.96 } : {}}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      layout
      className={clsx(
        "relative flex h-full w-full flex-col rounded-[18px] text-left transition-all duration-200",
        dense ? "gap-1 p-1.5" : "gap-1 p-2",
        isVoteSelected && "bg-gradient-to-br from-primary-light to-[#f5e8c0] ring-[3px] ring-primary shadow-[0_0_20px_rgba(212,160,23,0.25)]",
        revealedRole === "undercover" && "bg-gradient-to-br from-tertiary-light to-[#ffd4d0] ring-2 ring-tertiary/40",
        revealedRole === "mr_white" && "bg-gradient-to-br from-[#f5e8c0] to-[#faf3e0] ring-2 ring-primary/30",
        revealedRole === "civil" && "bg-gradient-to-br from-[#e0eddb] to-[#edf5e8] ring-2 ring-[#5a8a4a]/20",
        !isVoteSelected &&
          !revealedRole &&
          (isSelf
            ? "border-2 border-primary/20 bg-gradient-to-br from-primary-light/60 to-paper"
            : "border border-surface-low/60 bg-surface-card/85 shadow-[0_3px_0_rgba(26,20,16,0.06)]"),
        isInteractive && "cursor-pointer"
      )}
    >
      {isVoteSelected && phase === "vote" && (
        <div className="pointer-events-none absolute inset-0 rounded-[18px] animate-vote-pulse" />
      )}

      {/* Header — name + badges */}
      <div className="flex shrink-0 items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <motion.div
            animate={isVoteSelected ? { scale: [1, 1.15, 1] } : {}}
            transition={isVoteSelected ? { duration: 0.4, ease: "easeOut" } : {}}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
            style={{
              background: `linear-gradient(160deg, ${player.profile.color}44, ${player.profile.color}18)`
            }}
          >
            {player.profile.emoji}
          </motion.div>
          <span className="truncate text-[11px] font-bold text-ink-950">
            {player.profile.name}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {liveLabel && (
            <span className={clsx("rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide animate-pulse-soft", chipClasses("accent"))}>
              {liveLabel}
            </span>
          )}
          {revealedRoleLabel && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className={clsx("rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide", revealedRole === "civil" ? chipClasses("success") : chipClasses("danger"))}
            >
              {revealedRoleLabel}
            </motion.span>
          )}
          {hasVoted && !isSelf && phase === "vote" && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
              className="rounded-full bg-[#e0eddb] px-1.5 py-0.5 text-[7px] font-bold text-[#3d6b30]"
            >
              ✓
            </motion.span>
          )}
        </div>
      </div>

      {/* Drawing — SQUARE */}
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <MiniDrawingCanvas
          strokes={strokes}
          previewStroke={phase === "drawing" ? previewStroke : null}
          size={previewSize}
          className="aspect-square h-auto w-full max-w-full rounded-[12px] shadow-card"
        />
      </div>

      {/* Live vote bubbles — who voted for this player (Among Us style) */}
      {phase === "vote" && voters.length > 0 && (
        <div className="flex shrink-0 items-center gap-0.5 px-0.5">
          {voters.map((voter) => (
            <motion.div
              key={voter.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              title={`${voter.profile.name} a vote ici`}
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] ring-1 ring-ink-100/50"
              style={{ background: `linear-gradient(160deg, ${voter.profile.color}55, ${voter.profile.color}22)` }}
            >
              {voter.profile.emoji}
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer — vote action or points */}
      <div className="flex shrink-0 items-center justify-between gap-1 text-[9px]">
        {phase === "vote" ? (
          <motion.span
            animate={isVoteSelected ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={clsx(
              "rounded-full px-2 py-0.5 font-bold uppercase tracking-wide",
              isVoteSelected ? "bg-primary text-ink-950" : chipClasses("neutral")
            )}
          >
            {isVoteSelected ? "✓ Vote" : isSelf ? "Toi" : "Voter"}
          </motion.span>
        ) : (
          isSelf && <span className="text-ink-400">Toi</span>
        )}

        {phase === "resolution" && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 16, delay: 0.3 }}
            className={clsx("rounded-full px-2 py-0.5 font-bold uppercase tracking-wide", chipClasses(pointsAwarded && pointsAwarded > 0 ? "success" : "neutral"))}
          >
            {pointsAwarded && pointsAwarded > 0 ? `+${pointsAwarded}` : "0"} pts
          </motion.span>
        )}
      </div>
    </MotionContainer>
  );
}

export const PlayerBoardCard = memo(PlayerBoardCardComponent);
