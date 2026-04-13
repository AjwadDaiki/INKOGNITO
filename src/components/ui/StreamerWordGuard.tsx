import { motion, AnimatePresence } from "framer-motion";
import { useStreamerMode } from "@/lib/useStreamerMode";
import { useI18n } from "@/i18n";

export function StreamerWordGuard({ children }: { children: React.ReactNode }) {
  const enabled = useStreamerMode((s) => s.enabled);
  const hidden = useStreamerMode((s) => s.wordHidden);
  const show = useStreamerMode((s) => s.showWord);
  const hide = useStreamerMode((s) => s.hideWord);
  const t = useI18n((s) => s.t);

  if (!enabled) return <>{children}</>;

  return (
    <div className="relative">
      <div className={hidden ? "select-none blur-lg" : ""}>{children}</div>
      <AnimatePresence>
        {hidden ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={show}
            className="absolute inset-0 flex items-center justify-center rounded-lg bg-ink-950/60 backdrop-blur-sm"
          >
            <span className="rounded-full border-2 border-dashed border-paper/40 px-4 py-2 font-sketch text-lg font-bold text-paper">
              {t("streamer.clickToReveal")} 👁️
            </span>
          </motion.button>
        ) : (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={hide}
            className="absolute -right-1 -top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-ink-950/70 text-xs text-paper transition hover:bg-ink-950/90"
            title={t("streamer.hide")}
          >
            🙈
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
