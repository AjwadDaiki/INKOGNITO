import { type ReactNode } from "react";
import { motion } from "framer-motion";
import type { DrawingStroke, PlayerView, RoomView, RoundView } from "@shared/protocol";
import { DrawingCanvas } from "@/components/game/DrawingCanvas";
import { CountdownPill } from "@/components/ui/CountdownPill";
import { MiniDrawingCanvas } from "./MiniDrawingCanvas";
import { useGameStore } from "@/store/useGameStore";

function OtherPreview({ player, size }: { player: PlayerView; size: number }) {
  const strokes = useGameStore(
    (s) => s.room?.round?.drawings[player.id]?.strokes ?? []
  );
  const previewStroke = useGameStore((s) => s.livePreviews[player.id] ?? null);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <MiniDrawingCanvas
        strokes={strokes}
        previewStroke={previewStroke}
        size={size}
        className="rounded-[0.6rem]"
      />
      <span className="max-w-full truncate text-center font-sketch text-xs font-semibold leading-tight text-ink-950 md:text-sm">
        {player.profile.name}
      </span>
    </div>
  );
}

/**
 * Compute optimal grid cols × rows so all items fit without scroll.
 * Returns { cols, rows, cellSize } where cellSize is the max square side
 * that fits given available width/height and a name label height.
 */
function fitGrid(
  count: number,
  availableWidth: number,
  availableHeight: number,
  gap: number,
  labelHeight: number
) {
  let bestCols = 1;
  let bestSize = 0;

  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const cellW = (availableWidth - gap * (cols - 1)) / cols;
    const cellH = (availableHeight - gap * (rows - 1)) / rows - labelHeight;
    const size = Math.floor(Math.min(cellW, cellH));
    if (size > bestSize) {
      bestSize = size;
      bestCols = cols;
    }
  }

  return { cols: bestCols, rows: Math.ceil(count / bestCols), cellSize: Math.max(40, bestSize) };
}

export function DrawingPhase({
  room,
  round,
  selfPlayer,
  otherPlayers,
  onPreview,
  onCommit,
  onUndo,
  onClear,
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
  const selfDrawing = round.drawings[selfPlayer.id];
  const n = otherPlayers.length;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2 lg:flex-row lg:gap-3">
      {/* Main canvas section */}
      <section className="paper-sheet notebook-page desk-shadow flex min-h-0 flex-1 flex-col gap-2 overflow-hidden rounded-[1.9rem] px-3 py-3 lg:flex-[1.15] lg:px-4 lg:py-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pl-7 md:pl-8">
          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-[0.28em] text-ink-500">Mot secret</span>
            <div className="truncate font-sketch text-3xl font-bold leading-none text-ink-950 md:text-4xl lg:text-5xl">
              {round.role.ownWord ?? "???"}
            </div>
          </div>
          {room.phaseEndsAt ? <CountdownPill endsAt={room.phaseEndsAt} /> : null}
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

      {/* Others panel — fits all previews without scroll */}
      <section className="paper-sheet notebook-page desk-shadow flex min-h-0 flex-col gap-1.5 overflow-hidden rounded-[1.9rem] px-3 py-3 lg:w-[340px] lg:px-4 lg:py-4 xl:w-[400px]">
        <div className="flex items-center justify-between pl-7 md:pl-8">
          <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-ink-500">
            {n} dessin{n > 1 ? "s" : ""}
          </span>
          <span className="text-[9px] text-ink-300 animate-pulse-soft">live</span>
        </div>

        {/* Auto-fit grid */}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <OthersGrid players={otherPlayers} />
        </div>
      </section>
    </div>
  );
}

/**
 * Grid that measures its container and computes optimal cell size
 * so all players fit without scrolling.
 */
function OthersGrid({ players }: { players: PlayerView[] }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dims, setDims] = React.useState({ w: 300, h: 200 });

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDims({
          w: Math.floor(entry.contentRect.width),
          h: Math.floor(entry.contentRect.height)
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gap = 6;
  const labelH = 18;
  const { cols, cellSize } = fitGrid(players.length, dims.w, dims.h, gap, labelH);

  return (
    <div ref={containerRef} className="h-full w-full">
      <div
        className="grid place-items-center"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: `${gap}px`
        }}
      >
        {players.map((player) => (
          <OtherPreview key={player.id} player={player} size={cellSize} />
        ))}
      </div>
    </div>
  );
}

import React from "react";
