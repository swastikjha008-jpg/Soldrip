import type { AsciiPostEffects } from "@/types";

/** Applies full-frame post effects on top of the rendered cell grid. */
export function applyPostEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pfx: AsciiPostEffects,
  t: number,
) {
  if (pfx.vignette.enabled) drawVignette(ctx, width, height, pfx.vignette.intensity);
  if (pfx.scanLines.enabled) drawScanLines(ctx, width, height, pfx.scanLines.intensity);
  if (pfx.chromatic.enabled) drawChromaticEdge(ctx, width, height, pfx.chromatic.intensity);
  if (pfx.bloom.enabled) drawBloom(ctx, width, height, pfx.bloom.intensity);
  if (pfx.filmGrain.enabled) drawFilmGrain(ctx, width, height, pfx.filmGrain.intensity, t);
}

function drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) {
  const amt = intensity / 100;
  const grad = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.25,
    w / 2, h / 2, Math.max(w, h) * 0.72,
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(0,0,0,${0.55 * amt})`);
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function drawScanLines(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) {
  const amt = intensity / 100;
  ctx.save();
  ctx.globalAlpha = 0.25 * amt;
  ctx.fillStyle = "#000000";
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }
  ctx.restore();
}

function drawChromaticEdge(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) {
  // Lightweight edge-tinted chromatic aberration hint (full pixel-shift
  // chromatic aberration is expensive per-frame; this fakes the look
  // along the border where it reads most clearly).
  const amt = intensity / 100;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.18 * amt;
  ctx.fillStyle = "#ff2e63";
  ctx.fillRect(0, 0, w * 0.01 + 2, h);
  ctx.fillStyle = "#22d3ee";
  ctx.fillRect(w - (w * 0.01 + 2), 0, w * 0.01 + 2, h);
  ctx.restore();
}

function drawBloom(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) {
  const amt = intensity / 100;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.filter = `blur(${8 + amt * 10}px)`;
  ctx.globalAlpha = 0.15 * amt;
  ctx.drawImage(ctx.canvas, 0, 0, w, h);
  ctx.restore();
}

let grainCanvas: HTMLCanvasElement | null = null;
function drawFilmGrain(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number, t: number) {
  const amt = intensity / 100;
  if (!grainCanvas) {
    grainCanvas = document.createElement("canvas");
    grainCanvas.width = 128;
    grainCanvas.height = 128;
    const gctx = grainCanvas.getContext("2d")!;
    const imgData = gctx.createImageData(128, 128);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const v = Math.random() * 255;
      imgData.data[i] = v;
      imgData.data[i + 1] = v;
      imgData.data[i + 2] = v;
      imgData.data[i + 3] = 255;
    }
    gctx.putImageData(imgData, 0, 0);
  }
  ctx.save();
  ctx.globalAlpha = 0.06 * amt;
  ctx.globalCompositeOperation = "overlay";
  const offX = (Math.sin(t * 7) * 40) | 0;
  const offY = (Math.cos(t * 5) * 40) | 0;
  ctx.translate(offX, offY);
  const pattern = ctx.createPattern(grainCanvas, "repeat");
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(-offX, -offY, w, h);
  }
  ctx.restore();
}
