import { memo } from "react";
import clsx from "clsx";
import type { DrawingStroke, PlayerRole, PlayerView, RoomView } from "@shared/protocol";
import { MiniDrawingCanvas } from "@/components/game/MiniDrawingCanvas";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

function roleLabel(role: PlayerRole | null | undefined) {
  if (role === "undercover") return "UNDERCOVER";
  if (role === "mr_white") return "MR.WHITE";
  if (role === "civil") return "CIVIL";
  return null;
}

function chipClasses(tone: "neutral" | "accent" | "danger" | "success" = "neutral") {
  if (tone === "accent") return "bg-primary-light text-primary-dark";
  if (tone === "danger") return "bg-tertiary-light text-tertiary";
  if (tone === "success") return "bg-[#dcfce7] text-[#15803d]";
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
  dense?: boolean;
  isSelf?: boolean;
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
  const isInteractive = (phase === "discussion" || phase === "vote") && !isSelf;
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
      {...(isInteractive ? { type: "button" as const, onClick: handleClick } : {})}
      className={clsx(
        "grid h-full w-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] rounded-[22px] text-left transition duration-200",
        dense ? "gap-1 p-1.5" : "gap-1.5 p-2",
        isVoteSelected && "bg-primary-light ring-2 ring-primary",
        isSuspect && phase === "discussion" && "bg-tertiary-light ring-2 ring-tertiary",
        revealedRole === "undercover" && "bg-tertiary-light",
        revealedRole === "mr_white" && "bg-[#FEF3C7]",
        revealedRole === "civil" && "bg-[#dcfce7]",
        !isVoteSelected &&
          !(isSuspect && phase === "discussion") &&
          !revealedRole &&
          (isSelf
            ? "border border-[rgba(240,192,0,0.3)] bg-primary-light"
            : "border border-[rgba(15,23,42,0.07)] bg-surface-card shadow-[0_3px_0_rgba(15,23,42,0.08)] hover:bg-surface-low"),
        isInteractive && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-1">
        <PlayerAvatar player={player} highlighted={isVoteSelected || isSuspect} compact />
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
            <span
              className={clsx(
                "rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em]",
                revealedRole === "civil" ? chipClasses("success") : chipClasses("danger")
              )}
            >
              {revealedRoleLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <div className="aspect-square h-full max-h-full w-full max-w-full overflow-hidden rounded-[16px] bg-white shadow-card">
          <MiniDrawingCanvas
            strokes={strokes}
            previewStroke={phase === "drawing" ? previewStroke : null}
            size={previewSize}
            className="h-full w-full rounded-[16px] bg-white"
          />
        </div>
      </div>

      <div className="flex min-h-[18px] items-center justify-between gap-1 text-[10px]">
        {phase === "discussion" ? (
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 font-bold uppercase tracking-[0.12em]",
              isSuspect ? chipClasses("danger") : chipClasses("neutral")
            )}
          >
            {isSuspect ? "Suspect" : "Designer"}
          </span>
        ) : phase === "vote" ? (
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 font-bold uppercase tracking-[0.12em]",
              isVoteSelected ? chipClasses("accent") : chipClasses("neutral")
            )}
          >
            {isVoteSelected ? "Vote" : "Voter"}
          </span>
        ) : (
          <span />
        )}

        {phase === "resolution" ? (
          <span
            className={clsx(
              "rounded-full px-2 py-0.5 font-bold uppercase tracking-[0.12em]",
              chipClasses(pointsAwarded && pointsAwarded > 0 ? "success" : "neutral")
            )}
          >
            +{pointsAwarded ?? 0} pts
          </span>
        ) : null}
      </div>
    </Container>
  );
}

export const PlayerBoardCard = memo(PlayerBoardCardComponent);
