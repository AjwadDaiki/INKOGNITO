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

  const canvasPanel = (
    <GlassPanel className="h-full min-h-0 overflow-hidden p-2 md:p-3">
      <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2">
        <div className="flex items-center justify-between gap-2 rounded-[16px] bg-surface-low/60 px-3 py-2">
          <div className="min-w-0">
            <div className="text-[9px] font-bold uppercase tracking-widest text-ink-400">Ton mot</div>
            <div className="truncate font-sketch text-2xl font-bold text-ink-950 md:text-3xl">
              {round.role.ownWord ?? "???"}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CountdownPill endsAt={room.phaseEndsAt} />
            <button
              type="button"
              onClick={() => setShowOthers(true)}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-surface-low text-sm transition hover:bg-surface-high lg:hidden"
            >
              👁️
            </button>
          </div>
        </div>
        <div className="min-h-0">
          <DrawingCanvas
            playerId={selfPlayer.id}
            strokes={selfDrawing?.strokes ?? []}
            onPreview={onPreview}
            onCommit={onCommit}
            onUndo={onUndo}
            onClear={onClear}
          />
        </div>
      </div>
    </GlassPanel>
  );

  const othersPanel = (
    <GlassPanel className="flex h-full min-h-0 flex-col gap-1 overflow-hidden p-2">
      <div className="flex shrink-0 items-center justify-between px-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-ink-400">
          {otherPlayers.length} joueur{otherPlayers.length > 1 ? "s" : ""}
        </span>
        <span className="text-[9px] text-ink-300 animate-pulse-soft">live</span>
      </div>
      <div
        className="scrollbar-thin flex-1 overflow-y-auto"
      >
        <div
          className="grid gap-1.5 place-items-center"
          style={{
            gridTemplateColumns: `repeat(${rCols}, minmax(0, 1fr))`
          }}
        >
          {otherPlayers.map((p) => renderCard(p))}
        </div>
      </div>
    </GlassPanel>
  );

  return (
    <>
      <div className="hidden min-h-0 flex-1 gap-2 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        {canvasPanel}
        {othersPanel}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        {canvasPanel}
      </div>

      <AnimatePresence>
        {showOthers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 flex flex-col bg-ink-950/40 backdrop-blur-sm p-3 lg:hidden"
            onClick={() => setShowOthers(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 24 }}
              className="flex min-h-0 flex-1 flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Dessins des autres</span>
                <button
                  type="button"
                  onClick={() => setShowOthers(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm text-white"
                >
                  ✕
                </button>
              </div>
              {othersPanel}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
