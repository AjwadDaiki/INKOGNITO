import { AnimatePresence, motion } from "framer-motion";
import type { RoomView } from "@shared/protocol";
import { phaseLabel, phaseSubtitle } from "./gameHelpers";

function phaseEmoji(phase: RoomView["phase"]) {
  if (phase === "drawing") return "🎨";
  if (phase === "gallery") return "👀";
  if (phase === "vote") return "🗳️";
  if (phase === "resolution") return "🔍";
  return "";
}

export function PhaseSplash({ show, phase }: { show: boolean; phase: RoomView["phase"] }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
        >
          {/* Ink wash backdrop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-ink-950/10 backdrop-blur-sm"
          />

          {/* Ink splash expanding blob behind the card */}
          <motion.div
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute h-64 w-64 rounded-full bg-ink-950/10"
            style={{ filter: "blur(40px)" }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 50, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -40 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="bento-card relative px-10 py-8 text-center shadow-[0_24px_80px_rgba(26,20,16,0.15)]"
          >
            {/* Small ink spot decorations */}
            <div className="ink-spot -right-3 -top-2 h-5 w-5 rounded-full bg-ink-950" />
            <div className="ink-spot -bottom-2 -left-1 h-3 w-3 rounded-full bg-ink-700" />

            {/* Emoji */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 16 }}
              className="mb-2 text-4xl"
            >
              {phaseEmoji(phase)}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, type: "spring", stiffness: 400, damping: 20 }}
              className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ink-950 md:text-5xl"
            >
              {phaseLabel(phase)}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.3 }}
              className="mt-2 font-sketch text-base text-ink-500"
            >
              {phaseSubtitle(phase)}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
