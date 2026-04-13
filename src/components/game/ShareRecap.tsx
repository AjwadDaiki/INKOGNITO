import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FinalResultsView, PlayerView } from "@shared/protocol";
import { generateShareCard, downloadCanvas, shareCanvas } from "@/lib/shareCard";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n";

export function ShareRecap({
  finalResults,
  players,
  roomCode
}: {
  finalResults: FinalResultsView;
  players: PlayerView[];
  roomCode: string;
}) {
  const t = useI18n((s) => s.t);
  const [open, setOpen] = useState(false);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(async () => {
    setGenerating(true);
    try {
      const c = await generateShareCard(finalResults, players, roomCode, t);
      setCanvas(c);
    } catch {
      // silently fail
    }
    setGenerating(false);
  }, [finalResults, players, roomCode, t]);

  useEffect(() => {
    if (open && !canvas && !generating) {
      generate();
    }
  }, [open, canvas, generating, generate]);

  useEffect(() => {
    if (canvas && previewRef.current) {
      previewRef.current.innerHTML = "";
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.borderRadius = "12px";
      previewRef.current.appendChild(canvas);
    }
  }, [canvas]);

  async function handleShare() {
    if (!canvas) return;
    const shared = await shareCanvas(canvas, "Inkognito Recap");
    if (!shared) {
      downloadCanvas(canvas, `inkognito-${roomCode}.png`);
    }
  }

  function handleDownload() {
    if (!canvas) return;
    downloadCanvas(canvas, `inkognito-${roomCode}.png`);
  }

  return (
    <>
      <Button tone="secondary" onClick={() => setOpen(true)} className="min-h-10 px-4 text-xs">
        {t("final.share")} 📸
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="flex max-h-[90vh] w-full max-w-[420px] flex-col overflow-hidden rounded-[1.6rem] border border-[rgba(74,60,46,0.12)] bg-paper shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <div className="font-sketch text-2xl font-bold text-ink-950">
                  {t("final.share")} 📸
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition hover:bg-ink-950/5 hover:text-ink-700"
                >
                  ✕
                </button>
              </div>

              <div className="scrollbar-thin flex-1 overflow-y-auto px-5 pb-4">
                {generating ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-ink-800" />
                  </div>
                ) : (
                  <div ref={previewRef} className="overflow-hidden rounded-xl border border-[rgba(74,60,46,0.08)] shadow-card" />
                )}
              </div>

              <div className="flex gap-2 border-t border-[rgba(74,60,46,0.08)] px-5 py-4">
                <Button onClick={handleShare} fullWidth>
                  {t("final.shareBtn")} 🔗
                </Button>
                <Button tone="secondary" onClick={handleDownload} fullWidth>
                  {t("final.download")} ⬇️
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
