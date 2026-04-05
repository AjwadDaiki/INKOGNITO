import { memo } from "react";
import clsx from "clsx";
import type {
  DrawingStroke,
  PlayerRole,
  PlayerView,
  RoomView
} from "@shared/protocol";
import { MiniDrawingCanvas } from "@/components/game/MiniDrawingCanvas";
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
  isSuspect,
  selectedVoteTargetId,
  revealedRole,
  pointsAwarded,
  onPointFinger,
  onVote
}: {
  phase: RoomView["phase"];
  player: PlayerView;
  strokes: DrawingStroke[];
  previewStroke?: DrawingStroke | null;
  previewSize: number;
  isSuspect: boolean;
  selectedVoteTargetId: string | null;
  revealedRole?: PlayerRole | null;
  pointsAwarded?: number;
  onPointFinger: (targetPlayerId: string | null) => void;
  onVote: (targetPlayerId: string | null) => void;
}) {
  const isVoteSelected = selectedVoteTargetId === player.id;
  const liveLabel = phase === "drawing" && previewStroke ? "LIVE" : null;
  const revealedRoleLabel = roleLabel(revealedRole);
  const isInteractive = phase === "discussion" || phase === "vote";
  const Container = isInteractive ? "button" : "article";

  function handleClick() {
    if (phase === "discussion") {
      onPointFinger(isSuspect ? null : player.id);
      return;
    }
    if (phase === "vote") {
      onVote(player.id);
    }
  }

  return (
    <Container
      {...(isInteractive
        ? {
            type: "button" as const,
            onClick: handleClick
          }
        : {})}
      className={clsx(
        "flex h-full min-h-0 flex-col rounded-[22px] border p-2.5 text-left transition duration-200",
        isVoteSelected && "border-neon-cyan/45 bg-neon-cyan/10 shadow-cyan",
        isSuspect && phase === "discussion" && "border-neon-rose/35 bg-neon-rose/10 shadow-rose",
        revealedRole === "undercover" && "border-neon-rose/35 bg-neon-rose/10",
        revealedRole === "mr_white" && "border-amber-300/35 bg-amber-300/10",
        !isVoteSelected &&
          !(isSuspect && phase === "discussion") &&
          !revealedRole &&
          "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.055]",
        isInteractive && "cursor-pointer"
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <PlayerAvatar player={player} highlighted={isVoteSelected || isSuspect} compact />
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
        {phase === "discussion" ? (
          <span
            className={clsx(
              "rounded-full border px-2 py-0.5 font-semibold uppercase tracking-[0.18em]",
              isSuspect ? chipClasses("danger") : chipClasses("neutral")
            )}
          >
            {isSuspect ? "Suspect" : "Cliquer"}
          </span>
        ) : phase === "vote" ? (
          <span
            className={clsx(
              "rounded-full border px-2 py-0.5 font-semibold uppercase tracking-[0.18em]",
              isVoteSelected ? chipClasses("accent") : chipClasses("neutral")
            )}
          >
            {isVoteSelected ? "Vote" : "Choisir"}
          </span>
        ) : (
          <span className="text-ink-300" />
        )}

        {phase === "resolution" ? (
          <span
            className={clsx(
              "rounded-full border px-2 py-0.5 font-semibold uppercase tracking-[0.18em]",
              chipClasses(pointsAwarded && pointsAwarded > 0 ? "success" : "neutral")
            )}
          >
            +{pointsAwarded ?? 0}
          </span>
        ) : null}
      </div>
    </Container>
  );
}

export const PlayerBoardCard = memo(PlayerBoardCardComponent);
