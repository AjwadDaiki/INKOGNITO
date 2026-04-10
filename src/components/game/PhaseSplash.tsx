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
          transition={{ duration: 0.14 }}
          className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.35 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(26,20,16,0.32),rgba(26,20,16,0.1)_28%,transparent_62%)]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 0.18, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="absolute h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,rgba(26,20,16,0.18)_0%,transparent_66%)]"
          />

          <motion.div
            initial={{ opacity: 0, y: 34, rotate: 4 }}
            animate={{ opacity: 0.38, y: 0, rotate: 2 }}
            exit={{ opacity: 0, y: -18, rotate: 5 }}
            transition={{ duration: 0.28 }}
            className="paper-sheet absolute h-[15rem] w-[20rem] rounded-[2rem]"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            exit={{ opacity: 0, y: -18, rotate: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="paper-sheet notebook-page desk-shadow animate-page-settle overflow-hidden px-10 py-7 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 0.14, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.03, duration: 0.28 }}
              className="absolute -left-10 -top-8 h-24 w-24 rounded-full bg-ink-950"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 0.08, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.06, duration: 0.28 }}
              className="absolute -bottom-6 -right-4 h-16 w-16 rounded-full bg-ink-950"
            />
            <div className="mb-1 pl-7 text-[10px] uppercase tracking-[0.28em] text-ink-500 md:pl-8">
              La page tourne
            </div>
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
