import { DRAWING_SIZE } from "@shared/constants";
import type { DrawingStroke } from "@shared/protocol";

export function renderStrokeCanvas(
  canvas: HTMLCanvasElement,
  strokes: DrawingStroke[],
  previewStroke?: DrawingStroke | null,
  options?: { scale?: number }
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const scale = options?.scale ?? 1;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fbf7f0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  strokes.forEach((stroke) => drawStroke(ctx, stroke, scale));
  if (previewStroke) drawStroke(ctx, previewStroke, scale);
}

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: DrawingStroke,
  scale = 1
) {
  const points = stroke.points;
  if (points.length === 0) return;

  if (stroke.tool === "fill") {
    floodFill(ctx, points[0].x * scale, points[0].y * scale, stroke.color);
    return;
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke.tool === "eraser" ? "#fbf7f0" : stroke.color;
  ctx.lineWidth = Math.max(1, stroke.size * scale);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = stroke.tool === "brush" ? 0.86 : 1;
  if (stroke.tool === "brush") {
    ctx.shadowBlur = Math.max(2, stroke.size * 0.8 * scale);
    ctx.shadowColor = `${stroke.color}66`;
  }

  const start = points[0];

  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(start.x * scale, start.y * scale, Math.max(1, stroke.size * scale * 0.5), 0, Math.PI * 2);
    ctx.fillStyle = stroke.tool === "eraser" ? "#fbf7f0" : stroke.color;
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x * scale, points[0].y * scale);
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const controlX = current.x * scale;
    const controlY = current.y * scale;
    const endX = ((current.x + next.x) / 2) * scale;
    const endY = ((current.y + next.y) / 2) * scale;
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x * scale, last.y * scale);
  ctx.stroke();
  ctx.restore();
}

// Reuse a single offscreen canvas for snapshot exports
let _exportCanvas: HTMLCanvasElement | null = null;

export function getCanvasSnapshot(canvas: HTMLCanvasElement) {
  const maxSize = 320;
  const longestEdge = Math.max(canvas.width, canvas.height);
  if (longestEdge <= maxSize) {
    return canvas.toDataURL("image/webp", 0.72);
  }

  const scale = maxSize / longestEdge;
  const w = Math.max(1, Math.round(canvas.width * scale));
  const h = Math.max(1, Math.round(canvas.height * scale));

  if (!_exportCanvas) _exportCanvas = document.createElement("canvas");
  _exportCanvas.width = w;
  _exportCanvas.height = h;
  const ctx = _exportCanvas.getContext("2d");
  if (!ctx) {
    return canvas.toDataURL("image/webp", 0.72);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(canvas, 0, 0, w, h);
  return _exportCanvas.toDataURL("image/webp", 0.72);
}

export function normalizePointerPosition(
  event: PointerEvent | React.PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * DRAWING_SIZE,
    y: ((event.clientY - rect.top) / rect.height) * DRAWING_SIZE
  };
}

/**
 * Scanline-based flood fill — much faster than naive stack approach.
 * Processes whole horizontal spans at once, reducing push/pop overhead
 * from O(pixels) to O(spans).
 */
function floodFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillColor: string
) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const startX = Math.max(0, Math.min(width - 1, Math.round(x)));
  const startY = Math.max(0, Math.min(height - 1, Math.round(y)));
  const targetIndex = (startY * width + startX) * 4;
  const tR = pixels[targetIndex];
  const tG = pixels[targetIndex + 1];
  const tB = pixels[targetIndex + 2];
  const tA = pixels[targetIndex + 3];
  const replacement = hexToRgba(fillColor);
  const tolerance = 8;

  if (
    Math.abs(tR - replacement[0]) <= tolerance &&
    Math.abs(tG - replacement[1]) <= tolerance &&
    Math.abs(tB - replacement[2]) <= tolerance &&
    Math.abs(tA - replacement[3]) <= tolerance
  ) {
    return;
  }

  function matches(i: number) {
    return (
      Math.abs(pixels[i] - tR) <= tolerance &&
      Math.abs(pixels[i + 1] - tG) <= tolerance &&
      Math.abs(pixels[i + 2] - tB) <= tolerance &&
      Math.abs(pixels[i + 3] - tA) <= tolerance
    );
  }

  function fill(i: number) {
    pixels[i] = replacement[0];
    pixels[i + 1] = replacement[1];
    pixels[i + 2] = replacement[2];
    pixels[i + 3] = replacement[3];
  }

  // Scanline stack: [leftX, rightX, y, parentY]
  const stack: number[] = [];
  stack.push(startX, startX, startY, -1);

  while (stack.length > 0) {
    const parentY = stack.pop()!;
    const sy = stack.pop()!;
    let sr = stack.pop()!;
    let sl = stack.pop()!;

    if (sy < 0 || sy >= height) continue;

    let idx = (sy * width + sl) * 4;
    if (!matches(idx)) continue;

    // Expand left
    while (sl > 0 && matches(idx - 4)) {
      sl--;
      idx -= 4;
    }
    // Expand right
    let rIdx = (sy * width + sr) * 4;
    while (sr < width - 1 && matches(rIdx + 4)) {
      sr++;
      rIdx += 4;
    }

    // Fill the span
    idx = (sy * width + sl) * 4;
    for (let cx = sl; cx <= sr; cx++, idx += 4) {
      if (matches(idx)) fill(idx);
    }

    // Scan above and below
    for (const ny of [sy - 1, sy + 1]) {
      if (ny < 0 || ny >= height || ny === parentY) continue;
      let inSpan = false;
      let spanLeft = 0;
      for (let cx = sl; cx <= sr; cx++) {
        const nIdx = (ny * width + cx) * 4;
        if (matches(nIdx)) {
          if (!inSpan) {
            spanLeft = cx;
            inSpan = true;
          }
        } else {
          if (inSpan) {
            stack.push(spanLeft, cx - 1, ny, sy);
            inSpan = false;
          }
        }
      }
      if (inSpan) {
        stack.push(spanLeft, sr, ny, sy);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function hexToRgba(hex: string): [number, number, number, number] {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : value;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return [red, green, blue, 255];
}

function colorsMatch(
  first: [number, number, number, number],
  second: [number, number, number, number]
) {
  const tolerance = 8;
  return (
    Math.abs(first[0] - second[0]) <= tolerance &&
    Math.abs(first[1] - second[1]) <= tolerance &&
    Math.abs(first[2] - second[2]) <= tolerance &&
    Math.abs(first[3] - second[3]) <= tolerance
  );
}
