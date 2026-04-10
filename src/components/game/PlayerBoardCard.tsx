import { memo, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import type { DrawingStroke, PlayerRole, PlayerView, RoomView } from "@shared/protocol";
import { MiniDrawingCanvas } from "@/components/game/MiniDrawingCanvas";

function sameVoters(next: PlayerView[], prev: PlayerView[]) {
  if (next.length !== prev.length) return false;
  for (let index = 0; index < next.length; index += 1) {
    if (next[index]?.id !== prev[index]?.id) return false;
  }
  return true;
}

function paperAngle(seed: string) {
  const sum = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ((sum % 5) - 2) * 0.6;
}

function PlayerBoardCardComponent({
  phase,
  player,
  strokes,
  previewSize,
  isSelf = false,
  selectedVoteTargetId,
  voteMarkers = [],
  pendingMarkers = [],
  onVote
}: {
  phase: RoomView["phase"];
  player: PlayerView;
  strokes: DrawingStroke[];
  drawingUpdatedAt: number | null;
  previewSize: number;
  dense?: boolean;
  isSelf?: boolean;
  selectedVoteTargetId: string | null;
  hasVoted?: boolean;
  voters?: PlayerView[];
  revealedRole?: PlayerRole | null;
  pointsAwarded?: number;
  voteMarkers?: PlayerView[];
  pendingMarkers?: PlayerView[];
  onVote: (targetPlayerId: string | null) => void;
}) {
  const isVoteSelected = selectedVoteTargetId === player.id;
  const isInteractive = phase === "vote" && !isSelf;
  const tilt = useMemo(() => paperAngle(player.id), [player.id]);
  const Container = isInteractive ? motion.button : motion.article;

  return (
    <Container
      {...(isInteractive ? { type: "button" as const, onClick: () => onVote(player.id) } : {})}
      initial={{ opacity: 0, y: 14, rotate: tilt - 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={clsx(
        "paper-sheet flex w-full flex-col items-center gap-1 overflow-hidden px-1.5 py-1.5 text-left shadow-card transition",
        isInteractive && "cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover active:translate-y-0.5",
        isSelf && "border-[rgba(212,160,23,0.24)] opacity-70",
        isVoteSelected && "border-[rgba(212,160,23,0.36)] ring-2 ring-primary/25"
      )}
    >
      <MiniDrawingCanvas
        strokes={strokes}
        size={previewSize}
        className="rounded-[0.6rem]"
      />

      {/* Name */}
      <div className="w-full truncate text-center font-sketch text-sm font-semibold leading-tight text-ink-950">
        {player.profile.name}
      </div>

      {/* Vote markers — confirmed (color) + pending (grayscale) */}
      {phase === "vote" && (voteMarkers.length > 0 || pendingMarkers.length > 0) ? (
        <div className="flex flex-wrap justify-center gap-0.5">
          {voteMarkers.slice(0, 6).map((voter) => (
            <div
              key={voter.id}
              title={`${voter.profile.name} (voté)`}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-[rgba(74,60,46,0.18)] bg-[rgba(245,239,229,0.96)] text-[10px] shadow-sm"
            >
              {voter.profile.emoji}
            </div>
          ))}
          {pendingMarkers.slice(0, 6 - voteMarkers.length).map((voter) => (
            <div
              key={voter.id}
              title={`${voter.profile.name} (en attente)`}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-[rgba(74,60,46,0.15)] bg-[rgba(245,239,229,0.5)] text-[10px] opacity-50 grayscale"
            >
              {voter.profile.emoji}
            </div>
          ))}
          {voteMarkers.length + pendingMarkers.length > 6 ? (
            <div className="flex h-5 items-center rounded-full bg-paper px-1 text-[9px] font-semibold text-ink-700">
              +{voteMarkers.length + pendingMarkers.length - 6}
            </div>
          ) : null}
        </div>
      ) : null}

      {isSelf && phase === "vote" ? (
        <div className="text-[9px] font-semibold text-ink-400">Toi</div>
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
    sameVoters(prev.voteMarkers ?? [], next.voteMarkers ?? []) &&
    sameVoters(prev.pendingMarkers ?? [], next.pendingMarkers ?? []) &&
    sameVoters(prev.voters ?? [], next.voters ?? []) &&
    prev.revealedRole === next.revealedRole &&
    prev.pointsAwarded === next.pointsAwarded
  );
});
