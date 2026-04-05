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
  ctx.fillStyle = "#ffffff";
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
  ctx.strokeStyle = stroke.tool === "eraser" ? "#FFFFFF" : stroke.color;
  ctx.lineWidth = Math.max(1, stroke.size * scale);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = stroke.tool === "brush" ? 0.86 : 1;
  if (stroke.tool === "brush") {
    ctx.shadowBlur = Math.max(2, stroke.size * 0.8 * scale);
    ctx.shadowColor = `${stroke.color}66`;
  }

  const start = points[0];
  const end = points[points.length - 1];
  if (stroke.tool === "line") {
    ctx.beginPath();
    ctx.moveTo(start.x * scale, start.y * scale);
    ctx.lineTo(end.x * scale, end.y * scale);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (stroke.tool === "rect") {
    const x = Math.min(start.x, end.x) * scale;
    const y = Math.min(start.y, end.y) * scale;
    const width = Math.abs(end.x - start.x) * scale;
    const height = Math.abs(end.y - start.y) * scale;
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
    return;
  }

  if (stroke.tool === "ellipse") {
    ctx.beginPath();
    const centerX = ((start.x + end.x) / 2) * scale;
    const centerY = ((start.y + end.y) / 2) * scale;
    const radiusX = (Math.abs(end.x - start.x) / 2) * scale;
    const radiusY = (Math.abs(end.y - start.y) / 2) * scale;
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(start.x * scale, start.y * scale, Math.max(1, stroke.size * scale * 0.5), 0, Math.PI * 2);
    ctx.fillStyle = stroke.tool === "eraser" ? "#FFFFFF" : stroke.color;
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

export function getCanvasSnapshot(canvas: HTMLCanvasElement) {
  return canvas.toDataURL("image/webp", 0.82);
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
  const targetColor: [number, number, number, number] = [
    pixels[targetIndex],
    pixels[targetIndex + 1],
    pixels[targetIndex + 2],
    pixels[targetIndex + 3]
  ];
  const replacement = hexToRgba(fillColor);

  if (colorsMatch(targetColor, replacement)) {
    return;
  }

  const stack: Array<[number, number]> = [[startX, startY]];
  while (stack.length > 0) {
    const [currentX, currentY] = stack.pop()!;
    if (currentX < 0 || currentX >= width || currentY < 0 || currentY >= height) {
      continue;
    }
    const index = (currentY * width + currentX) * 4;
    const currentColor: [number, number, number, number] = [
      pixels[index],
      pixels[index + 1],
      pixels[index + 2],
      pixels[index + 3]
    ];
    if (!colorsMatch(currentColor, targetColor)) {
      continue;
    }

    pixels[index] = replacement[0];
    pixels[index + 1] = replacement[1];
    pixels[index + 2] = replacement[2];
    pixels[index + 3] = replacement[3];

    stack.push([currentX + 1, currentY]);
    stack.push([currentX - 1, currentY]);
    stack.push([currentX, currentY + 1]);
    stack.push([currentX, currentY - 1]);
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
