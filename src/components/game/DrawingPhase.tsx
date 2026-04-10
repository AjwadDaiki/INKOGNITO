import { type ReactNode, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DrawingStroke, PlayerView, RoomView, RoundView } from "@shared/protocol";
import { DrawingCanvas } from "@/components/game/DrawingCanvas";
import { CountdownPill } from "@/components/ui/CountdownPill";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { drawingCols } from "./gameHelpers";

export function DrawingPhase({
  room,
  round,
  selfPlayer,
  otherPlayers,
  onPreview,
  onCommit,
  onUndo,
  onClear,
  renderCard
}: {
  room: RoomView;
  round: RoundView;
  selfPlayer: PlayerView;
  otherPlayers: PlayerView[];
  onPreview: (stroke: DrawingStroke) => void;
  onCommit: (stroke: DrawingStroke, snapshot: string | null) => void;
  onUndo: () => void;
  onClear: () => void;
  renderCard: (player: PlayerView) => ReactNode;
}) {
  const [showOthers, setShowOthers] = useState(false);
  const selfDrawing = round.drawings[selfPlayer.id];
  const rCols = drawingCols(otherPlayers.length);

  const othersPanel = (
    <GlassPanel className="flex h-full min-h-0 flex-col gap-3 overflow-hidden rounded-[1.7rem] bg-paper/84 p-3">
      <div className="shrink-0">
        <div className="font-sketch text-3xl font-semibold text-ink-900">Autres pages</div>
        <div className="text-xs text-ink-500">
          Observe sans bruit. Chaque dessin se remplit en direct.
        </div>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto pr-1">
        <div
          className="grid gap-3 place-items-center"
          style={{ gridTemplateColumns: `repeat(${rCols}, minmax(0, 1fr))` }}
        >
          {otherPlayers.map((p) => renderCard(p))}
        </div>
      </div>
    </GlassPanel>
  );

  return (
    <>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.18fr)_minmax(300px,0.82fr)]">
        <GlassPanel className="flex h-full min-h-0 flex-col gap-3 rounded-[1.8rem] bg-paper/86 p-3 md:p-4">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-[1.5rem] border border-[rgba(74,60,46,0.1)] bg-paper px-4 py-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-500">Ton mot</div>
              <div className="font-sketch text-4xl font-bold leading-none text-ink-950 md:text-5xl">
                {round.role.ownWord ?? "???"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CountdownPill endsAt={room.phaseEndsAt} />
              <button
                type="button"
                onClick={() => setShowOthers(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(74,60,46,0.12)] bg-paper text-base text-ink-700 transition hover:bg-paper-warm lg:hidden"
              >
                👁
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            <DrawingCanvas
              playerId={selfPlayer.id}
              strokes={selfDrawing?.strokes ?? []}
              onPreview={onPreview}
              onCommit={onCommit}
              onUndo={onUndo}
              onClear={onClear}
            />
          </div>
        </GlassPanel>

        <div className="hidden min-h-0 lg:block">{othersPanel}</div>
      </div>

      <AnimatePresence>
        {showOthers ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex bg-[rgba(26,20,16,0.28)] p-3 lg:hidden"
            onClick={() => setShowOthers(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="flex min-h-0 flex-1 flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="font-sketch text-3xl font-semibold text-paper">Autres pages</div>
                <button
                  type="button"
                  onClick={() => setShowOthers(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[rgba(255,255,255,0.12)] text-lg text-paper"
                >
                  ×
                </button>
              </div>
              {othersPanel}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
