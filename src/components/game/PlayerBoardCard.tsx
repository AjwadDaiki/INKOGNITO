import { memo, useMemo } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import type { DrawingStroke, PlayerRole, PlayerView, RoomView } from "@shared/protocol";
import { MiniDrawingCanvas } from "@/components/game/MiniDrawingCanvas";

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

function paperAngle(seed: string) {
  const sum = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ((sum % 5) - 2) * 0.8;
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
  voteMarkers = [],
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
  voteMarkers?: PlayerView[];
  onVote: (targetPlayerId: string | null) => void;
}) {
  const isVoteSelected = selectedVoteTargetId === player.id;
  const isInteractive = phase === "vote" && !isSelf;
  const tilt = useMemo(() => paperAngle(player.id), [player.id]);
  const Container = isInteractive ? motion.button : motion.article;
  const compactVoteMarkers = voteMarkers.slice(0, 4);
  const hiddenVoteCount = Math.max(0, voteMarkers.length - compactVoteMarkers.length);

  return (
    <Container
      {...(isInteractive ? { type: "button" as const, onClick: () => onVote(player.id) } : {})}
      initial={{ opacity: 0, y: 18, rotate: tilt - 2 }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={clsx(
        "paper-sheet flex w-full max-w-full flex-col gap-2 overflow-hidden px-2.5 py-2.5 text-left shadow-card transition",
        isInteractive && "cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0.5",
        isSelf && phase === "drawing" && "border-[rgba(212,160,23,0.24)]",
        isVoteSelected && "border-[rgba(212,160,23,0.36)] ring-2 ring-primary/25"
      )}
      data-drawing-updated-at={drawingUpdatedAt ?? "static"}
    >
      <div className="relative">
        <MiniDrawingCanvas
          strokes={strokes}
          previewStroke={phase === "drawing" ? previewStroke : null}
          size={previewSize}
          className="rounded-[1rem]"
          frameClassName={phase === "vote" ? "aspect-[4/3]" : "aspect-[5/4]"}
        />
      </div>

      {phase === "vote" ? (
        <div className="min-h-[2.6rem] px-1">
          {voteMarkers.length > 0 ? (
            <>
              <div className="flex items-center justify-center gap-1.5 sm:hidden">
                {compactVoteMarkers.map((voter) => (
                  <div
                    key={voter.id}
                    title={voter.profile.name}
                    aria-label={`Vote de ${voter.profile.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(74,60,46,0.12)] bg-[rgba(245,239,229,0.96)] text-sm text-ink-700 shadow-[0_2px_6px_rgba(90,68,47,0.12)]"
                  >
                    {voter.profile.emoji}
                  </div>
                ))}
                {hiddenVoteCount > 0 ? (
                  <div className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-[rgba(74,60,46,0.12)] bg-paper px-2 text-[11px] font-semibold text-ink-700">
                    +{hiddenVoteCount}
                  </div>
                ) : null}
              </div>

              <div className="hidden flex-wrap items-center justify-center gap-1.5 sm:flex">
                {voteMarkers.map((voter) => (
                  <div
                    key={voter.id}
                    className="inline-flex items-center gap-1 rounded-full border border-[rgba(74,60,46,0.12)] bg-[rgba(245,239,229,0.96)] px-2 py-1 text-[11px] text-ink-700 shadow-[0_2px_6px_rgba(90,68,47,0.12)]"
                  >
                    <span>{voter.profile.emoji}</span>
                    <span className="max-w-[74px] truncate">{voter.profile.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="px-1 pb-0.5 text-center">
        <div className="truncate font-sketch text-[1.9rem] font-semibold leading-none text-ink-950">
          {player.profile.name}
        </div>
      </div>
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
    sameVoters(prev.voteMarkers ?? [], next.voteMarkers ?? []) &&
    previewSignature(prev.previewStroke) === previewSignature(next.previewStroke) &&
    sameVoters(prev.voters ?? [], next.voters ?? []) &&
    prev.revealedRole === next.revealedRole &&
    prev.pointsAwarded === next.pointsAwarded
  );
});
