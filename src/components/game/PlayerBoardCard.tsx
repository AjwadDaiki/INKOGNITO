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

function previewSignature(stroke?: DrawingStroke | null) {
  if (!stroke) return "";
  const lastPoint = stroke.points[stroke.points.length - 1];
  return `${stroke.id}:${stroke.points.length}:${lastPoint?.x ?? 0}:${lastPoint?.y ?? 0}`;
}

function sameVoters(next: PlayerView[], prev: PlayerView[]) {
  if (next.length !== prev.length) return false;
  for (let index = 0; index < next.length; index += 1) {
    if (next[index]?.id !== prev[index]?.id) return false;
  }
  return true;
}

function PlayerBoardCardComponent({
  phase,
  player,
  strokes,
  drawingUpdatedAt,
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
  drawingUpdatedAt: number | null;
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
  const Container = isInteractive ? "button" : "article";

  return (
    <Container
      {...(isInteractive ? { type: "button" as const, onClick: () => onVote(player.id) } : {})}
      className={clsx(
        "flex flex-col items-center gap-1 rounded-[14px] p-1.5 text-left transition-transform duration-150 will-change-transform",
        isInteractive && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        isVoteSelected && "bg-gradient-to-br from-primary-light to-[#f5e8c0] ring-2 ring-primary shadow-primary",
        revealedRole === "undercover" && "bg-gradient-to-br from-tertiary-light to-[#ffd4d0] ring-2 ring-tertiary/40",
        revealedRole === "mr_white" && "bg-gradient-to-br from-[#f5e8c0] to-[#faf3e0] ring-2 ring-primary/30",
        revealedRole === "civil" && "bg-gradient-to-br from-[#e0eddb] to-[#edf5e8] ring-2 ring-[#5a8a4a]/20",
        !isVoteSelected && !revealedRole && (
          isSelf
            ? "border border-primary/20 bg-primary-light/40"
            : "border border-ink-100/50 bg-surface-card/80"
        )
      )}
      data-drawing-updated-at={drawingUpdatedAt ?? "static"}
    >
      <MiniDrawingCanvas
        strokes={strokes}
        previewStroke={phase === "drawing" ? previewStroke : null}
        size={previewSize}
        className="rounded-[10px]"
      />

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
          {liveLabel ? (
            <span
              className={clsx(
                "rounded-full px-1 py-0.5 text-[7px] font-bold uppercase animate-pulse-soft",
                chipClasses("accent")
              )}
            >
              LIVE
            </span>
          ) : null}
          {revealedRoleLabel ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={clsx(
                "rounded-full px-1 py-0.5 text-[7px] font-bold uppercase",
                revealedRole === "civil" ? chipClasses("success") : chipClasses("danger")
              )}
            >
              {revealedRoleLabel}
            </motion.span>
          ) : null}
          {hasVoted && !isSelf && phase === "vote" ? (
            <span className="rounded-full bg-[#e0eddb] px-1 py-0.5 text-[7px] font-bold text-[#3d6b30]">
              ✓
            </span>
          ) : null}
        </div>
      </div>

      {phase === "vote" && voters.length > 0 ? (
        <div className="flex w-full flex-wrap items-center gap-0.5 rounded-lg bg-surface-low/50 px-1.5 py-1">
          {voters.map((voter) => (
            <div
              key={voter.id}
              title={voter.profile.name}
              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] ring-1 ring-ink-100/40"
              style={{ background: `linear-gradient(160deg, ${voter.profile.color}55, ${voter.profile.color}22)` }}
            >
              {voter.profile.emoji}
            </div>
          ))}
        </div>
      ) : null}

      {phase === "vote" ? (
        <span
          className={clsx(
            "rounded-full px-2 py-0.5 text-[8px] font-bold uppercase",
            isVoteSelected ? "bg-primary text-ink-950" : chipClasses("neutral")
          )}
        >
          {isVoteSelected ? "✓ Vote" : isSelf ? "Toi" : "Voter"}
        </span>
      ) : null}

      {phase === "resolution" ? (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={clsx(
            "rounded-full px-2 py-0.5 text-[8px] font-bold uppercase",
            chipClasses(pointsAwarded && pointsAwarded > 0 ? "success" : "neutral")
          )}
        >
          {pointsAwarded && pointsAwarded > 0 ? `+${pointsAwarded}` : "0"} pts
        </motion.span>
      ) : null}
    </Container>
  );
}

export const PlayerBoardCard = memo(PlayerBoardCardComponent, (prev, next) => {
  return (
    prev.phase === next.phase &&
    prev.player.id === next.player.id &&
    prev.player.profile.name === next.player.profile.name &&
    prev.player.profile.emoji === next.player.profile.emoji &&
    prev.player.profile.color === next.player.profile.color &&
    prev.player.connected === next.player.connected &&
    prev.player.ready === next.player.ready &&
    prev.player.points === next.player.points &&
    prev.drawingUpdatedAt === next.drawingUpdatedAt &&
    prev.previewSize === next.previewSize &&
    prev.isSelf === next.isSelf &&
    prev.selectedVoteTargetId === next.selectedVoteTargetId &&
    prev.hasVoted === next.hasVoted &&
    prev.revealedRole === next.revealedRole &&
    prev.pointsAwarded === next.pointsAwarded &&
    previewSignature(prev.previewStroke) === previewSignature(next.previewStroke) &&
    sameVoters(prev.voters ?? [], next.voters ?? [])
  );
});
