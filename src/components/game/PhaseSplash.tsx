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
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="absolute h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(26,20,16,0.24)_0%,rgba(26,20,16,0.1)_35%,transparent_72%)]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.1, rotate: -18 }}
            animate={{ opacity: 0.65, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,rgba(26,20,16,0.2)_0%,transparent_63%)]"
            style={{ filter: "blur(6px)" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            exit={{ opacity: 0, y: -18, rotate: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="paper-sheet desk-shadow animate-page-settle overflow-hidden px-10 py-7 text-center"
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
