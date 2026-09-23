import type { AsciiConfig } from "@/types";
import {
  applyBrightnessContrast,
  applyGrayscale,
  applySaturation,
  applyTint,
  clamp,
  luminance,
  type RGB,
} from "./colors";
import { drawCell } from "./modes";
import { animationModulation } from "./animation";
import { applyPostEffects } from "./effects";

interface SampledCell {
  x: number; // grid column
  y: number; // grid row
  cx: number; // px center x
  cy: number; // px center y
  color: RGB;
  brightness: number; // 0..1, luminance-derived
  edge: number; // 0..1, local contrast vs neighbors
}

/**
 * AsciiRenderer drives the full pipeline described in the project brief:
 *   1. draw source into an offscreen sample canvas at grid resolution
 *   2. per-cell: average RGB -> luminance -> brightness/edge
 *   3. render according to renderMode
 *   4. color adjustments -> post effects -> animation
 * It owns its own rAF loop and is framework-agnostic so React only
 * has to mount/unmount it.
 */
export class AsciiRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sampleCanvas: HTMLCanvasElement;
  private sampleCtx: CanvasRenderingContext2D;
  private sourceImage: HTMLImageElement | null = null;
  private sourceReady = false;
  private config: AsciiConfig;
  private dpr = 1;
  private width = 0;
  private height = 0;
  private cols = 0;
  private rows = 0;
  private rafId: number | null = null;
  private startTime = performance.now();
  private resizeObserver: ResizeObserver | null = null;
  private reducedMotion = false;
  private boostUntil = 0;

  constructor(canvas: HTMLCanvasElement, config: AsciiConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    this.ctx = ctx;

    this.sampleCanvas = document.createElement("canvas");
    const sctx = this.sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!sctx) throw new Error("2D canvas context unavailable");
    this.sampleCtx = sctx;

    this.config = config;
    this.reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
    this.handleResize();
  }

  updateConfig(config: Partial<AsciiConfig>) {
    this.config = { ...this.config, ...config };
    this.resample();
  }

  /** Briefly intensifies the background — called after a successful claim. */
  triggerBoost(durationMs = 1400) {
    this.boostUntil = performance.now() + durationMs;
  }

  async loadSourceImage(src: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        this.sourceImage = img;
        this.sourceReady = true;
        this.resample();
        resolve();
      };
      img.onerror = () => {
        // Graceful fallback: procedurally generated texture, no network dependency.
        this.sourceImage = null;
        this.sourceReady = false;
        this.resample();
        resolve();
      };
      img.src = src;
    });
  }

  start() {
    if (this.rafId != null) return;
    const loop = () => {
      this.render();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  destroy() {
    this.stop();
    this.resizeObserver?.disconnect();
  }

  private handleResize() {
    const parent = this.canvas.parentElement ?? this.canvas;
    const rect = parent.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.resample();
  }

  /** Re-draws the source (or procedural fallback) into the low-res sample canvas. */
  private resample() {
    const cellSize = Math.max(4, this.config.cellSize);
    this.cols = Math.max(1, Math.ceil(this.width / cellSize));
    this.rows = Math.max(1, Math.ceil(this.height / cellSize));

    this.sampleCanvas.width = this.cols;
    this.sampleCanvas.height = this.rows;

    if (this.sourceReady && this.sourceImage) {
      // Cover-fit the source image into the sample grid.
      const img = this.sourceImage;
      const scale = Math.max(this.cols / img.width, this.rows / img.height);
      const sw = this.cols / scale;
      const sh = this.rows / scale;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;
      this.sampleCtx.imageSmoothingEnabled = true;
      this.sampleCtx.drawImage(img, sx, sy, sw, sh, 0, 0, this.cols, this.rows);
    } else {
      this.drawProceduralSource();
    }
  }

  /**
   * Procedural fallback texture: layered radial "terrain" noise so the
   * renderer never depends on an external/shipped image asset. Deterministic
   * per-session (no per-frame regeneration — animation comes from the
   * render loop's time-based modulation, not from re-sampling this).
   */
  private drawProceduralSource() {
    const w = this.cols;
    const h = this.rows;
    const sctx = this.sampleCtx;
    sctx.clearRect(0, 0, w, h);

    const grad = sctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.85);
    grad.addColorStop(0, "#0f2a22");
    grad.addColorStop(0.5, "#0a1620");
    grad.addColorStop(1, "#05060a");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, w, h);

    // A handful of pseudo-random soft blobs to emulate organic "terrain"
    // luminance variation, seeded deterministically so it's stable across
    // resizes within a session.
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const blobCount = 14;
    for (let i = 0; i < blobCount; i++) {
      const bx = rand() * w;
      const by = rand() * h;
      const br = (0.12 + rand() * 0.28) * Math.max(w, h);
      const bg = sctx.createRadialGradient(bx, by, 0, bx, by, br);
      const hue = rand() > 0.5 ? "20,241,149" : "30,111,255";
      bg.addColorStop(0, `rgba(${hue},${0.14 + rand() * 0.16})`);
      bg.addColorStop(1, "rgba(0,0,0,0)");
      sctx.fillStyle = bg;
      sctx.fillRect(0, 0, w, h);
    }
  }

  private sampleCells(): SampledCell[] {
    const cellSize = Math.max(4, this.config.cellSize);
    let data: Uint8ClampedArray;
    try {
      data = this.sampleCtx.getImageData(0, 0, this.cols, this.rows).data;
    } catch {
      return [];
    }

    const raw: number[] = new Array(this.cols * this.rows);
    const cells: SampledCell[] = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const i = (y * this.cols + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = luminance({ r, g, b }) / 255;
        raw[y * this.cols + x] = lum;
      }
    }

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const i = (y * this.cols + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = raw[y * this.cols + x];

        // Simple edge emphasis: local gradient vs right/bottom neighbor.
        const right = x + 1 < this.cols ? raw[y * this.cols + x + 1] : lum;
        const down = y + 1 < this.rows ? raw[(y + 1) * this.cols + x] : lum;
        const edge = Math.min(1, Math.abs(lum - right) + Math.abs(lum - down));

        cells.push({
          x,
          y,
          cx: x * cellSize + cellSize / 2,
          cy: y * cellSize + cellSize / 2,
          color: { r, g, b },
          brightness: lum,
          edge,
        });
      }
    }
    return cells;
  }

  private render() {
    const { ctx, width, height, config } = this;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, width, height);

    const cells = this.sampleCells();
    const t = (performance.now() - this.startTime) / 1000;
    const boosting = performance.now() < this.boostUntil;
    const boost = boosting ? 1.6 : 1;

    const animEnabled = config.animated && !this.reducedMotion;
    const cellSize = Math.max(4, config.cellSize);

    for (const cell of cells) {
      let brightness01 = clamp(cell.brightness * (config.contrast / 100), 0, 1);
      brightness01 = clamp(brightness01 + config.edgeEmphasis / 100 * cell.edge, 0, 1);
      if (config.invert) brightness01 = 1 - brightness01;

      const mod = animEnabled
        ? animationModulation(config.animStyle, cell.x, cell.y, t, config.animSpeed, config.animIntensity)
        : 1;
      brightness01 = clamp(brightness01 * mod * boost, 0, 1);
      if (brightness01 <= 0.02) continue;

      let color = applyBrightnessContrast(cell.color, config.brightness, config.contrast);
      color = applySaturation(color, config.saturation);
      color = applyGrayscale(color, config.grayscale);
      color = applyTint(color, config.tint, config.tintOpacity * (boosting ? 1.4 : 1));

      drawCell({
        ctx,
        mode: config.renderMode,
        cx: cell.cx,
        cy: cell.cy,
        cellSize,
        color,
        brightness01,
        coverage01: clamp(config.coverage / 100, 0.05, 1),
        charSet: config.charSet,
        frame: Math.floor(t * 6),
      });
    }

    applyPostEffects(ctx, width, height, config.pfx, t);
  }
}
