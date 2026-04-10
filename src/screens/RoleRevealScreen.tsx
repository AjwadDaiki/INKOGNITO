import { motion } from "framer-motion";
import type { PlayerView, RoomView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { InkSplatter } from "@/components/ui/InkSplatter";

function roleTone(room: RoomView) {
  const role = room.round?.role.role;
  if (role === "mr_white") {
    return {
      panel: "from-[#fff4d6] to-[#ffe3a3]",
      chip: "bg-[#f5e8c0] text-[#8B6914]",
      title: "Mr White",
      subtitle: "Tu n'as pas de mot. Observe, bluffe, puis devine a la fin."
    };
  }

  if (role === "undercover") {
    return {
      panel: "from-[#ffe8e5] to-[#ffd2cd]",
      chip: "bg-tertiary-light text-tertiary",
      title: "Undercover",
      subtitle: "Ton mot ressemble a celui des autres. Ne te trahis pas."
    };
  }

  return {
    panel: "from-[#fff5cc] to-[#ffe27a]",
    chip: "bg-primary-light text-ink-950",
    title: "Civil",
    subtitle: "Tu as le mot principal. Dessine-le clairement sans l'ecrire."
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
    <div className="relative flex h-[100svh] items-center justify-center overflow-hidden p-4">
      {/* Ink splatters */}
      <InkSplatter variant={1} className="left-[10%] top-[15%]" size={170} opacity={0.04} />
      <InkSplatter variant={3} className="bottom-[15%] right-[10%]" size={140} opacity={0.05} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-2xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-950/8 blur-3xl"
        />

        <div className="bento-card relative overflow-hidden p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
                Carte secrete
              </div>
              <div className="mt-1 font-display text-3xl font-extrabold text-ink-950 md:text-4xl">
                {selfPlayer.profile.emoji} {selfPlayer.profile.name}
              </div>
            </div>
            <div className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${tone.chip}`}>
              {tone.title}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, rotateX: -12, y: 24 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={`rounded-[32px] bg-gradient-to-br ${tone.panel} px-6 py-8 text-center shadow-card`}
          >
            <div className="mb-3 font-sketch text-sm font-bold uppercase tracking-[0.12em] text-ink-500">
              {ownWord ? "Ton mot" : "Aucun mot"}
            </div>
            <div className="font-display text-5xl font-extrabold tracking-[-0.03em] text-ink-950 md:text-6xl">
              {ownWord ?? "?"}
            </div>
            <div className="mx-auto mt-4 max-w-xl font-sketch text-base text-ink-700 md:text-lg">
              {tone.subtitle}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 22 }}
            className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]"
          >
            <div className="rounded-[24px] bg-surface-low px-4 py-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
                Avant de continuer
              </div>
              <div className="grid gap-2 text-sm text-ink-700">
                {["1. Memorise ton role et ton mot.", "2. Cache bien cet ecran aux autres joueurs.", "3. Clique quand tu es pret a dessiner."].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.08, type: "spring", stiffness: 350, damping: 22 }}
                  >
                    {step}
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-[24px] bg-ink-950 px-4 py-4 text-white md:min-w-[220px]"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
                Validation
              </div>
              <motion.div
                key={confirmedCount}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="mt-2 text-3xl font-extrabold"
              >
                {confirmedCount}/{room.players.length}
              </motion.div>
              <div className="mt-1 text-sm text-white/70">joueurs ont confirme</div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
            className="mt-6"
          >
            <Button onClick={onConfirm} fullWidth>
              J'ai memorise, on peut continuer
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
