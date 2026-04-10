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
  voters?: PlayerView[];
  revealedRole?: PlayerRole | null;
  pointsAwarded?: number;
  onVote: (targetPlayerId: string | null) => void;
}) {
  const isVoteSelected = selectedVoteTargetId === player.id;
  const liveLabel = phase === "drawing" && previewStroke ? "LIVE" : null;
  const revealedRoleLabel = roleLabel(revealedRole);
  const isInteractive = phase === "vote" && !isSelf;

  const MotionContainer = isInteractive ? motion.button : motion.article;

  return (
    <MotionContainer
      {...(isInteractive ? { type: "button" as const, onClick: () => onVote(player.id) } : {})}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isInteractive ? { scale: 1.03 } : {}}
      whileTap={isInteractive ? { scale: 0.97 } : {}}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
      className={clsx(
        "flex flex-col items-center gap-1 rounded-[14px] p-1.5 text-left transition-all",
        isVoteSelected && "bg-gradient-to-br from-primary-light to-[#f5e8c0] ring-2 ring-primary shadow-primary",
        revealedRole === "undercover" && "bg-gradient-to-br from-tertiary-light to-[#ffd4d0] ring-2 ring-tertiary/40",
        revealedRole === "mr_white" && "bg-gradient-to-br from-[#f5e8c0] to-[#faf3e0] ring-2 ring-primary/30",
        revealedRole === "civil" && "bg-gradient-to-br from-[#e0eddb] to-[#edf5e8] ring-2 ring-[#5a8a4a]/20",
        !isVoteSelected && !revealedRole && (
          isSelf
            ? "border border-primary/20 bg-primary-light/40"
            : "border border-ink-100/50 bg-surface-card/80"
        ),
        isInteractive && "cursor-pointer"
      )}
    >
      {/* Drawing — always square */}
      <MiniDrawingCanvas
        strokes={strokes}
        previewStroke={phase === "drawing" ? previewStroke : null}
        size={previewSize}
        className="rounded-[10px]"
      />

      {/* Name row */}
      <div className="flex w-full items-center justify-between gap-1 px-0.5">
        <div className="flex min-w-0 items-center gap-1">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]"
            style={{ background: `linear-gradient(160deg, ${player.profile.color}44, ${player.profile.color}18)` }}
          >
            {player.profile.emoji}
          </span>
          <span className="truncate text-[10px] font-bold text-ink-950">
            {player.profile.name}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {liveLabel && (
            <span className={clsx("rounded-full px-1 py-0.5 text-[7px] font-bold uppercase animate-pulse-soft", chipClasses("accent"))}>
              LIVE
            </span>
          )}
          {revealedRoleLabel && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={clsx("rounded-full px-1 py-0.5 text-[7px] font-bold uppercase", revealedRole === "civil" ? chipClasses("success") : chipClasses("danger"))}
            >
              {revealedRoleLabel}
            </motion.span>
          )}
          {hasVoted && !isSelf && phase === "vote" && (
            <span className="rounded-full bg-[#e0eddb] px-1 py-0.5 text-[7px] font-bold text-[#3d6b30]">✓</span>
          )}
        </div>
      </div>

      {/* Live vote bubbles — Among Us style */}
      {phase === "vote" && voters.length > 0 && (
        <div className="flex w-full flex-wrap items-center gap-0.5 rounded-lg bg-surface-low/50 px-1.5 py-1">
          {voters.map((voter) => (
            <motion.div
              key={voter.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 450, damping: 18 }}
              title={voter.profile.name}
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] ring-1 ring-ink-100/40"
              style={{ background: `linear-gradient(160deg, ${voter.profile.color}55, ${voter.profile.color}22)` }}
            >
              {voter.profile.emoji}
            </motion.div>
          ))}
        </div>
      )}

      {/* Vote action / points */}
      {phase === "vote" && (
        <motion.span
          className={clsx(
            "rounded-full px-2 py-0.5 text-[8px] font-bold uppercase",
            isVoteSelected ? "bg-primary text-ink-950" : chipClasses("neutral")
          )}
        >
          {isVoteSelected ? "✓ Vote" : isSelf ? "Toi" : "Voter"}
        </motion.span>
      )}

      {phase === "resolution" && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={clsx("rounded-full px-2 py-0.5 text-[8px] font-bold uppercase", chipClasses(pointsAwarded && pointsAwarded > 0 ? "success" : "neutral"))}
        >
          {pointsAwarded && pointsAwarded > 0 ? `+${pointsAwarded}` : "0"} pts
        </motion.span>
      )}
    </MotionContainer>
  );
}

export const PlayerBoardCard = memo(PlayerBoardCardComponent);
