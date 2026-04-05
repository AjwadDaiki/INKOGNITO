import type { PlayerView, RoomView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function RoleRevealScreen({
  room,
  selfPlayer,
  onConfirm
}: {
  room: RoomView;
  selfPlayer: PlayerView;
  onConfirm: () => void;
}) {
  const ownWord = room.round?.role.ownWord ?? null;
  const confirmedCount = room.roleConfirmedPlayerIds.length;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-8">
      <GlassPanel className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-3">
          <div className="text-sm uppercase tracking-[0.24em] text-ink-300">Carte du round</div>
          <h1 className="font-display text-4xl text-white md:text-5xl">Memorise ton mot</h1>
          <p className="mx-auto max-w-xl text-ink-300">
            Ne montre rien aux autres. Quand tout le monde a confirme, le dessin commence.
          </p>
        </div>

        <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
          <div className="mb-3 text-xs uppercase tracking-[0.28em] text-ink-300">Ton mot</div>
          <div className="font-display text-5xl text-white">{ownWord ?? "???"}</div>
          <p className="mt-5 text-sm text-ink-300">
            Si aucun mot n'apparait, improvise et essaie de suivre l'energie de la table.
          </p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-2 text-sm font-semibold text-white">
            {selfPlayer.profile.emoji} {selfPlayer.profile.name}
          </div>
          <div className="text-sm text-ink-300">
            {confirmedCount}/{room.players.length} joueurs ont confirme.
          </div>
        </div>

        <Button onClick={onConfirm}>J'ai memorise</Button>
      </GlassPanel>
    </div>
  );
}
