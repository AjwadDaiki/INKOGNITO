import { useEffect, useMemo, useRef, useState } from "react";
import { DRAWING_COLORS, DRAWING_SIZE } from "@shared/constants";
import { createId } from "@shared/game";
import type { DrawingStroke, DrawingTool } from "@shared/protocol";
import { getCanvasSnapshot, normalizePointerPosition, renderStrokeCanvas } from "@/lib/canvas";
import { Button } from "@/components/ui/Button";

const TOOL_OPTIONS: Array<{ tool: DrawingTool; label: string; title: string }> = [
  { tool: "pen", label: "Pen", title: "Crayon" },
  { tool: "brush", label: "Br", title: "Pinceau" },
  { tool: "fill", label: "Fi", title: "Remplir" },
  { tool: "eraser", label: "Er", title: "Gomme" }
];

const SIZE_PRESETS = [
  { label: "S", value: 4 },
  { label: "M", value: 8 },
  { label: "L", value: 14 }
] as const;

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewTimer = useRef<number | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>("pen");
  const [activeColor, setActiveColor] = useState<string>(DRAWING_COLORS[0]);
  const [brushSize, setBrushSize] = useState<number>(8);
  const [draftStroke, setDraftStroke] = useState<DrawingStroke | null>(null);

  const committedStrokes = useMemo(() => strokes, [strokes]);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.width = DRAWING_SIZE;
    canvasRef.current.height = DRAWING_SIZE;
    renderStrokeCanvas(canvasRef.current, committedStrokes, draftStroke);
  }, [committedStrokes, draftStroke]);

  useEffect(() => {
    return () => {
      if (previewTimer.current) window.clearTimeout(previewTimer.current);
    };
  }, []);

  function buildStroke(point: { x: number; y: number }) {
    return {
      id: createId("stroke"),
      playerId,
      tool: activeTool,
      color: activeTool === "eraser" ? "#FFFFFF" : activeColor,
      size: brushSize,
      points: [point],
      createdAt: Date.now()
    } satisfies DrawingStroke;
  }

  function queuePreview(stroke: DrawingStroke) {
    if (previewTimer.current) window.clearTimeout(previewTimer.current);
    previewTimer.current = window.setTimeout(() => onPreview(stroke), 40);
  }

  function commitNow(stroke: DrawingStroke) {
    if (!canvasRef.current) return;
    renderStrokeCanvas(canvasRef.current, [...committedStrokes, stroke]);
    const snapshot = getCanvasSnapshot(canvasRef.current);
    onCommit(stroke, snapshot);
  }

  function beginStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) return;
    const point = normalizePointerPosition(event, canvasRef.current);
    const stroke = buildStroke(point);

    if (activeTool === "fill") {
      commitNow(stroke);
      return;
    }

    canvasRef.current.setPointerCapture(event.pointerId);
    setDraftStroke(stroke);
    queuePreview(stroke);
  }

  function moveStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!draftStroke || !canvasRef.current) return;
    const point = normalizePointerPosition(event, canvasRef.current);
    const nextStroke = { ...draftStroke, points: [...draftStroke.points, point] };
    setDraftStroke(nextStroke);
    queuePreview(nextStroke);
  }

  function finishStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!draftStroke || !canvasRef.current) return;

    if (canvasRef.current.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }

    const snapshot = getCanvasSnapshot(canvasRef.current);
    onCommit(draftStroke, snapshot);
    setDraftStroke(null);
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-2.5">
      <div className="flex flex-wrap items-center gap-2 rounded-[24px] bg-surface-low/70 px-2.5 py-2">
        <div className="flex gap-1.5">
          {TOOL_OPTIONS.map(({ tool, label, title }) => (
            <button
              key={tool}
              type="button"
              title={title}
              aria-label={title}
              onClick={() => setActiveTool(tool)}
              className={`flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-bold uppercase tracking-[0.12em] transition md:h-10 md:w-10 ${
                activeTool === tool
                  ? "bg-primary-light text-ink-950 shadow-primary"
                  : "bg-surface-low text-ink-700 hover:bg-surface-high"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {DRAWING_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setActiveColor(color)}
              className={`h-7 w-7 rounded-full border-[3px] transition-transform md:h-8 md:w-8 ${
                activeColor === color ? "scale-110 border-ink-950" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Couleur ${color}`}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
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

      <div className="min-h-0 flex-1 overflow-hidden rounded-[28px] bg-[#f8f6f2] p-2 shadow-card">
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

      <div className="flex flex-wrap items-center gap-2 rounded-[24px] bg-surface-low/70 px-2.5 py-2">
        <input
          type="range"
          min={2}
          max={28}
          value={brushSize}
          onChange={(event) => setBrushSize(Number(event.target.value))}
          className="min-w-[120px] flex-1 accent-primary"
          aria-label="Taille du trait"
        />
        <Button
          tone="secondary"
          onClick={onUndo}
          title="Annuler"
          className="min-h-9 px-3 py-1.5 text-xs"
        >
          Undo
        </Button>
        <Button
          tone="danger"
          onClick={onClear}
          title="Tout effacer"
          className="min-h-9 px-3 py-1.5 text-xs"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
