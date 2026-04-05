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
  if (role === "mr_white") return "MR. WHITE";
  if (role === "civil") return "CIVIL";
  return null;
}

function chipClassName(tone: "neutral" | "accent" | "danger" | "success" = "neutral") {
  if (tone === "accent") {
    return "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan";
  }
  if (tone === "danger") {
    return "border-neon-rose/30 bg-neon-rose/10 text-rose-100";
  }
  if (tone === "success") {
    return "border-neon-green/30 bg-neon-green/10 text-neon-green";
  }
  return "border-white/10 bg-white/5 text-ink-200";
}

export function PlayerBoardCard({
  phase,
  player,
  strokes,
  previewStroke,
  reactionCounts,
  previewSize,
  isSelf,
  isSuspect,
  accuseCount,
  selfPointerTargetId,
  selectedVoteTargetId,
  revealedRole,
  pointsAwarded,
  onReact,
  onPointFinger,
  onVote
}: {
  phase: RoomView["phase"];
  player: PlayerView;
  strokes: DrawingStroke[];
  previewStroke?: DrawingStroke | null;
  reactionCounts: Array<[ReactionEmoji, number]>;
  previewSize: number;
  isSelf: boolean;
  isSuspect: boolean;
  accuseCount: number;
  selfPointerTargetId: string | null;
  selectedVoteTargetId: string | null;
  revealedRole?: PlayerRole | null;
  pointsAwarded?: number;
  onReact: (targetPlayerId: string, emoji: ReactionEmoji) => void;
  onPointFinger: (targetPlayerId: string | null) => void;
  onVote: (targetPlayerId: string | null) => void;
}) {
  const canVote = phase === "vote" && !isSelf;
  const isVoteSelected = selectedVoteTargetId === player.id;
  const isPointedBySelf = selfPointerTargetId === player.id;
  const liveLabel = phase === "drawing" && previewStroke ? "live" : null;
  const revealedRoleLabel = roleLabel(revealedRole);
  const Container = canVote ? "button" : "article";
  const showReactionSummary =
    reactionCounts.length > 0 || phase === "gallery" || phase === "discussion" || phase === "resolution";

  return (
    <Container
      {...(canVote
        ? {
            type: "button" as const,
            onClick: () => onVote(player.id)
          }
        : {})}
      className={clsx(
        "rounded-[28px] border p-4 text-left transition",
        isVoteSelected && "border-neon-cyan/45 bg-neon-cyan/10 shadow-cyan",
        isSuspect && "border-neon-rose/35 bg-neon-rose/10 shadow-rose",
        !isVoteSelected &&
          !isSuspect &&
          "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.055]",
        canVote && "cursor-pointer"
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <PlayerAvatar player={player} highlighted={isSuspect || isVoteSelected} badge={isSelf ? "toi" : null} />
        <div className="flex flex-wrap justify-end gap-2">
          {liveLabel ? (
            <span
              className={clsx(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] animate-pulse-soft",
                chipClassName("accent")
              )}
            >
              {liveLabel}
            </span>
          ) : null}
          {accuseCount > 0 && phase === "discussion" ? (
            <span
              className={clsx(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                chipClassName("danger")
              )}
            >
              {accuseCount} vise
            </span>
          ) : null}
          {isVoteSelected ? (
            <span
              className={clsx(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                chipClassName("accent")
              )}
            >
              ton vote
            </span>
          ) : null}
          {revealedRoleLabel ? (
            <span
              className={clsx(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                revealedRole === "civil"
                  ? chipClassName("success")
                  : chipClassName("danger")
              )}
            >
              {revealedRoleLabel}
            </span>
          ) : null}
        </div>
      </div>

      <MiniDrawingCanvas
        strokes={strokes}
        previewStroke={phase === "drawing" ? previewStroke : null}
        size={previewSize}
        className="rounded-[24px] bg-white"
      />

      {showReactionSummary && reactionCounts.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-200">
          {reactionCounts.map(([emoji, count]) => (
            <span key={emoji} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
              {emoji} x{count}
            </span>
          ))}
        </div>
      ) : showReactionSummary ? (
        <div className="mt-3 text-xs text-ink-300">Pas encore de reaction.</div>
      ) : null}

      {phase === "gallery" || phase === "discussion" ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-3">
            <EmojiReactionBar onReact={(emoji) => onReact(player.id, emoji)} />
          </div>
          {phase === "discussion" && !isSelf ? (
            <div className="flex flex-wrap gap-2">
              <Button tone={isPointedBySelf ? "primary" : "secondary"} onClick={() => onPointFinger(player.id)}>
                {isPointedBySelf ? "Tu l'accuses" : "Accuser"}
              </Button>
              {isPointedBySelf ? (
                <Button tone="ghost" onClick={() => onPointFinger(null)}>
                  Retirer
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {phase === "vote" ? (
        <div className="mt-4 text-sm text-ink-300">
          {isSelf ? "Tu ne peux pas te voter." : "Clique sur cette carte pour voter."}
        </div>
      ) : null}

      {phase === "resolution" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={clsx(
              "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]",
              chipClassName(pointsAwarded && pointsAwarded > 0 ? "success" : "neutral")
            )}
          >
            +{pointsAwarded ?? 0} pts
          </span>
          {isSuspect ? (
            <span
              className={clsx(
                "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]",
                chipClassName("danger")
              )}
            >
              suspect
            </span>
          ) : null}
        </div>
      ) : null}
    </Container>
  );
}
