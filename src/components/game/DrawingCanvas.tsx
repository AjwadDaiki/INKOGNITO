import { useEffect, useMemo, useRef, useState } from "react";
import { DRAWING_COLORS, DRAWING_SIZE } from "@shared/constants";
import { createId } from "@shared/game";
import type { DrawingStroke, DrawingTool } from "@shared/protocol";
import { getCanvasSnapshot, normalizePointerPosition, renderStrokeCanvas } from "@/lib/canvas";
import { Button } from "@/components/ui/Button";

const TOOL_OPTIONS: Array<{
  tool: DrawingTool;
  label: string;
  shortLabel: string;
  description: string;
}> = [
  { tool: "pen", label: "Pen", shortLabel: "P", description: "Trait net" },
  { tool: "brush", label: "Brush", shortLabel: "B", description: "Trait doux" },
  { tool: "fill", label: "Fill", shortLabel: "F", description: "Pot de peinture" },
  { tool: "eraser", label: "Erase", shortLabel: "E", description: "Gomme propre" }
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
  const activeToolMeta = TOOL_OPTIONS.find((tool) => tool.tool === activeTool) ?? TOOL_OPTIONS[0];

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
    previewTimer.current = window.setTimeout(() => onPreview(stroke), 50);
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
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#f8f7f4] p-3 shadow-2xl">
        <div className="mb-3 flex items-center justify-between rounded-[20px] bg-[#1d1d26] px-4 py-3 text-sm text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-mono text-sm">
              {activeToolMeta.shortLabel}
            </span>
            <div>
              <div className="font-semibold">{activeToolMeta.label}</div>
              <div className="text-xs text-white/60">
                {activeTool === "fill"
                  ? "Clique pour remplir une zone"
                  : "Dessine librement, la table te voit en live"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-6 w-6 rounded-full border border-black/10"
              style={{ backgroundColor: activeTool === "eraser" ? "#FFFFFF" : activeColor }}
            />
            <span className="font-mono text-xs text-white/70">{brushSize}px</span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="aspect-square w-full touch-none rounded-[24px] bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
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

      <div className="glass-panel rounded-[26px] p-4">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_auto]">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-300">Outils</div>
            <div className="flex flex-wrap gap-2">
              {TOOL_OPTIONS.map(({ tool, label, shortLabel, description }) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => setActiveTool(tool)}
                  className={`min-w-[92px] rounded-2xl border px-3 py-3 text-left transition ${
                    activeTool === tool
                      ? "border-neon-cyan/50 bg-neon-cyan/10 text-white"
                      : "border-white/10 bg-white/5 text-ink-200 hover:bg-white/10"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="font-semibold">{label}</span>
                    <span className="font-mono text-xs text-ink-300">{shortLabel}</span>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-ink-300">{description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-300">Couleurs</div>
            <div className="flex flex-wrap gap-2">
              {DRAWING_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setActiveColor(color)}
                  className={`h-9 w-9 rounded-full border-2 transition ${
                    activeColor === color ? "scale-110 border-white" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Couleur ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="min-w-[180px]">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-300">Trait</div>
            <div className="mb-3 flex gap-2">
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setBrushSize(preset.value)}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    brushSize === preset.value
                      ? "border-neon-cyan/50 bg-neon-cyan/10 text-white"
                      : "border-white/10 bg-white/5 text-ink-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={2}
              max={28}
              value={brushSize}
              onChange={(event) => setBrushSize(Number(event.target.value))}
              className="w-full accent-neon-cyan"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button tone="secondary" onClick={onUndo}>
            Annuler
          </Button>
          <Button tone="danger" onClick={onClear}>
            Effacer
          </Button>
        </div>
      </div>
    </div>
  );
}
