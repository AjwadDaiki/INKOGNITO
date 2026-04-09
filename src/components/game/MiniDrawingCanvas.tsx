import { memo, useEffect, useRef } from "react";
import clsx from "clsx";
import { DRAWING_PREVIEW_SIZE, DRAWING_SIZE } from "@shared/constants";
import type { DrawingStroke } from "@shared/protocol";
import { drawStroke, renderStrokeCanvas } from "@/lib/canvas";

/**
 * Optimized mini canvas with incremental buffer rendering.
 * - Committed strokes are baked into an offscreen buffer (only new ones drawn)
 * - Preview stroke is drawn on top via buffer copy + 1 stroke
 * - No full redraw unless undo/clear happens
 */
function MiniDrawingCanvasComponent({
  strokes,
  previewStroke,
  size = DRAWING_PREVIEW_SIZE,
  className
}: {
  strokes: DrawingStroke[];
  previewStroke?: DrawingStroke | null;
  size?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const bufferRef = useRef<HTMLCanvasElement | null>(null);
  const renderedCount = useRef(0);
  const currentSize = useRef(0);
  const rafId = useRef(0);

  // Create offscreen buffer (once)
  useEffect(() => {
    const buffer = document.createElement("canvas");
    buffer.width = size;
    buffer.height = size;
    const ctx = buffer.getContext("2d");
    if (ctx) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size); }
    bufferRef.current = buffer;
    currentSize.current = size;

    if (ref.current) {
      ref.current.width = size;
      ref.current.height = size;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle size changes
  useEffect(() => {
    if (currentSize.current === size) return;
    currentSize.current = size;
    if (bufferRef.current) {
      bufferRef.current.width = size;
      bufferRef.current.height = size;
    }
    if (ref.current) {
      ref.current.width = size;
      ref.current.height = size;
    }
    // Force full redraw
    renderedCount.current = 0;
  }, [size]);

  // Incremental buffer update when committed strokes change
  useEffect(() => {
    const buffer = bufferRef.current;
    if (!buffer) return;
    const scale = size / DRAWING_SIZE;

    if (strokes.length < renderedCount.current) {
      // Undo/clear: full redraw
      renderStrokeCanvas(buffer, strokes, null, { scale });
      renderedCount.current = strokes.length;
    } else if (strokes.length > renderedCount.current) {
      // New strokes: draw only the new ones onto buffer
      const ctx = buffer.getContext("2d");
      if (ctx) {
        for (let i = renderedCount.current; i < strokes.length; i++) {
          drawStroke(ctx, strokes[i], scale);
        }
      }
      renderedCount.current = strokes.length;
    }
    // else: same count, nothing to bake
  }, [strokes, size]);

  // Composite: buffer + preview → visible canvas (rAF batched)
  useEffect(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      const canvas = ref.current;
      const buffer = bufferRef.current;
      if (!canvas || !buffer) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(buffer, 0, 0);

      if (previewStroke) {
        drawStroke(ctx, previewStroke, size / DRAWING_SIZE);
      }
    });
    return () => cancelAnimationFrame(rafId.current);
  }, [previewStroke, strokes, size]);

  return (
    <canvas
      ref={ref}
      className={clsx(
        "aspect-square rounded-[20px] border border-white/10 bg-white shadow-inner",
        className
      )}
      aria-label="Apercu du dessin"
    />
  );
}

export const MiniDrawingCanvas = memo(MiniDrawingCanvasComponent);
