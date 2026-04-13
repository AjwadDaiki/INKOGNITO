import type { CompletedRoundView, FinalResultsView, PlayerView } from "@shared/protocol";

const W = 1080;
const H = 1350;
const PAD = 60;
const BG = "#f5f0e8";
const INK = "#1a1410";
const INK_LIGHT = "#6b5d4f";
const INK_FAINT = "#c4b9a8";
const ACCENT = "#8B6914";
const DANGER = "#c43e2e";
const PAPER = "#fffdf8";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
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

function drawInkBlob(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, opacity: number) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateShareCard(
  finalResults: FinalResultsView,
  players: PlayerView[],
  roomCode: string,
  t: (key: string, params?: Record<string, string | number>) => string
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const playersById = Object.fromEntries(players.map((p) => [p.id, p]));
  const lastRound = finalResults.rounds.at(-1) ?? null;

  // ── Background ──
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Notebook lines
  ctx.strokeStyle = "rgba(90,68,47,0.06)";
  ctx.lineWidth = 1;
  for (let y = 40; y < H; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Left margin line
  ctx.strokeStyle = "rgba(196,62,46,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD + 10, 0);
  ctx.lineTo(PAD + 10, H);
  ctx.stroke();

  // Ink blobs decoration
  drawInkBlob(ctx, W - 80, 90, 40, 0.06);
  drawInkBlob(ctx, 100, H - 120, 28, 0.05);
  drawInkBlob(ctx, W - 140, H - 80, 22, 0.04);

  // ── Header ──
  ctx.fillStyle = INK;
  ctx.font = "bold 72px Caveat, cursive";
  ctx.textAlign = "center";
  ctx.fillText("Inkognito", W / 2, 100);

  ctx.fillStyle = INK_LIGHT;
  ctx.font = "500 26px Caveat, cursive";
  ctx.fillText(t("final.gameOver").toUpperCase(), W / 2, 138);

  // Room code pill
  ctx.fillStyle = INK;
  roundRect(ctx, W / 2 - 60, 150, 120, 32, 16);
  ctx.fill();
  ctx.fillStyle = BG;
  ctx.font = "600 14px 'Be Vietnam Pro', sans-serif";
  ctx.fillText(roomCode, W / 2, 172);

  // ── Divider ──
  ctx.strokeStyle = INK_FAINT;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(PAD + 30, 200);
  ctx.lineTo(W - PAD, 200);
  ctx.stroke();
  ctx.setLineDash([]);

  // ── Leaderboard ──
  let y = 230;
  ctx.fillStyle = INK_LIGHT;
  ctx.font = "500 16px 'Be Vietnam Pro', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(t("final.leaderboard").toUpperCase(), PAD + 30, y);
  y += 12;

  const top = finalResults.leaderboard.slice(0, 6);
  for (let i = 0; i < top.length; i++) {
    const entry = top[i];
    const player = playersById[entry.playerId];
    if (!player) continue;

    y += 52;
    const rowX = PAD + 30;
    const rowW = W - PAD * 2 - 30;

    // Card background
    ctx.fillStyle = i === 0 ? "rgba(212,160,23,0.08)" : PAPER;
    roundRect(ctx, rowX, y - 32, rowW, 46, 14);
    ctx.fill();
    ctx.strokeStyle = i === 0 ? "rgba(212,160,23,0.25)" : "rgba(74,60,46,0.08)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Rank
    ctx.fillStyle = INK;
    ctx.font = "bold 28px Caveat, cursive";
    ctx.textAlign = "left";
    ctx.fillText(entry.rank === 1 ? "👑" : `#${entry.rank}`, rowX + 14, y + 4);

    // Emoji + Name
    ctx.font = "24px sans-serif";
    ctx.fillText(player.profile.emoji, rowX + 60, y + 4);
    ctx.font = "bold 24px Caveat, cursive";
    ctx.fillStyle = INK;
    const name = player.profile.name.length > 16 ? player.profile.name.slice(0, 15) + "…" : player.profile.name;
    ctx.fillText(name, rowX + 92, y + 4);

    // Points pill
    const ptsText = `${entry.points} pts`;
    ctx.font = "600 13px 'Be Vietnam Pro', sans-serif";
    const ptsW = ctx.measureText(ptsText).width + 20;
    ctx.fillStyle = INK;
    roundRect(ctx, rowX + rowW - ptsW - 10, y - 14, ptsW, 28, 14);
    ctx.fill();
    ctx.fillStyle = BG;
    ctx.textAlign = "center";
    ctx.fillText(ptsText, rowX + rowW - ptsW / 2 - 10, y + 2);
    ctx.textAlign = "left";
  }

  // ── Drawings Grid (last round) ──
  if (lastRound) {
    y += 60;

    // Section title
    ctx.fillStyle = INK_LIGHT;
    ctx.font = "500 16px 'Be Vietnam Pro', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(t("final.roundWords").toUpperCase(), PAD + 30, y);

    // Words
    y += 28;
    ctx.font = "bold 30px Caveat, cursive";
    ctx.fillStyle = INK;
    ctx.fillText(lastRound.civilWord, PAD + 30, y);
    ctx.fillStyle = DANGER;
    const civilW = ctx.measureText(lastRound.civilWord).width;
    ctx.fillText(" vs " + lastRound.undercoverWord, PAD + 30 + civilW, y);

    y += 24;

    // Draw snapshots grid
    const drawingPlayers = players.filter((p) => lastRound.drawingSnapshots[p.id]);
    const cols = drawingPlayers.length <= 3 ? drawingPlayers.length : drawingPlayers.length <= 6 ? 3 : 4;
    const gridW = W - PAD * 2 - 30;
    const gap = 12;
    const cellW = Math.floor((gridW - gap * (cols - 1)) / cols);
    const cellH = cellW + 46;

    const snapImages: Array<{ player: PlayerView; img: HTMLImageElement | null; role: string }> = [];

    for (const player of drawingPlayers) {
      const src = lastRound.drawingSnapshots[player.id];
      let img: HTMLImageElement | null = null;
      if (src) {
        try { img = await loadImage(src); } catch { /* skip */ }
      }
      snapImages.push({ player, img, role: lastRound.revealedRoles[player.id] ?? "civil" });
    }

    for (let i = 0; i < snapImages.length && y + cellH < H - 100; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = PAD + 30 + col * (cellW + gap);
      const cy = y + row * (cellH + gap);

      const { player, img, role } = snapImages[i];

      // Card
      ctx.fillStyle = PAPER;
      roundRect(ctx, cx, cy, cellW, cellH, 12);
      ctx.fill();
      ctx.strokeStyle = role === "undercover" || role === "mr_white"
        ? "rgba(196,62,46,0.3)"
        : "rgba(74,60,46,0.1)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Drawing
      if (img) {
        ctx.save();
        roundRect(ctx, cx + 6, cy + 6, cellW - 12, cellW - 12, 8);
        ctx.clip();
        ctx.drawImage(img, cx + 6, cy + 6, cellW - 12, cellW - 12);
        ctx.restore();
      } else {
        ctx.fillStyle = "#fbf7f0";
        roundRect(ctx, cx + 6, cy + 6, cellW - 12, cellW - 12, 8);
        ctx.fill();
      }

      // Name + role
      ctx.font = "bold 15px Caveat, cursive";
      ctx.fillStyle = INK;
      ctx.textAlign = "center";
      const displayName = player.profile.name.length > 10 ? player.profile.name.slice(0, 9) + "…" : player.profile.name;
      ctx.fillText(`${player.profile.emoji} ${displayName}`, cx + cellW / 2, cy + cellW + 8);

      // Role badge
      ctx.font = "600 10px 'Be Vietnam Pro', sans-serif";
      ctx.fillStyle = role === "undercover" ? DANGER : role === "mr_white" ? ACCENT : INK_LIGHT;
      const roleText = role === "undercover" ? "UNDERCOVER" : role === "mr_white" ? "MR WHITE" : "CIVIL";
      ctx.fillText(roleText, cx + cellW / 2, cy + cellW + 24);

      ctx.textAlign = "left";
    }
  }

  // ── Footer ──
  ctx.fillStyle = INK_FAINT;
  ctx.font = "500 16px Caveat, cursive";
  ctx.textAlign = "center";
  ctx.fillText("inkognito.fun", W / 2, H - 30);

  ctx.fillStyle = INK_LIGHT;
  ctx.font = "500 20px Caveat, cursive";
  ctx.fillText("Play with us! 🖋️", W / 2, H - 56);

  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

export async function shareCanvas(canvas: HTMLCanvasElement, title: string) {
  try {
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png")
    );
    const file = new File([blob], "inkognito-recap.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title,
        text: "Check out our Inkognito game! 🖋️ inkognito.fun",
        files: [file]
      });
      return true;
    }
  } catch {
    // Share API not available or user cancelled
  }
  return false;
}
