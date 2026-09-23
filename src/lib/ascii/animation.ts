import type { AnimStyle } from "@/types";

/**
 * Returns a 0..1 modulation value for a given cell + time, driven by the
 * selected animation style. Purely a function of time (not React state),
 * so the render loop stays cheap and deterministic under rAF.
 */
export function animationModulation(
  style: AnimStyle,
  x: number,
  y: number,
  t: number,
  speed: number, // 0..100
  intensity: number, // 0..100
): number {
  if (intensity <= 0) return 1;
  const spd = (speed / 100) * 1.6 + 0.15;
  const amt = intensity / 100;
  const time = t * spd;

  switch (style) {
    case "flicker": {
      // Cheap deterministic pseudo-noise per cell, time-seeded.
      const seed = Math.sin(x * 12.9898 + y * 78.233 + time * 3.1) * 43758.5453;
      const n = seed - Math.floor(seed);
      return 1 - amt * 0.5 + n * amt * 0.5;
    }
    case "wave": {
      const w = Math.sin(x * 0.15 + time * 2);
      return 1 - amt * 0.35 + w * amt * 0.35;
    }
    case "pulse": {
      const p = (Math.sin(time * 1.6) + 1) / 2;
      return 1 - amt * 0.4 + p * amt * 0.4;
    }
    case "shimmer": {
      const s = Math.sin((x + y) * 0.2 + time * 3);
      return 1 - amt * 0.3 + Math.abs(s) * amt * 0.3;
    }
    case "ripple": {
      const dist = Math.sqrt(x * x + y * y);
      const r = Math.sin(dist * 0.12 - time * 2.4);
      return 1 - amt * 0.35 + r * amt * 0.35;
    }
    default:
      return 1;
  }
}
