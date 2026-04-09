import { AnimatePresence, motion } from "framer-motion";
import type { RoomView } from "@shared/protocol";
import { phaseLabel, phaseSubtitle } from "./gameHelpers";

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
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 40, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.08, y: -30 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="rounded-[28px] border border-white/50 bg-white/85 px-8 py-6 text-center shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-lg"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
              className="font-display text-4xl font-extrabold tracking-[-0.03em] text-ink-950 md:text-5xl"
            >
              {phaseLabel(phase)}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-2 text-sm text-ink-500"
            >
              {phaseSubtitle(phase)}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
