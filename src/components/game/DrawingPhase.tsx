import { type ReactNode, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DrawingStroke, PlayerView, RoomView, RoundView } from "@shared/protocol";
import { DrawingCanvas } from "@/components/game/DrawingCanvas";
import { CountdownPill } from "@/components/ui/CountdownPill";

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
  const cols =
    otherPlayers.length >= 8 ? 4 : otherPlayers.length >= 5 ? 3 : otherPlayers.length >= 3 ? 2 : 1;

  const othersPanel = (
    <section className="paper-sheet notebook-page desk-shadow flex h-full min-h-0 flex-col gap-3 overflow-hidden rounded-[1.9rem] px-4 py-4 md:px-5">
      <div className="flex items-center justify-between gap-3 pl-7 md:pl-8">
        <div className="font-sketch text-3xl font-semibold leading-none text-ink-950 md:text-4xl">
          Pages en cours
        </div>
        <span className="ink-chip text-xs font-semibold text-ink-700">
          {otherPlayers.length} dessin{otherPlayers.length > 1 ? "s" : ""}
        </span>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto pr-1">
        <div
          className="grid items-start gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {otherPlayers.map((player) => renderCard(player))}
        </div>
      </div>
    </section>
  );

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <section className="paper-sheet notebook-page desk-shadow flex h-full min-h-0 flex-col gap-3 rounded-[2rem] px-4 py-4 md:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3 pl-7 md:pl-8">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.28em] text-ink-500">
                Mot secret
              </div>
              <div className="mt-1 truncate font-sketch text-5xl font-bold leading-none text-ink-950 md:text-6xl">
                {round.role.ownWord ?? "???"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {room.phaseEndsAt ? <CountdownPill endsAt={room.phaseEndsAt} /> : null}
              {otherPlayers.length ? (
                <button
                  type="button"
                  onClick={() => setShowOthers(true)}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[rgba(74,60,46,0.12)] bg-paper px-4 text-sm font-semibold text-ink-700 transition hover:bg-paper-warm"
                >
                  Pages {otherPlayers.length}
                </button>
              ) : null}
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
        </section>
      </div>

      <AnimatePresence>
        {showOthers ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex bg-[rgba(26,20,16,0.34)] p-3 md:p-4"
            onClick={() => setShowOthers(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, rotate: 1.2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: 24, rotate: 1.2 }}
              transition={{ type: "spring", stiffness: 250, damping: 24 }}
              className="ml-auto flex h-full min-h-0 w-full max-w-[1120px] flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="font-sketch text-3xl font-semibold text-paper">
                  Pages en cours
                </div>
                <button
                  type="button"
                  onClick={() => setShowOthers(false)}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/20 bg-[rgba(255,255,255,0.12)] px-4 text-sm font-semibold text-paper"
                >
                  Fermer
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
