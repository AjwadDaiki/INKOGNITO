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
  badge
}: {
  player: PlayerView;
  highlighted?: boolean;
  badge?: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div
          className={clsx(
            "flex h-14 w-14 items-center justify-center border border-white/10 bg-white/5 text-2xl shadow-lg transition",
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
          <span className="absolute -bottom-1 -right-1 rounded-full border border-white/10 bg-ink-900 px-2 py-0.5 text-[10px] font-semibold text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-white">{player.profile.name}</div>
        <div className="text-xs text-ink-300">
          {player.connected ? "Connecté" : "Déconnecté"} · {player.points} pts
        </div>
      </div>
    </div>
  );
}
