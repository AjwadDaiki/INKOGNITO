import type { PlayerView, RoomView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";

const ROLE_STYLES = {
  civil: {
    title: "Civil",
    accent: "bg-neon-green/15 text-neon-green border-neon-green/20",
    body: "Tu connais le vrai mot. Dessine juste assez bien pour aider les autres sans donner trop d’infos."
  },
  undercover: {
    title: "Undercover",
    accent: "bg-neon-rose/15 text-neon-rose border-neon-rose/20",
    body: "Ton mot est proche. Fonds-toi dans la masse, observe le live et évite d’être le suspect majoritaire."
  },
  mr_white: {
    title: "Mr. White",
    accent: "bg-white/15 text-white border-white/20",
    body: "Tu n’as aucun mot. Improvise, copie l’énergie des autres, puis tente de survivre au vote."
  }
} as const;

export function RoleRevealScreen({
  room,
  selfPlayer,
  onConfirm
}: {
  room: RoomView;
  selfPlayer: PlayerView;
  onConfirm: () => void;
}) {
  const role = room.round?.role.ownRole ?? "civil";
  const ownWord = room.round?.role.ownWord ?? "???";
  const confirmedCount = room.roleConfirmedPlayerIds.length;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-4 py-8">
      <GlassPanel className="w-full max-w-3xl space-y-8 text-center">
        <div className="space-y-3">
          <div className="text-sm uppercase tracking-[0.24em] text-ink-300">Distribution des rôles</div>
          <h1 className="font-display text-4xl text-white md:text-5xl">Ta carte est tombée</h1>
          <p className="mx-auto max-w-xl text-ink-300">
            L’animation est synchrone pour tout le monde. Lis ton rôle, mémorise ton mot, puis
            confirme quand tu es prêt à dessiner.
          </p>
        </div>

        <div className={`mx-auto max-w-xl rounded-[32px] border p-8 ${ROLE_STYLES[role].accent}`}>
          <div className="mb-3 text-xs uppercase tracking-[0.28em]">Ton rôle</div>
          <div className="font-display text-4xl text-white">{ROLE_STYLES[role].title}</div>
          <div className="mt-6 rounded-[24px] bg-black/25 p-6">
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/70">Ton mot</div>
            <div className="font-display text-3xl tracking-[-0.02em] text-white">
              {role === "mr_white" ? "???" : ownWord}
            </div>
          </div>
          <p className="mt-5 text-sm text-white/80">{ROLE_STYLES[role].body}</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-2 text-sm font-semibold text-white">{selfPlayer.profile.emoji} {selfPlayer.profile.name}</div>
          <div className="text-sm text-ink-300">
            {confirmedCount}/{room.players.length} joueurs ont confirmé leur carte.
          </div>
        </div>

        <Button onClick={onConfirm}>C’est parti</Button>
      </GlassPanel>
    </div>
  );
}
