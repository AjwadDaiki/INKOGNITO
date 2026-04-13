import type { PlayerView, RoomView, RoundView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { CountdownPill } from "@/components/ui/CountdownPill";
import { phaseLabel } from "./gameHelpers";
import { useI18n } from "@/i18n";

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
  void selfPlayer;
  const t = useI18n((s) => s.t);

  return (
    <div className="paper-sheet flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-[1.6rem] px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-sketch text-3xl font-semibold leading-none text-ink-950">
          {phaseLabel(room.phase, t)}
        </span>
        <span className="ink-chip text-xs font-semibold text-ink-700">
          round {round.roundNumber}/{room.totalRounds}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {room.phaseEndsAt ? <CountdownPill endsAt={room.phaseEndsAt} /> : null}
        <Button tone="ghost" onClick={onToggleChat} className="min-h-9 px-3 text-xs">
          {chatOpen ? t("chat.send") : t("lobby.chat")}
        </Button>
        <Button tone="secondary" onClick={onCopyLink} className="min-h-9 px-3 text-xs">
          {copied ? "✓" : t("lobby.copyLink")}
        </Button>
      </div>
    </div>
  );
}
