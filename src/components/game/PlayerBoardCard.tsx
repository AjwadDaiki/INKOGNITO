import { memo } from "react";
import clsx from "clsx";
import type {
  DrawingStroke,
  PlayerRole,
  PlayerView,
  ReactionEmoji,
  RoomView
} from "@shared/protocol";
import { MiniDrawingCanvas } from "@/components/game/MiniDrawingCanvas";
import { Button } from "@/components/ui/Button";
import { EmojiReactionBar } from "@/components/ui/EmojiReactionBar";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

function roleLabel(role: PlayerRole | null | undefined) {
  if (role === "undercover") return "UNDERCOVER";
  if (role === "mr_white") return "MR.WHITE";
  if (role === "civil") return "CIVIL";
  return null;
}

function chipClasses(tone: "neutral" | "accent" | "danger" | "success" = "neutral") {
  if (tone === "accent") return "border-neon-cyan/35 bg-neon-cyan/10 text-neon-cyan";
  if (tone === "danger") return "border-neon-rose/35 bg-neon-rose/10 text-rose-100";
  if (tone === "success") return "border-neon-green/35 bg-neon-green/10 text-neon-green";
  return "border-white/10 bg-white/5 text-ink-200";
}

function PlayerBoardCardComponent({
  phase,
  player,
  strokes,
  previewStroke,
  previewSize,
  isSelf,
  isSuspect,
  accuseCount,
  selfPointerTargetId,
  selectedVoteTargetId,
  revealedRole,
  pointsAwarded,
  reactionCounts,
  onReact,
  onPointFinger,
  onVote
}: {
  phase: RoomView["phase"];
  player: PlayerView;
  strokes: DrawingStroke[];
  previewStroke?: DrawingStroke | null;
  previewSize: number;
  isSelf: boolean;
  isSuspect: boolean;
  accuseCount: number;
  selfPointerTargetId: string | null;
  selectedVoteTargetId: string | null;
  revealedRole?: PlayerRole | null;
  pointsAwarded?: number;
  reactionCounts: Array<[ReactionEmoji, number]>;
  onReact: (targetPlayerId: string, emoji: ReactionEmoji) => void;
  onPointFinger: (targetPlayerId: string | null) => void;
  onVote: (targetPlayerId: string | null) => void;
}) {
  const canVote = phase === "vote" && !isSelf;
  const isVoteSelected = selectedVoteTargetId === player.id;
  const isPointedBySelf = selfPointerTargetId === player.id;
  const liveLabel = phase === "drawing" && previewStroke ? "LIVE" : null;
  const revealedRoleLabel = roleLabel(revealedRole);
  const showControls = phase === "gallery" || phase === "discussion";
  const Container = canVote ? "button" : "article";
  const topReaction = reactionCounts[0];

  return (
    <Container
      {...(canVote
        ? {
            type: "button" as const,
            onClick: () => onVote(player.id)
          }
        : {})}
      className={clsx(
        "flex h-full min-h-0 flex-col rounded-[22px] border p-2.5 text-left transition duration-200",
        isVoteSelected && "border-neon-cyan/45 bg-neon-cyan/10 shadow-cyan",
        isSuspect && "border-neon-rose/35 bg-neon-rose/10 shadow-rose",
        revealedRole === "undercover" && "border-neon-rose/35 bg-neon-rose/10",
        revealedRole === "mr_white" && "border-amber-300/35 bg-amber-300/10",
        !isVoteSelected &&
          !isSuspect &&
          !revealedRole &&
          "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.055]",
        canVote && "cursor-pointer"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <PlayerAvatar
          player={player}
          highlighted={isSuspect || isVoteSelected}
          badge={isSelf ? "toi" : null}
          compact
        />
        <div className="flex flex-wrap justify-end gap-1">
          {liveLabel ? (
            <span
              className={clsx(
                "rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] animate-pulse-soft",
                chipClasses("accent")
              )}
            >
              {liveLabel}
            </span>
          ) : null}
          {accuseCount > 0 && phase === "discussion" ? (
            <span
              className={clsx(
                "rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]",
                chipClasses("danger")
              )}
            >
              {accuseCount}
            </span>
          ) : null}
          {revealedRoleLabel ? (
            <span
              className={clsx(
                "rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]",
                revealedRole === "civil"
                  ? chipClasses("success")
                  : chipClasses("danger")
              )}
            >
              {revealedRoleLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <MiniDrawingCanvas
          strokes={strokes}
          previewStroke={phase === "drawing" ? previewStroke : null}
          size={previewSize}
          className="rounded-[18px] bg-white"
        />
      </div>

      <div className="mt-2 flex min-h-[20px] items-center justify-between gap-2 text-[11px]">
        <div className="truncate text-ink-300">
          {topReaction ? `${topReaction[0]} x${topReaction[1]}` : phase === "vote" ? "Choisis ta cible" : ""}
        </div>
        {phase === "resolution" ? (
          <span
            className={clsx(
              "rounded-full border px-2 py-0.5 font-semibold uppercase tracking-[0.18em]",
              chipClasses(pointsAwarded && pointsAwarded > 0 ? "success" : "neutral")
            )}
          >
            +{pointsAwarded ?? 0}
          </span>
        ) : isVoteSelected ? (
          <span className={clsx("rounded-full border px-2 py-0.5 font-semibold", chipClasses("accent"))}>
            vote
          </span>
        ) : null}
      </div>

      {showControls ? (
        <div className="mt-2 space-y-2">
          <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-2">
            <EmojiReactionBar onReact={(emoji) => onReact(player.id, emoji)} />
          </div>
          {phase === "discussion" && !isSelf ? (
            <div className="grid grid-cols-2 gap-2">
              <Button tone={isPointedBySelf ? "primary" : "secondary"} onClick={() => onPointFinger(player.id)}>
                {isPointedBySelf ? "Vise" : "Accuser"}
              </Button>
              {isPointedBySelf ? (
                <Button tone="ghost" onClick={() => onPointFinger(null)}>
                  Retirer
                </Button>
              ) : (
                <div />
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </Container>
  );
}

export const PlayerBoardCard = memo(PlayerBoardCardComponent);
