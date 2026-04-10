import { motion } from "framer-motion";
import type { PlayerView, RoomView, RoundView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { CountdownPill } from "@/components/ui/CountdownPill";
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
  const isActionPhase = room.phase === "vote" || room.phase === "resolution";

  return (
    <div className="flex shrink-0 items-center gap-2 rounded-[20px] bg-surface-card/80 px-3 py-1.5 shadow-[0_2px_8px_rgba(26,20,16,0.06)] backdrop-blur-md">
      {/* Phase + round */}
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${phaseBg(room.phase)}`}>
        {phaseLabel(room.phase)}
      </span>
      <span className="text-xs text-ink-400">R{round.roundNumber}/{room.totalRounds}</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Timer — always visible when timed */}
      {room.phaseEndsAt && <CountdownPill endsAt={room.phaseEndsAt} />}

      {/* Secondary controls — hide during action phases to declutter */}
      {!isActionPhase && (
        <>
          <Button tone="ghost" onClick={onToggleChat} className="min-h-8 px-2 text-xs">
            {chatOpen ? "✕" : "💬"}
          </Button>
          <Button tone="secondary" onClick={onCopyLink} className="min-h-8 px-2 text-xs">
            {copied ? "✓" : "Lien"}
          </Button>
        </>
      )}
    </div>
  );
}
