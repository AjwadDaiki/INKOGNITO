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
        "relative grid h-full w-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] rounded-[22px] text-left transition-all duration-200",
        dense ? "gap-1 p-1.5" : "gap-1.5 p-2",
        // Vote selected — strong highlight
        isVoteSelected && "bg-gradient-to-br from-primary-light to-[#f5e8c0] ring-[3px] ring-primary shadow-[0_0_20px_rgba(212,160,23,0.25)]",
        // Resolution role reveals
        revealedRole === "undercover" && "bg-gradient-to-br from-tertiary-light to-[#ffd4d0] ring-2 ring-tertiary/40",
        revealedRole === "mr_white" && "bg-gradient-to-br from-[#f5e8c0] to-[#faf3e0] ring-2 ring-primary/30",
        revealedRole === "civil" && "bg-gradient-to-br from-[#e0eddb] to-[#edf5e8] ring-2 ring-[#5a8a4a]/20",
        // Default state
        !isVoteSelected &&
          !revealedRole &&
          (isSelf
            ? "border-2 border-primary/20 bg-gradient-to-br from-primary-light/60 to-white"
            : "border border-surface-low/60 bg-surface-card/85 shadow-[0_4px_0_rgba(15,23,42,0.06)] hover:shadow-[0_6px_0_rgba(15,23,42,0.08)]"),
        isInteractive && "cursor-pointer"
      )}
    >
      {/* Vote pulse ring overlay */}
      {isVoteSelected && phase === "vote" && (
        <div className="pointer-events-none absolute inset-0 rounded-[22px] animate-vote-pulse" />
      )}

      <div className="flex min-w-0 items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <motion.div
            animate={isVoteSelected ? { scale: [1, 1.15, 1] } : {}}
            transition={isVoteSelected ? { duration: 0.4, ease: "easeOut" } : {}}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm md:h-8 md:w-8 md:text-base"
            style={{
              background: `linear-gradient(160deg, ${player.profile.color}44, ${player.profile.color}18)`
            }}
          >
            {player.profile.emoji}
          </motion.div>
          <span className="truncate text-[11px] font-bold text-ink-950 md:text-xs">
            {player.profile.name}
          </span>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {liveLabel ? (
            <span
              className={clsx(
                "rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] animate-pulse-soft",
                chipClasses("accent")
              )}
            >
              {liveLabel}
            </span>
          ) : null}
          {revealedRoleLabel ? (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className={clsx(
                "rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em]",
                revealedRole === "civil" ? chipClasses("success") : chipClasses("danger")
              )}
            >
              {revealedRoleLabel}
            </motion.span>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <MiniDrawingCanvas
          strokes={strokes}
          previewStroke={phase === "drawing" ? previewStroke : null}
          size={previewSize}
          className="aspect-square max-h-full max-w-full rounded-[16px] shadow-card"
        />
      </div>

      <div className="flex min-h-[18px] items-center justify-between gap-1 text-[10px]">
        {phase === "vote" ? (
          <div className="flex items-center gap-1">
            <motion.span
              animate={isVoteSelected ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={clsx(
                "rounded-full px-2 py-0.5 font-bold uppercase tracking-[0.12em]",
                isVoteSelected ? "bg-primary text-ink-950" : chipClasses("neutral")
              )}
            >
              {isVoteSelected ? "✓ Mon vote" : isSelf ? "Toi" : "Voter"}
            </motion.span>
            {hasVoted && !isSelf && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 16 }}
                className="rounded-full bg-[#e0eddb] px-1.5 py-0.5 text-[8px] font-bold text-[#3d6b30]"
              >
                A vote ✓
              </motion.span>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-ink-400">
            {isSelf ? "Toi" : ""}
          </span>
        )}

        {phase === "resolution" ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 16, delay: 0.3 }}
            className={clsx(
              "rounded-full px-2 py-0.5 font-bold uppercase tracking-[0.12em]",
              chipClasses(pointsAwarded && pointsAwarded > 0 ? "success" : "neutral")
            )}
          >
            {pointsAwarded && pointsAwarded > 0 ? `+${pointsAwarded}` : "0"} pts
          </motion.span>
        ) : null}
      </div>
    </MotionContainer>
  );
}

export const PlayerBoardCard = memo(PlayerBoardCardComponent);
