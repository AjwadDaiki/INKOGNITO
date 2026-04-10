import { useCallback, useEffect, useRef, useState } from "react";
import { DRAWING_COLORS, DRAWING_SIZE } from "@shared/constants";
import { createId } from "@shared/game";
import type { DrawingStroke, DrawingTool } from "@shared/protocol";
import { drawStroke, getCanvasSnapshot, normalizePointerPosition, renderStrokeCanvas } from "@/lib/canvas";
import { Button } from "@/components/ui/Button";

const TOOL_OPTIONS: Array<{ tool: DrawingTool; label: string; title: string }> = [
  { tool: "pen", label: "Plume", title: "Crayon" },
  { tool: "brush", label: "Pinceau", title: "Pinceau" },
  { tool: "fill", label: "Encre", title: "Remplir" },
  { tool: "eraser", label: "Gomme", title: "Gomme" }
];

const SIZE_PRESETS = [
  { label: "S", value: 4 },
  { label: "M", value: 8 },
  { label: "L", value: 14 }
] as const;

const MIN_POINT_DIST_SQ = 4;
const PREVIEW_THROTTLE_MS = 80;

function strokesSignature(strokes: DrawingStroke[]) {
  if (strokes.length === 0) return "0";
  const first = strokes[0];
  const last = strokes[strokes.length - 1];
  return `${strokes.length}:${first.id}:${last.id}:${last.points.length}`;
}

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
  const [activeTool, setActiveTool] = useState<DrawingTool>("pen");
  const [activeColor, setActiveColor] = useState<string>(DRAWING_COLORS[0]);
  const [brushSize, setBrushSize] = useState<number>(8);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bufferRef = useRef<HTMLCanvasElement | null>(null);
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const bufferCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const draftRef = useRef<DrawingStroke | null>(null);
  const renderedCountRef = useRef(0);
  const renderedSignatureRef = useRef("0");
  const rafRef = useRef(0);
  const framePendingRef = useRef(false);
  const lastPreviewTime = useRef(0);
  const onPreviewRef = useRef(onPreview);
  const onCommitRef = useRef(onCommit);
  const strokesRef = useRef(strokes);
  const strokesSignatureValue = strokesSignature(strokes);
  onPreviewRef.current = onPreview;
  onCommitRef.current = onCommit;
  strokesRef.current = strokes;

  useEffect(() => {
    const buffer = document.createElement("canvas");
    buffer.width = DRAWING_SIZE;
    buffer.height = DRAWING_SIZE;
    const ctx = buffer.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#fbf7f0";
      ctx.fillRect(0, 0, DRAWING_SIZE, DRAWING_SIZE);
    }
    bufferRef.current = buffer;
    bufferCtxRef.current = ctx;

    if (canvasRef.current) {
      canvasRef.current.width = DRAWING_SIZE;
      canvasRef.current.height = DRAWING_SIZE;
      const canvasCtx = canvasRef.current.getContext("2d");
      if (canvasCtx) {
        canvasCtx.imageSmoothingEnabled = true;
      }
      canvasCtxRef.current = canvasCtx;
    }
  }, []);

  const renderFrame = useCallback(() => {
    rafRef.current = requestAnimationFrame(() => {
      framePendingRef.current = false;
      const canvas = canvasRef.current;
      const buffer = bufferRef.current;
      if (!canvas || !buffer) return;
      const ctx = canvasCtxRef.current ?? canvas.getContext("2d");
      if (!ctx) return;
      canvasCtxRef.current = ctx;
      ctx.clearRect(0, 0, DRAWING_SIZE, DRAWING_SIZE);
      ctx.drawImage(buffer, 0, 0);
      const draft = draftRef.current;
      if (draft) drawStroke(ctx, draft);
    });
  }, []);

  const scheduleFrame = useCallback(() => {
    if (framePendingRef.current) return;
    framePendingRef.current = true;
    renderFrame();
  }, [renderFrame]);

  useEffect(() => {
    if (!bufferRef.current) return;
    if (
      strokes.length < renderedCountRef.current ||
      (strokes.length === renderedCountRef.current && strokesSignatureValue !== renderedSignatureRef.current)
    ) {
      renderStrokeCanvas(bufferRef.current, strokes);
      renderedCountRef.current = strokes.length;
      renderedSignatureRef.current = strokesSignatureValue;
      scheduleFrame();
      return;
    }

    if (strokes.length > renderedCountRef.current) {
      const ctx = bufferCtxRef.current ?? bufferRef.current.getContext("2d");
      if (ctx) {
        bufferCtxRef.current = ctx;
        for (let index = renderedCountRef.current; index < strokes.length; index += 1) {
          drawStroke(ctx, strokes[index]);
        }
      } else {
        renderStrokeCanvas(bufferRef.current, strokes);
      }
      renderedCountRef.current = strokes.length;
      renderedSignatureRef.current = strokesSignatureValue;
      scheduleFrame();
    }
  }, [scheduleFrame, strokes, strokesSignatureValue]);

  useEffect(
    () => () => {
      framePendingRef.current = false;
      cancelAnimationFrame(rafRef.current);
    },
    []
  );

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

  function sendPreview(stroke: DrawingStroke) {
    const now = performance.now();
    if (now - lastPreviewTime.current < PREVIEW_THROTTLE_MS) return;
    lastPreviewTime.current = now;
    onPreviewRef.current(stroke);
  }

  function beginStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) return;
    const point = normalizePointerPosition(event, canvasRef.current);
    const stroke = buildStroke(point);

    if (activeTool === "fill") {
      if (bufferRef.current) {
        renderStrokeCanvas(bufferRef.current, [...strokesRef.current, stroke]);
      }
      renderedCountRef.current = strokesRef.current.length + 1;
      renderedSignatureRef.current = strokesSignature([...strokesRef.current, stroke]);
      scheduleFrame();
      const snapshot = bufferRef.current ? getCanvasSnapshot(bufferRef.current) : null;
      onCommitRef.current(stroke, snapshot);
      return;
    }

    canvasRef.current.setPointerCapture(event.pointerId);
    draftRef.current = stroke;
    scheduleFrame();
    sendPreview(stroke);
  }

  function moveStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    const draft = draftRef.current;
    if (!draft || !canvasRef.current) return;
    const point = normalizePointerPosition(event, canvasRef.current);
    const last = draft.points[draft.points.length - 1];
    const dx = point.x - last.x;
    const dy = point.y - last.y;
    if (dx * dx + dy * dy < MIN_POINT_DIST_SQ) return;
    draft.points.push(point);
    scheduleFrame();
    sendPreview(draft);
  }

  function finishStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    const draft = draftRef.current;
    if (!draft || !canvasRef.current) return;

    if (canvasRef.current.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }

    if (bufferRef.current) {
      const ctx = bufferCtxRef.current ?? bufferRef.current.getContext("2d");
      if (ctx) drawStroke(ctx, draft);
    }
    renderedCountRef.current = strokesRef.current.length + 1;
    renderedSignatureRef.current = strokesSignature([...strokesRef.current, draft]);
    draftRef.current = null;
    scheduleFrame();

    const snapshot = bufferRef.current ? getCanvasSnapshot(bufferRef.current) : null;
    onCommitRef.current(draft, snapshot);
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-3">
      <div className="flex flex-wrap items-center gap-2 rounded-[1.4rem] border border-[rgba(74,60,46,0.12)] bg-paper/82 px-3 py-2">
        <div className="flex flex-wrap gap-1.5">
          {TOOL_OPTIONS.map(({ tool, label, title }) => (
            <button
              key={tool}
              type="button"
              title={title}
              aria-label={title}
              onClick={() => setActiveTool(tool)}
              className={`flex min-h-9 items-center justify-center rounded-full px-3 text-xs font-semibold transition md:min-h-10 ${
                activeTool === tool
                  ? "border border-ink-950 bg-ink-950 text-paper"
                  : "border border-[rgba(74,60,46,0.12)] bg-paper text-ink-700 hover:bg-paper-warm"
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
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold uppercase transition md:h-9 md:w-9 ${
                brushSize === preset.value
                  ? "border border-ink-950 bg-ink-950 text-paper"
                  : "border border-[rgba(74,60,46,0.12)] bg-paper text-ink-700 hover:bg-paper-warm"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-[1.8rem] border border-[rgba(74,60,46,0.12)] bg-paper-warm p-2 shadow-card">
        <canvas
          ref={canvasRef}
          className="aspect-square h-full max-h-full w-full touch-none rounded-[1.3rem] bg-[#fbf7f0]"
          style={{
            cursor: activeTool === "fill" ? "cell" : activeTool === "eraser" ? "grab" : "crosshair",
            backgroundImage:
              "linear-gradient(rgba(90,68,47,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(90,68,47,0.06) 1px, transparent 1px)",
            backgroundSize: "36px 36px"
          }}
          onPointerDown={beginStroke}
          onPointerMove={moveStroke}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-[1.4rem] border border-[rgba(74,60,46,0.12)] bg-paper/82 px-3 py-2">
        <input
          type="range"
          min={2}
          max={28}
          value={brushSize}
          onChange={(event) => setBrushSize(Number(event.target.value))}
          className="min-w-[80px] flex-1 accent-[color:#8B6914] md:min-w-[120px]"
          aria-label="Taille du trait"
        />
        <Button
          tone="secondary"
          onClick={onUndo}
          title="Annuler"
          className="min-h-9 px-3 text-xs"
        >
          Annuler
        </Button>
        <Button
          tone="danger"
          onClick={onClear}
          title="Tout effacer"
          className="min-h-9 px-3 text-xs"
        >
          Effacer
        </Button>
      </div>
    </div>
  );
}
