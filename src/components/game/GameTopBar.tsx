import { motion } from "framer-motion";
import type { PlayerView, RoomView, RoundView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { CountdownPill } from "@/components/ui/CountdownPill";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { phaseBg, phaseLabel } from "./gameHelpers";

export function GameTopBar({
  room,
  round,
  selfPlayer,
  chatOpen,
  copied,
  onToggleChat,
  onCopyLink
}: {
  room: RoomView;
  round: RoundView;
  selfPlayer: PlayerView;
  chatOpen: boolean;
  copied: boolean;
  onToggleChat: () => void;
  onCopyLink: () => void;
}) {
  return (
    <GlassPanel className="shrink-0 px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${phaseBg(room.phase)}`}>
            {phaseLabel(room.phase)}
          </span>
          <span className="text-xs text-ink-400">R{round.roundNumber}</span>
        </div>

        {/* Live scores */}
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex-none lg:flex-wrap lg:overflow-visible">
          {room.players.map((p, i) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 0, scale: 0.7, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 20 }}
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                p.id === selfPlayer.id
                  ? "bg-primary-light text-ink-950"
                  : "bg-surface-low/70 text-ink-600"
              }`}
            >
              {p.profile.emoji} {p.points}
            </motion.span>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {room.phase !== "drawing" && <CountdownPill endsAt={room.phaseEndsAt} />}
          <Button tone="ghost" onClick={onToggleChat} className="min-h-8 px-2 text-xs">
            {chatOpen ? "✕" : "💬"}
          </Button>
          <Button tone="secondary" onClick={onCopyLink} className="min-h-8 px-2 text-xs">
            {copied ? "✓" : "Lien"}
          </Button>
        </div>
      </div>
    </GlassPanel>
  );
}
