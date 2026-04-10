import { useCallback, useEffect, useRef, useState } from "react";
import { DRAWING_COLORS, DRAWING_SIZE } from "@shared/constants";
import { createId } from "@shared/game";
import type { DrawingStroke, DrawingTool } from "@shared/protocol";
import { drawStroke, getCanvasSnapshot, normalizePointerPosition, renderStrokeCanvas } from "@/lib/canvas";
import { Button } from "@/components/ui/Button";

const TOOL_OPTIONS: Array<{ tool: DrawingTool; label: string; title: string }> = [
  { tool: "pen", label: "✏️", title: "Crayon" },
  { tool: "brush", label: "🖌️", title: "Pinceau" },
  { tool: "fill", label: "🪣", title: "Remplir" },
  { tool: "eraser", label: "🧹", title: "Gomme" }
];

const SIZE_PRESETS = [
  { label: "S", value: 4 },
  { label: "M", value: 8 },
  { label: "L", value: 14 }
] as const;

/** Min squared distance between two recorded points (2px) */
const MIN_POINT_DIST_SQ = 4;
/** Min ms between network preview sends (~12 fps over the wire) */
const PREVIEW_THROTTLE_MS = 80;

interface DrawingCanvasProps {
  playerId: string;
  strokes: DrawingStroke[];
  onPreview: (stroke: DrawingStroke) => void;
  onCommit: (stroke: DrawingStroke, snapshot: string | null) => void;
  onUndo: () => void;
  onClear: () => void;
}

export function DrawingCanvas({
  playerId,
  strokes,
  onPreview,
  onCommit,
  onUndo,
  onClear
}: DrawingCanvasProps) {
  /* ── React state (only for UI — never touched during drawing) ── */
  const [activeTool, setActiveTool] = useState<DrawingTool>("pen");
  const [activeColor, setActiveColor] = useState<string>(DRAWING_COLORS[0]);
  const [brushSize, setBrushSize] = useState<number>(8);

  /* ── Refs — all hot-path data lives here, zero React renders while drawing ── */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bufferRef = useRef<HTMLCanvasElement | null>(null); // offscreen committed-strokes buffer
  const draftRef = useRef<DrawingStroke | null>(null);
  const rafRef = useRef(0);
  const lastPreviewTime = useRef(0);
  // Stable refs for callbacks that close over props/state
  const onPreviewRef = useRef(onPreview);
  const onCommitRef = useRef(onCommit);
  const strokesRef = useRef(strokes);
  onPreviewRef.current = onPreview;
  onCommitRef.current = onCommit;
  strokesRef.current = strokes;

  /* ── Create offscreen buffer + init visible canvas (once) ── */
  useEffect(() => {
    const buffer = document.createElement("canvas");
    buffer.width = DRAWING_SIZE;
    buffer.height = DRAWING_SIZE;
    const ctx = buffer.getContext("2d");
    if (ctx) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, DRAWING_SIZE, DRAWING_SIZE); }
    bufferRef.current = buffer;

    if (canvasRef.current) {
      canvasRef.current.width = DRAWING_SIZE;
      canvasRef.current.height = DRAWING_SIZE;
    }
  }, []);

  /* ── Re-bake buffer when committed strokes change (undo, clear, server sync) ── */
  useEffect(() => {
    if (!bufferRef.current) return;
    renderStrokeCanvas(bufferRef.current, strokes);
    renderFrame();
  }, [strokes]);

  /* ── Cleanup ── */
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  /* ── Core render: buffer copy + draft overlay (one drawImage + one stroke) ── */
  const renderFrame = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const buffer = bufferRef.current;
      if (!canvas || !buffer) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // 1) Blit the committed-strokes buffer (one GPU copy)
      ctx.clearRect(0, 0, DRAWING_SIZE, DRAWING_SIZE);
      ctx.drawImage(buffer, 0, 0);
      // 2) Draw only the current draft stroke on top
      const draft = draftRef.current;
      if (draft) drawStroke(ctx, draft);
    });
  }, []);

  /* ── Stroke building ── */
  function buildStroke(point: { x: number; y: number }): DrawingStroke {
    return {
      id: createId("stroke"),
      playerId,
      tool: activeTool,
      color: activeTool === "eraser" ? "#FFFFFF" : activeColor,
      size: brushSize,
      points: [point],
      createdAt: Date.now()
    };
  }

  /* ── Network throttle: send preview at ~12 fps, not 60 ── */
  function sendPreview(stroke: DrawingStroke) {
    const now = performance.now();
    if (now - lastPreviewTime.current < PREVIEW_THROTTLE_MS) return;
    lastPreviewTime.current = now;
    onPreviewRef.current(stroke);
  }

  /* ── Pointer handlers — fully imperative, zero setState ── */
  function beginStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) return;
    const point = normalizePointerPosition(event, canvasRef.current);
    const stroke = buildStroke(point);

    if (activeTool === "fill") {
      // Fill: commit immediately, re-bake buffer
      if (bufferRef.current) {
        renderStrokeCanvas(bufferRef.current, [...strokesRef.current, stroke]);
      }
      renderFrame();
      const snapshot = getCanvasSnapshot(canvasRef.current);
      onCommitRef.current(stroke, snapshot);
      return;
    }

    canvasRef.current.setPointerCapture(event.pointerId);
    draftRef.current = stroke;
    renderFrame();
    sendPreview(stroke);
  }

  function moveStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    const draft = draftRef.current;
    if (!draft || !canvasRef.current) return;
    const point = normalizePointerPosition(event, canvasRef.current);

    // Point downsampling: skip if < 2px from last point
    const last = draft.points[draft.points.length - 1];
    const dx = point.x - last.x;
    const dy = point.y - last.y;
    if (dx * dx + dy * dy < MIN_POINT_DIST_SQ) return;

    draft.points.push(point); // mutate ref directly — no copy, no setState
    renderFrame();
    sendPreview(draft);
  }

  function finishStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    const draft = draftRef.current;
    if (!draft || !canvasRef.current) return;

    if (canvasRef.current.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }

    // Bake draft into buffer so it's part of committed artwork
    if (bufferRef.current) {
      const ctx = bufferRef.current.getContext("2d");
      if (ctx) drawStroke(ctx, draft);
    }
    draftRef.current = null;
    renderFrame();

    const snapshot = getCanvasSnapshot(canvasRef.current);
    onCommitRef.current(draft, snapshot);
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-2.5">
      <div className="flex flex-wrap items-center gap-1.5 rounded-[24px] bg-surface-low/70 px-2 py-1.5 md:gap-2 md:px-2.5 md:py-2">
        <div className="flex gap-1">
          {TOOL_OPTIONS.map(({ tool, label, title }) => (
            <button
              key={tool}
              type="button"
              title={title}
              aria-label={title}
              onClick={() => setActiveTool(tool)}
              className={`flex h-8 w-8 items-center justify-center rounded-2xl text-base transition md:h-10 md:w-10 ${
                activeTool === tool
                  ? "bg-primary-light text-ink-950 shadow-primary"
                  : "bg-surface-low text-ink-700 hover:bg-surface-high"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1 md:gap-1.5">
          {DRAWING_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setActiveColor(color)}
              className={`h-6 w-6 rounded-full border-[3px] transition-transform md:h-8 md:w-8 ${
                activeColor === color ? "scale-110 border-ink-950" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Couleur ${color}`}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1 md:gap-1.5">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              title={`Taille ${preset.value}px`}
              onClick={() => setBrushSize(preset.value)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold uppercase transition md:h-9 md:w-9 ${
                brushSize === preset.value
                  ? "bg-primary-light text-ink-950"
                  : "bg-surface-low text-ink-700 hover:bg-surface-high"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-[28px] bg-paper-warm p-2 shadow-card">
        <canvas
          ref={canvasRef}
          className="aspect-square h-full max-h-full w-full touch-none rounded-[22px] bg-white"
          style={{
            cursor: activeTool === "fill" ? "cell" : activeTool === "eraser" ? "grab" : "crosshair",
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
          onPointerDown={beginStroke}
          onPointerMove={moveStroke}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-[24px] bg-surface-low/70 px-2 py-1.5 md:gap-2 md:px-2.5 md:py-2">
        <input
          type="range"
          min={2}
          max={28}
          value={brushSize}
          onChange={(event) => setBrushSize(Number(event.target.value))}
          className="min-w-[80px] flex-1 accent-primary md:min-w-[120px]"
          aria-label="Taille du trait"
        />
        <Button
          tone="secondary"
          onClick={onUndo}
          title="Annuler"
          className="min-h-8 px-2.5 py-1 text-xs md:min-h-9 md:px-3 md:py-1.5"
        >
          Undo
        </Button>
        <Button
          tone="danger"
          onClick={onClear}
          title="Tout effacer"
          className="min-h-8 px-2.5 py-1 text-xs md:min-h-9 md:px-3 md:py-1.5"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
