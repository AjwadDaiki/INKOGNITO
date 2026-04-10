import { memo, useEffect, useRef } from "react";
import clsx from "clsx";
import { DRAWING_PREVIEW_SIZE, DRAWING_SIZE } from "@shared/constants";
import type { DrawingStroke } from "@shared/protocol";
import { drawStroke, renderStrokeCanvas } from "@/lib/canvas";

function strokeSignature(stroke?: DrawingStroke | null) {
  if (!stroke) return "";
  const lastPoint = stroke.points[stroke.points.length - 1];
  return `${stroke.id}:${stroke.points.length}:${lastPoint?.x ?? 0}:${lastPoint?.y ?? 0}`;
}

function strokesSignature(strokes: DrawingStroke[]) {
  if (strokes.length === 0) return "0";
  const last = strokes[strokes.length - 1];
  return `${strokes.length}:${last.id}:${last.points.length}:${last.createdAt}`;
}

function MiniDrawingCanvasComponent({
  strokes,
  previewStroke,
  size = DRAWING_PREVIEW_SIZE,
  className,
  frameClassName
}: {
  strokes: DrawingStroke[];
  previewStroke?: DrawingStroke | null;
  size?: number;
  className?: string;
  frameClassName?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const bufferRef = useRef<HTMLCanvasElement | null>(null);
  const renderedCount = useRef(0);
  const currentSize = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
    const buffer = document.createElement("canvas");
    buffer.width = size;
    buffer.height = size;
    const ctx = buffer.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#fbf7f0";
      ctx.fillRect(0, 0, size, size);
    }
    bufferRef.current = buffer;
    currentSize.current = size;
    if (ref.current) {
      ref.current.width = size;
      ref.current.height = size;
    }
  }, [size]);

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
    renderedCount.current = 0;
  }, [size]);

  useEffect(() => {
    const buffer = bufferRef.current;
    if (!buffer) return;
    const scale = size / DRAWING_SIZE;
    if (strokes.length < renderedCount.current) {
      renderStrokeCanvas(buffer, strokes, null, { scale });
      renderedCount.current = strokes.length;
    } else if (strokes.length > renderedCount.current) {
      const ctx = buffer.getContext("2d");
      if (ctx) {
        for (let index = renderedCount.current; index < strokes.length; index += 1) {
          drawStroke(ctx, strokes[index], scale);
        }
      }
      renderedCount.current = strokes.length;
    }
  }, [strokes, size]);

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
    <div className={clsx("relative w-full", className)}>
      <div
        className={clsx(
          "relative flex w-full items-center justify-center overflow-hidden rounded-[1rem] border border-[rgba(74,60,46,0.12)] bg-[#f1e7d8]",
          frameClassName ?? "aspect-[4/3]"
        )}
      >
        <div className="absolute inset-y-[8%] left-[9%] right-[9%] flex items-center justify-center rounded-[0.8rem] border border-[rgba(74,60,46,0.08)] bg-[#fbf7f0] shadow-inner">
          <canvas
            ref={ref}
            className="aspect-square h-full max-h-full w-auto max-w-full"
            aria-label="Apercu du dessin"
          />
        </div>
      </div>
    </div>
  );
}

export const MiniDrawingCanvas = memo(MiniDrawingCanvasComponent, (prev, next) => {
  return (
    prev.size === next.size &&
    prev.className === next.className &&
    prev.frameClassName === next.frameClassName &&
    strokesSignature(prev.strokes) === strokesSignature(next.strokes) &&
    strokeSignature(prev.previewStroke) === strokeSignature(next.previewStroke)
  );
});
