// ------------------------------------------------------------------
// Color / tone adjustments applied to sampled cell colors before
// they're handed off to a render mode.
// ------------------------------------------------------------------

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

export function luminance({ r, g, b }: RGB): number {
  // Rec. 601 perceptual luminance
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function clamp(v: number, min = 0, max = 255): number {
  return Math.min(max, Math.max(min, v));
}

/** Brightness (-100..100) and contrast (0..200, 100 = neutral). */
export function applyBrightnessContrast(c: RGB, brightness: number, contrast: number): RGB {
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const b = brightness * 2.55;
  const adjust = (ch: number) => clamp(factor * (ch - 128 + b) + 128);
  return { r: adjust(c.r), g: adjust(c.g), b: adjust(c.b) };
}

export function applySaturation(c: RGB, saturation: number): RGB {
  const s = saturation / 100;
  const gray = luminance(c);
  const mix = (ch: number) => clamp(gray + (ch - gray) * s);
  return { r: mix(c.r), g: mix(c.g), b: mix(c.b) };
}

export function applyGrayscale(c: RGB, amount: number): RGB {
  if (amount <= 0) return c;
  const t = clamp(amount, 0, 100) / 100;
  const gray = luminance(c);
  return {
    r: c.r + (gray - c.r) * t,
    g: c.g + (gray - c.g) * t,
    b: c.b + (gray - c.b) * t,
  };
}

export function applyTint(c: RGB, tintHex: string, tintOpacity: number): RGB {
  if (tintOpacity <= 0) return c;
  const tint = hexToRgb(tintHex);
  const t = clamp(tintOpacity, 0, 100) / 100;
  return {
    r: c.r + (tint.r - c.r) * t,
    g: c.g + (tint.g - c.g) * t,
    b: c.b + (tint.b - c.b) * t,
  };
}

export function rgbToCss({ r, g, b }: RGB, alpha = 1): string {
  return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`;
}
