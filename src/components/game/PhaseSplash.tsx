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
          className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.35 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(26,20,16,0.32),rgba(26,20,16,0.1)_28%,transparent_62%)]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.1, rotate: -18 }}
            animate={{ opacity: 0.65, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(26,20,16,0.22)_0%,transparent_63%)]"
            style={{ filter: "blur(6px)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.1, rotate: 28 }}
            animate={{ opacity: 0.24, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-[18%] top-[18%] h-40 w-40 rounded-full bg-ink-950"
            style={{ filter: "blur(3px)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.1, rotate: -24 }}
            animate={{ opacity: 0.18, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-[16%] right-[20%] h-28 w-28 rounded-full bg-ink-950"
          />

          <motion.div
            initial={{ opacity: 0, y: 34, rotate: 4 }}
            animate={{ opacity: 0.44, y: 0, rotate: 2 }}
            exit={{ opacity: 0, y: -18, rotate: 5 }}
            transition={{ duration: 0.46 }}
            className="paper-sheet absolute h-[15rem] w-[20rem] rounded-[2rem]"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            exit={{ opacity: 0, y: -18, rotate: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="paper-sheet notebook-page desk-shadow animate-page-settle overflow-hidden px-10 py-7 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 0.18, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.05, duration: 0.75 }}
              className="absolute -left-10 -top-8 h-24 w-24 rounded-full bg-ink-950"
              style={{ filter: "blur(2px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 0.1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.12, duration: 0.82 }}
              className="absolute -bottom-6 -right-4 h-16 w-16 rounded-full bg-ink-950"
              style={{ filter: "blur(1px)" }}
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
