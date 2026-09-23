// ------------------------------------------------------------------
// Shared application types
// ------------------------------------------------------------------

export type AirdropStatus = "idle" | "requesting" | "confirming" | "success" | "error";

export interface AirdropResult {
  status: AirdropStatus;
  signature: string | null;
  amount: number | null;
  error: string | null;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

// ------------------------------------------------------------------
// ASCII / canvas background renderer types
// ------------------------------------------------------------------

export type RenderMode =
  | "pixel"
  | "characters"
  | "dots"
  | "dither"
  | "mosaic"
  | "cross"
  | "diamond"
  | "lines"
  | "diagonal"
  | "matrix"
  | "rings"
  | "hearts"
  | "stars"
  | "hexagons"
  | "triangles"
  | "bubbles"
  | "hatch"
  | "contour"
  | "halfblocks";

export type AnimStyle = "flicker" | "wave" | "pulse" | "shimmer" | "ripple";

export interface AsciiEffectToggle {
  enabled: boolean;
  intensity: number; // 0-100
}

export interface AsciiPostEffects {
  vignette: AsciiEffectToggle;
  scanLines: AsciiEffectToggle;
  chromatic: AsciiEffectToggle;
  bloom: AsciiEffectToggle;
  filmGrain: AsciiEffectToggle;
  pixelate: AsciiEffectToggle;
}

export interface AsciiConfig {
  renderMode: RenderMode;
  cellSize: number;
  coverage: number; // 0-100, how much of each cell the glyph fills
  invert: boolean;
  charSet: "standard" | "blocks" | "binary";
  brightness: number; // -100..100
  contrast: number; // 0..200 (100 = neutral)
  edgeEmphasis: number; // 0..100
  tint: string; // hex
  tintOpacity: number; // 0..100
  saturation: number; // 0..200
  grayscale: number; // 0..100
  pfx: AsciiPostEffects;
  animated: boolean;
  animStyle: AnimStyle;
  animSpeed: number; // 0..100
  animIntensity: number; // 0..100
  /** Multiplier applied briefly after a successful claim (background "glow" reaction) */
  boost: number;
}
