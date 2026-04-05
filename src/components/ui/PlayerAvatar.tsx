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
      <div className="relative">
        <div
          className={clsx(
            "flex items-center justify-center border border-white/10 bg-white/5 shadow-lg transition",
            compact ? "h-10 w-10 text-lg" : "h-14 w-14 text-2xl",
            shapeClass(player.profile.shape),
            highlighted && "scale-105 ring-2 ring-neon-cyan/60"
          )}
          style={{
            background: `linear-gradient(180deg, ${player.profile.color}33, rgba(255,255,255,0.05))`,
            boxShadow: `0 0 0 1px ${player.profile.color}66, 0 10px 30px ${player.profile.color}33`
          }}
        >
          <span className={clsx(player.profile.shape === "diamond" && "-rotate-45")}>
            {player.profile.emoji}
          </span>
        </div>
        {badge ? (
          <span
            className={clsx(
              "absolute rounded-full border border-white/10 bg-ink-900 font-semibold text-white",
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
        <div className={clsx("truncate font-semibold text-white", compact ? "text-xs" : "text-sm")}>
          {player.profile.name}
        </div>
        <div className={clsx("text-ink-300", compact ? "text-[11px]" : "text-xs")}>
          {player.connected ? "Connecte" : "Deco"} · {player.points} pts
        </div>
      </div>
    </div>
  );
}
