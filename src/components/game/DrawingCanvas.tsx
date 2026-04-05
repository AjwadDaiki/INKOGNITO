import { useEffect, useMemo, useRef, useState } from "react";
import { DRAWING_COLORS, DRAWING_SIZE } from "@shared/constants";
import { createId } from "@shared/game";
import type { DrawingStroke, DrawingTool } from "@shared/protocol";
import { getCanvasSnapshot, normalizePointerPosition, renderStrokeCanvas } from "@/lib/canvas";
import { Button } from "@/components/ui/Button";

const TOOL_OPTIONS: Array<{ tool: DrawingTool; title: string }> = [
  { tool: "pen", title: "Crayon" },
  { tool: "brush", title: "Pinceau" },
  { tool: "fill", title: "Pot de peinture" },
  { tool: "eraser", title: "Gomme" }
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
      if (previewTimer.current) {
        window.clearTimeout(previewTimer.current);
      }
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
    if (previewTimer.current) {
      window.clearTimeout(previewTimer.current);
    }
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
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {TOOL_OPTIONS.map(({ tool, title }) => (
            <button
              key={tool}
              type="button"
              title={title}
              aria-label={title}
              onClick={() => setActiveTool(tool)}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                activeTool === tool
                  ? "border-neon-cyan/50 bg-neon-cyan/10 text-white"
                  : "border-white/10 bg-white/5 text-ink-200 hover:bg-white/10"
              }`}
            >
              <ToolIcon tool={tool} />
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {DRAWING_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setActiveColor(color)}
              className={`h-8 w-8 rounded-full border-2 transition ${
                activeColor === color ? "scale-110 border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Couleur ${color}`}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setBrushSize(preset.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                brushSize === preset.value
                  ? "border-neon-cyan/50 bg-neon-cyan/10 text-white"
                  : "border-white/10 bg-white/5 text-ink-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#f8f7f4] p-3 shadow-2xl">
        <canvas
          ref={canvasRef}
          className="aspect-square h-full max-h-full w-full touch-none rounded-[22px] bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
          style={{
            cursor: activeTool === "fill" ? "cell" : activeTool === "eraser" ? "grab" : "crosshair",
            backgroundImage:
              "linear-gradient(rgba(16,16,24,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,16,24,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
          onPointerDown={beginStroke}
          onPointerMove={moveStroke}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="range"
          min={2}
          max={28}
          value={brushSize}
          onChange={(event) => setBrushSize(Number(event.target.value))}
          className="min-w-[180px] flex-1 accent-neon-cyan"
          aria-label="Taille du trait"
        />
        <Button tone="secondary" onClick={onUndo}>
          Annuler
        </Button>
        <Button tone="danger" onClick={onClear}>
          Effacer
        </Button>
      </div>
    </div>
  );
}

function ToolIcon({ tool }: { tool: DrawingTool }) {
  if (tool === "pen") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <path d="M4 20l4.5-1 9-9a2.1 2.1 0 000-3L16.5 6a2.1 2.1 0 00-3 0l-9 9L4 20z" />
        <path d="M13 7l4 4" />
      </svg>
    );
  }
  if (tool === "brush") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <path d="M14 4l6 6" />
        <path d="M7 13l7-7 4 4-7 7" />
        <path d="M5 19c1.2 1.2 4.3 1.4 6-.3 1.7-1.7 1.5-4.8.3-6" />
      </svg>
    );
  }
  if (tool === "fill") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <path d="M7 14l7-7 5 5-7 7H7v-5z" />
        <path d="M15 19h5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
      <path d="M6 15l7-7 5 5-7 7H6v-5z" />
      <path d="M14 7l3 3" />
      <path d="M4 20h7" />
    </svg>
  );
}
