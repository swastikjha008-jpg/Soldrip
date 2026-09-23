import type { RenderMode } from "@/types";
import { rgbToCss, type RGB } from "./colors";

const STANDARD_CHARS = " .:-=+*#%@";
const BINARY_CHARS = " 01";
const BLOCK_CHARS = " ░▒▓█";

function charFor(charSet: string, brightness01: number): string {
  const table = charSet === "binary" ? BINARY_CHARS : charSet === "blocks" ? BLOCK_CHARS : STANDARD_CHARS;
  const idx = Math.min(table.length - 1, Math.floor(brightness01 * table.length));
  return table[idx];
}

export interface CellDrawParams {
  ctx: CanvasRenderingContext2D;
  mode: RenderMode;
  cx: number; // cell center x
  cy: number; // cell center y
  cellSize: number;
  color: RGB;
  brightness01: number; // 0..1, post edge-emphasis
  coverage01: number; // 0..1
  charSet: string;
  frame: number; // for modes that want a stable per-cell variance
}

/** Draws a single cell glyph for the given render mode. All modes share the same call signature so the renderer's loop stays mode-agnostic. */
export function drawCell(p: CellDrawParams) {
  const { ctx, mode, cx, cy, cellSize, color, brightness01, coverage01 } = p;
  if (brightness01 <= 0.015) return; // near-black cells: skip drawing, let bg show through

  const alpha = Math.min(1, 0.35 + brightness01 * 0.65);
  const size = cellSize * coverage01 * (0.35 + brightness01 * 0.75);
  const fill = rgbToCss(color, alpha);

  switch (mode) {
    case "pixel": {
      ctx.fillStyle = fill;
      const s = cellSize * coverage01;
      ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
      return;
    }
    case "characters": {
      ctx.fillStyle = fill;
      ctx.font = `${Math.max(8, cellSize * 0.82)}px "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(charFor(p.charSet, brightness01), cx, cy + 1);
      return;
    }
    case "dots": {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    case "dither": {
      // 2x2 Bayer-esque dot cluster
      ctx.fillStyle = fill;
      const step = cellSize / 3;
      const count = Math.round(brightness01 * 4);
      const offsets: [number, number][] = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      for (let i = 0; i < count; i++) {
        const [ox, oy] = offsets[i];
        ctx.fillRect(cx + ox * step - 1.5, cy + oy * step - 1.5, 3, 3);
      }
      return;
    }
    case "mosaic": {
      ctx.fillStyle = fill;
      const s = cellSize * coverage01 * 0.92;
      ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - s / 2, cy - s / 2, s, s);
      return;
    }
    case "cross": {
      ctx.strokeStyle = fill;
      ctx.lineWidth = Math.max(1, cellSize * 0.08);
      const r = size / 2;
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();
      return;
    }
    case "diamond": {
      ctx.fillStyle = fill;
      const r = size / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      ctx.fill();
      return;
    }
    case "lines": {
      ctx.strokeStyle = fill;
      ctx.lineWidth = Math.max(1, cellSize * 0.12);
      const r = size / 2;
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.stroke();
      return;
    }
    case "diagonal": {
      ctx.strokeStyle = fill;
      ctx.lineWidth = Math.max(1, cellSize * 0.12);
      const r = size / 2;
      ctx.beginPath();
      ctx.moveTo(cx - r, cy - r);
      ctx.lineTo(cx + r, cy + r);
      ctx.stroke();
      return;
    }
    case "matrix": {
      ctx.fillStyle = fill;
      ctx.font = `${Math.max(8, cellSize * 0.85)}px "JetBrains Mono", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const glyphs = "アイウエオカキクケコ01";
      const idx = (p.frame + Math.floor(cx * 7 + cy * 13)) % glyphs.length;
      ctx.fillText(glyphs[idx], cx, cy + 1);
      return;
    }
    case "rings": {
      ctx.strokeStyle = fill;
      ctx.lineWidth = Math.max(1, cellSize * 0.1);
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    case "hearts": {
      drawHeart(ctx, cx, cy, size / 2, fill);
      return;
    }
    case "stars": {
      drawStar(ctx, cx, cy, size / 2, fill);
      return;
    }
    case "hexagons": {
      drawPolygon(ctx, cx, cy, size / 2, 6, fill);
      return;
    }
    case "triangles": {
      drawPolygon(ctx, cx, cy, size / 2, 3, fill);
      return;
    }
    case "bubbles": {
      ctx.strokeStyle = fill;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.globalAlpha = 1;
      return;
    }
    case "hatch": {
      ctx.strokeStyle = fill;
      ctx.lineWidth = Math.max(1, cellSize * 0.08);
      const r = size / 2;
      ctx.beginPath();
      ctx.moveTo(cx - r, cy - r);
      ctx.lineTo(cx + r, cy + r);
      if (brightness01 > 0.5) {
        ctx.moveTo(cx - r, cy + r);
        ctx.lineTo(cx + r, cy - r);
      }
      ctx.stroke();
      return;
    }
    case "contour": {
      ctx.strokeStyle = fill;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 1.5);
      ctx.stroke();
      return;
    }
    case "halfblocks": {
      ctx.fillStyle = fill;
      ctx.fillRect(cx - cellSize / 2, cy - cellSize / 2, cellSize, cellSize * brightness01);
      return;
    }
    default: {
      ctx.fillStyle = fill;
      const s = cellSize * coverage01;
      ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
    }
  }
}

function drawPolygon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sides: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * i) / 5 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  const s = r * 0.9;
  ctx.moveTo(cx, cy + s * 0.65);
  ctx.bezierCurveTo(cx + s * 1.3, cy - s * 0.4, cx + s * 0.4, cy - s * 1.2, cx, cy - s * 0.35);
  ctx.bezierCurveTo(cx - s * 0.4, cy - s * 1.2, cx - s * 1.3, cy - s * 0.4, cx, cy + s * 0.65);
  ctx.closePath();
  ctx.fill();
}
