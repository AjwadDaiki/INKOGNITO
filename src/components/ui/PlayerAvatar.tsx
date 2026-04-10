import clsx from "clsx";
import type { PlayerView } from "@shared/protocol";

function shapeClass(shape: PlayerView["profile"]["shape"]) {
  switch (shape) {
    case "rounded":
      return "rounded-[28px]";
    case "hex":
      return "rounded-[22px] [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)]";
    case "diamond":
      return "rounded-[18px] rotate-45";
    default:
      return "rounded-full";
  }
}

export function PlayerAvatar({
  player,
  highlighted = false,
  badge,
  compact = false
}: {
  player: PlayerView;
  highlighted?: boolean;
  badge?: string | null;
  compact?: boolean;
}) {
  return (
    <div className={clsx("flex min-w-0 items-center", compact ? "gap-2" : "gap-3")}>
      <div className="relative shrink-0">
        <div
          className={clsx(
            "flex items-center justify-center transition",
            compact ? "h-8 w-8 text-base md:h-9 md:w-9 md:text-lg" : "h-14 w-14 text-2xl",
            shapeClass(player.profile.shape),
            highlighted && "ring-2 ring-primary ring-offset-2"
          )}
          style={{
            background: `linear-gradient(160deg, ${player.profile.color}44, ${player.profile.color}18)`
          }}
        >
          <span className={clsx(player.profile.shape === "diamond" && "-rotate-45")}>
            {player.profile.emoji}
          </span>
        </div>

        {badge ? (
          <span
            className={clsx(
              "absolute rounded-full bg-ink-950 font-bold text-white",
              compact
                ? "-bottom-1 -right-1 px-1.5 py-0.5 text-[9px]"
                : "-bottom-1 -right-1 px-2 py-0.5 text-[10px]"
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <div className="min-w-0">
        <div
          className={clsx(
            "truncate font-semibold text-ink-950",
            compact ? "text-[11px] md:text-xs" : "text-sm"
          )}
        >
          {player.profile.name}
        </div>
        <div className={clsx("truncate text-ink-500", compact ? "text-[10px]" : "text-xs")}>
          {player.connected ? "Connecte" : "Deco"} · {player.points} pts
        </div>
      </div>
    </div>
  );
}
