import { AnimatePresence, motion } from "framer-motion";
import type { RoomView } from "@shared/protocol";
import { phaseLabel, phaseSubtitle } from "./gameHelpers";
import { useI18n } from "@/i18n";

/** Ink drop SVG — a teardrop that falls and splashes */
function InkDrop() {
  return (
    <motion.svg
      initial={{ y: "-120%", opacity: 0.9, scaleY: 1.3, scaleX: 0.8 }}
      animate={{ y: "0%", opacity: 0, scaleY: 0.4, scaleX: 1.8 }}
      transition={{ duration: 0.45, ease: [0.55, 0, 1, 0.45] }}
      className="absolute left-1/2 top-1/2 -ml-[28px] -mt-[28px]"
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="rgba(26, 20, 16, 0.7)"
    >
      <path d="M28 4c0 0 -16 20 -16 32a16 16 0 0 0 32 0c0 -12 -16 -32 -16 -32z" />
    </motion.svg>
  );
}

/** Ink splash ring — expands from center after the drop lands */
function InkSplashRing() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0.5 }}
      animate={{ scale: 1.6, opacity: 0 }}
      transition={{ delay: 0.32, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-1/2 top-1/2 -ml-[60px] -mt-[60px] h-[120px] w-[120px] rounded-full border-[3px] border-ink-950/30"
    />
  );
}

export function PhaseSplash({ show, phase }: { show: boolean; phase: RoomView["phase"] }) {
  const t = useI18n((s) => s.t);
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
          {/* Ink drop falling + splash */}
          <InkDrop />
          <InkSplashRing />

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
            transition={{ delay: 0.12, type: "spring", stiffness: 220, damping: 24 }}
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
              {t("phase.pageFlip")}
            </div>
            <div className="font-sketch text-5xl font-bold text-ink-950 md:text-6xl">
              {phaseLabel(phase, t)}
            </div>
            <div className="mt-2 font-sketch text-2xl text-ink-700 md:text-3xl">
              {phaseSubtitle(phase, t)}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
