import { createCanvas } from "@napi-rs/canvas";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, "../public");

const BG = "#f5f0e8";
const INK = "#1a1410";
const INK_LIGHT = "#6b5d4f";
const INK_FAINT = "#c4b9a8";
const ACCENT = "#8B6914";
const PAPER = "#fffdf8";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawInkBlob(ctx, x, y, r, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawNotebookLines(ctx, w, h, spacing) {
  ctx.strokeStyle = "rgba(90,68,47,0.07)";
  ctx.lineWidth = 1;
  for (let y = spacing; y < h; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawMarginLine(ctx, x, h) {
  ctx.strokeStyle = "rgba(196,62,46,0.15)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, h);
  ctx.stroke();
}

function drawSpiralHoles(ctx, x, h, count) {
  const spacing = h / (count + 1);
  for (let i = 1; i <= count; i++) {
    const y = i * spacing;
    // Shadow
    ctx.fillStyle = "rgba(90,68,47,0.15)";
    ctx.beginPath();
    ctx.arc(x + 1, y + 1, 7, 0, Math.PI * 2);
    ctx.fill();
    // Hole
    ctx.fillStyle = BG;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(90,68,47,0.2)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

// ═══════════════════════════════════════
// OG IMAGE (1200x630)
// ═══════════════════════════════════════
function generateOgImage() {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Notebook lines
  drawNotebookLines(ctx, W, H, 28);

  // Left margin
  drawMarginLine(ctx, 80, H);

  // Spiral holes
  drawSpiralHoles(ctx, 40, H, 12);

  // Ink blobs
  drawInkBlob(ctx, W - 100, 80, 50, 0.07);
  drawInkBlob(ctx, W - 180, H - 60, 35, 0.05);
  drawInkBlob(ctx, 150, H - 80, 28, 0.06);
  drawInkBlob(ctx, W - 60, H / 2, 20, 0.04);

  // Coffee stain
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.strokeStyle = "#6b4226";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(W - 220, 130, 55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(W - 220, 130, 50, 0.5, 2.8);
  ctx.stroke();
  ctx.restore();

  // Paper card (center)
  ctx.save();
  ctx.shadowColor = "rgba(90,68,47,0.18)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = PAPER;
  roundRect(ctx, 120, 80, W - 240, H - 160, 28);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(74,60,46,0.1)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, 120, 80, W - 240, H - 160, 28);
  ctx.stroke();

  // Washi tape top-right
  ctx.save();
  ctx.translate(W - 180, 68);
  ctx.rotate(-0.15);
  ctx.fillStyle = "rgba(212,160,23,0.25)";
  ctx.fillRect(-50, -12, 100, 24);
  ctx.restore();

  // Washi tape bottom-left
  ctx.save();
  ctx.translate(160, H - 70);
  ctx.rotate(0.1);
  ctx.fillStyle = "rgba(196,62,46,0.18)";
  ctx.fillRect(-45, -10, 90, 20);
  ctx.restore();

  // Title
  ctx.fillStyle = INK;
  ctx.font = "bold 96px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Inkognito", W / 2, H / 2 - 60);

  // Subtitle
  ctx.fillStyle = INK_LIGHT;
  ctx.font = "500 30px sans-serif";
  ctx.fillText("Draw. Bluff. Unmask.", W / 2, H / 2 + 10);

  // Tagline
  ctx.fillStyle = INK_FAINT;
  ctx.font = "400 20px sans-serif";
  ctx.fillText("Free multiplayer drawing party game — play with friends!", W / 2, H / 2 + 55);

  // Emojis décoratifs
  ctx.font = "42px sans-serif";
  ctx.fillText("🖋️", 200, H / 2 - 20);
  ctx.fillText("🎨", W - 200, H / 2 - 20);

  // URL pill
  ctx.fillStyle = INK;
  roundRect(ctx, W / 2 - 100, H / 2 + 80, 200, 40, 20);
  ctx.fill();
  ctx.fillStyle = BG;
  ctx.font = "600 17px sans-serif";
  ctx.fillText("inkognito.fun", W / 2, H / 2 + 104);

  return canvas.toBuffer("image/png");
}

// ═══════════════════════════════════════
// APP ICON (square, for 192 and 512)
// ═══════════════════════════════════════
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const pad = size * 0.08;
  const r = size * 0.22;

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, size, size);

  // Notebook lines (subtle)
  ctx.strokeStyle = "rgba(90,68,47,0.06)";
  ctx.lineWidth = 1;
  const lineSpacing = size * 0.06;
  for (let y = lineSpacing; y < size; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Paper card
  ctx.save();
  ctx.shadowColor = "rgba(90,68,47,0.2)";
  ctx.shadowBlur = size * 0.06;
  ctx.shadowOffsetY = size * 0.02;
  ctx.fillStyle = PAPER;
  roundRect(ctx, pad, pad, size - pad * 2, size - pad * 2, r);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(74,60,46,0.1)";
  ctx.lineWidth = 2;
  roundRect(ctx, pad, pad, size - pad * 2, size - pad * 2, r);
  ctx.stroke();

  // Ink blob top-right
  drawInkBlob(ctx, size * 0.78, size * 0.18, size * 0.06, 0.1);

  // "I" letter
  ctx.fillStyle = INK;
  ctx.font = `bold ${size * 0.48}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("I", size / 2, size * 0.46);

  // Pen emoji underneath
  ctx.font = `${size * 0.14}px sans-serif`;
  ctx.fillText("🖋️", size / 2, size * 0.72);

  // Bottom accent line
  ctx.fillStyle = ACCENT;
  roundRect(ctx, size * 0.3, size * 0.82, size * 0.4, size * 0.025, size * 0.01);
  ctx.fill();

  return canvas.toBuffer("image/png");
}

// ═══════════════════════════════════════
// Generate all
// ═══════════════════════════════════════

console.log("Generating og-image.png (1200x630)...");
writeFileSync(resolve(publicDir, "og-image.png"), generateOgImage());

console.log("Generating icon-192.png...");
writeFileSync(resolve(publicDir, "icon-192.png"), generateIcon(192));

console.log("Generating icon-512.png...");
writeFileSync(resolve(publicDir, "icon-512.png"), generateIcon(512));

console.log("Done! Assets written to public/");
