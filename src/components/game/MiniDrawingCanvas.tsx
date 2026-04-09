import { memo, useEffect, useRef } from "react";
import clsx from "clsx";
import { DRAWING_PREVIEW_SIZE, DRAWING_SIZE } from "@shared/constants";
import type { DrawingStroke } from "@shared/protocol";
import { renderStrokeCanvas } from "@/lib/canvas";

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

  useEffect(() => {
    if (!ref.current) return;
    ref.current.width = size;
    ref.current.height = size;
    renderStrokeCanvas(ref.current, strokes, previewStroke, {
      scale: size / DRAWING_SIZE
    });
  }, [previewStroke, size, strokes]);

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
