import { motion } from "framer-motion";
import type { PlayerView, RoomView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { InkSplatter } from "@/components/ui/InkSplatter";

function roleTone(room: RoomView) {
  const role = room.round?.role.ownRole;
  if (role === "mr_white") {
    return {
      chip: "border-[rgba(139,105,20,0.24)] bg-primary-light text-primary-dark",
      title: "Mr White",
      subtitle: "Tu n'as pas de mot. Observe les autres et improvise."
    };
  }

  if (role === "undercover") {
    return {
      chip: "border-[rgba(120,42,33,0.24)] bg-tertiary-light text-tertiary",
      title: "Undercover",
      subtitle: "Ton mot ressemble au leur. Dessine sans te trahir."
    };
  }

  return {
    chip: "border-[rgba(139,105,20,0.24)] bg-primary-light text-primary-dark",
    title: "Civil",
    subtitle: "Tu connais le vrai mot. Fais-le comprendre sans l'écrire."
  };
}

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
  const tone = roleTone(room);

  return (
    <div className="relative flex h-[100svh] items-center justify-center overflow-hidden p-4 md:p-6">
      <InkSplatter variant={0} className="left-[8%] top-[10%]" size={220} opacity={0.08} />
      <InkSplatter variant={1} className="bottom-[10%] right-[8%]" size={220} opacity={0.09} />

      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: -0.8 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="paper-sheet notebook-page desk-shadow animate-page-settle w-full max-w-3xl overflow-hidden px-6 py-7 md:px-10 md:py-8"
      >
        <div className="absolute right-8 top-10 h-20 w-20 rounded-full bg-ink-950/8" />
        <div className="pl-7 md:pl-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-500">Carte secrète</div>
              <div className="mt-1 font-sketch text-5xl font-bold leading-none text-ink-950 md:text-6xl">
                {selfPlayer.profile.name}
              </div>
            </div>
            <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${tone.chip}`}>
              {tone.title}
            </div>
          </div>

          <div className="paper-divider my-5" />

          <motion.div
            initial={{ opacity: 0, y: 18, rotate: 2.4 }}
            animate={{ opacity: 1, y: 0, rotate: 1.1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 24 }}
            className="paper-sheet mx-auto max-w-2xl px-6 py-8 text-center"
          >
            <div className="font-sketch text-3xl font-semibold text-ink-700">
              {ownWord ? "Ton mot" : "Aucun mot"}
            </div>
            <div className="mt-3 font-sketch text-6xl font-bold leading-none text-ink-950 md:text-7xl">
              {ownWord ?? "?"}
            </div>
            <div className="mt-4 text-base text-ink-700 md:text-lg">{tone.subtitle}</div>
          </motion.div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="rounded-[1.5rem] border border-[rgba(74,60,46,0.1)] bg-paper/80 px-4 py-4">
              <div className="font-sketch text-3xl font-semibold text-ink-900">Avant de passer</div>
              <div className="mt-2 space-y-1.5 text-sm text-ink-700">
                <div>Mémorise ton rôle et ton mot.</div>
                <div>Cache cet écran aux autres.</div>
                <div>Clique seulement quand tu es prêt.</div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[rgba(74,60,46,0.1)] bg-ink-950 px-5 py-4 text-paper md:min-w-[220px]">
              <div className="text-xs uppercase tracking-[0.18em] text-paper/60">Confirmations</div>
              <div className="mt-2 font-sketch text-5xl font-bold leading-none">
                {confirmedCount}/{room.players.length}
              </div>
              <div className="mt-2 text-sm text-paper/70">pages déjà refermées</div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={onConfirm} fullWidth>
              J'ai mémorisé
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
