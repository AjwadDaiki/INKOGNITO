import React, { useEffect, useRef, useState } from "react";
import type { DrawingStroke, PlayerView, RoomView, RoundView } from "@shared/protocol";
import { DrawingCanvas } from "@/components/game/DrawingCanvas";
import { CountdownPill } from "@/components/ui/CountdownPill";
import { MiniDrawingCanvas } from "./MiniDrawingCanvas";
import { useGameStore } from "@/store/useGameStore";
import { useIsMobile } from "@/lib/useIsMobile";

const EMPTY_STROKES: DrawingStroke[] = [];

/* ── Tiny preview card: drawing + name ── */

function OtherPreview({ player, size }: { player: PlayerView; size: number }) {
  const strokes = useGameStore(
    (s) => s.room?.round?.drawings[player.id]?.strokes ?? EMPTY_STROKES
  );
  const previewStroke = useGameStore((s) => s.livePreviews[player.id] ?? null);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <MiniDrawingCanvas
        strokes={strokes}
        previewStroke={previewStroke}
        size={size}
        className="rounded-[0.5rem]"
      />
      <span
        className="max-w-full truncate text-center font-sketch font-semibold leading-tight text-ink-950"
        style={{ fontSize: Math.max(9, Math.min(13, size * 0.09)) }}
      >
        {player.profile.name}
      </span>
    </div>
  );
}

/* ── fitGrid: compute optimal cols so all cards fit without scroll ── */

function fitGrid(
  count: number,
  availableWidth: number,
  availableHeight: number,
  gap: number,
  labelHeight: number
) {
  if (count === 0) return { cols: 1, cellSize: 40 };

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

  return { cols: bestCols, cellSize: Math.max(36, bestSize) };
}

/* ── Measured grid: ResizeObserver + fitGrid ── */

function MeasuredGrid({ players }: { players: PlayerView[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 300, h: 200 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let rafId = 0;
    const ro = new ResizeObserver((entries) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const entry = entries[0];
        if (entry) {
          setDims({
            w: Math.floor(entry.contentRect.width),
            h: Math.floor(entry.contentRect.height)
          });
        }
      });
    });
    ro.observe(el);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, []);

  const gap = 6;
  const labelH = 16;
  const { cols, cellSize } = fitGrid(players.length, dims.w, dims.h, gap, labelH);

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center">
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

/* ── Main component ── */

export function DrawingPhase({
  room,
  round,
  selfPlayer,
  otherPlayers,
  onPreview,
  onCommit,
  onUndo,
  onClear
}: {
  room: RoomView;
  round: RoundView;
  selfPlayer: PlayerView;
  otherPlayers: PlayerView[];
  onPreview: (stroke: DrawingStroke) => void;
  onCommit: (stroke: DrawingStroke, snapshot: string | null) => void;
  onUndo: () => void;
  onClear: () => void;
}) {
  const selfDrawing = round.drawings[selfPlayer.id];
  const n = otherPlayers.length;
  const isMobile = useIsMobile();

  const canvasSection = (
    <section className="paper-sheet notebook-page desk-shadow flex min-h-0 flex-col gap-2 overflow-hidden rounded-[1.9rem] px-3 py-3 lg:px-4 lg:py-4">
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
  );

  const othersSection = (
    <section className="paper-sheet notebook-page desk-shadow flex min-h-0 flex-col gap-1 overflow-hidden rounded-[1.9rem] px-3 py-2 lg:px-4 lg:py-3">
      <div className="flex shrink-0 items-center justify-between pl-7 md:pl-8">
        <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-ink-500">
          {n} dessin{n > 1 ? "s" : ""}
        </span>
        <span className="text-[9px] text-ink-300 animate-pulse-soft">live</span>
      </div>
      <div className="min-h-0 flex-1">
        <MeasuredGrid players={otherPlayers} />
      </div>
    </section>
  );

  if (isMobile) {
    // Mobile: vertical split — canvas 62%, others 38%
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col gap-2">
        <div className="flex min-h-0" style={{ flex: "0 0 62%" }}>
          {canvasSection}
        </div>
        <div className="flex min-h-0 flex-1">
          {othersSection}
        </div>
      </div>
    );
  }

  // Desktop: side by side — canvas left, others panel right
  // Panel width scales with player count
  const panelWidth = n >= 8 ? 480 : n >= 5 ? 420 : 360;

  return (
    <div className="flex h-full min-h-0 flex-1 gap-3">
      <div className="flex min-h-0 min-w-0 flex-1">
        {canvasSection}
      </div>
      <div className="flex min-h-0" style={{ width: panelWidth, flexShrink: 0 }}>
        {othersSection}
      </div>
    </div>
  );
}
