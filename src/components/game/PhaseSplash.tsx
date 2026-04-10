import { AnimatePresence, motion } from "framer-motion";
import type { RoomView } from "@shared/protocol";
import { phaseLabel, phaseSubtitle } from "./gameHelpers";

export function PhaseSplash({ show, phase }: { show: boolean; phase: RoomView["phase"] }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="absolute h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(26,20,16,0.2)_0%,rgba(26,20,16,0.08)_35%,transparent_72%)]"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            exit={{ opacity: 0, y: -18, rotate: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="paper-sheet desk-shadow px-10 py-7 text-center"
          >
            <div className="font-sketch text-5xl font-bold text-ink-950 md:text-6xl">
              {phaseLabel(phase)}
            </div>
            <div className="mt-2 font-sketch text-2xl text-ink-700 md:text-3xl">
              {phaseSubtitle(phase)}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
