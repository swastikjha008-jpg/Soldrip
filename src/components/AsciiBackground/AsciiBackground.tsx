import { useEffect, useRef } from "react";
import { AsciiRenderer } from "@/lib/ascii/renderer";
import type { AsciiConfig } from "@/types";

export const DEFAULT_ASCII_CONFIG: AsciiConfig = {
  renderMode: "pixel",
  cellSize: 20,
  coverage: 78,
  invert: false,
  charSet: "standard",
  brightness: 0,
  contrast: 115,
  edgeEmphasis: 55,
  tint: "#1e6fff",
  tintOpacity: 30,
  saturation: 100,
  grayscale: 0,
  pfx: {
    vignette: { enabled: true, intensity: 38 },
    scanLines: { enabled: false, intensity: 40 },
    chromatic: { enabled: false, intensity: 15 },
    bloom: { enabled: true, intensity: 18 },
    filmGrain: { enabled: false, intensity: 30 },
    pixelate: { enabled: false, intensity: 15 },
  },
  animated: true,
  animStyle: "flicker",
  animSpeed: 55,
  animIntensity: 45,
  boost: 1,
};

interface AsciiBackgroundProps {
  config?: Partial<AsciiConfig>;
  sourceSrc?: string;
  /** Imperative ref for triggering the "claim success" glow reaction. */
  rendererRef?: React.MutableRefObject<AsciiRenderer | null>;
}

export function AsciiBackground({ config, sourceSrc, rendererRef }: AsciiBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<AsciiRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const merged = { ...DEFAULT_ASCII_CONFIG, ...config };
    const renderer = new AsciiRenderer(canvasRef.current, merged);
    instanceRef.current = renderer;
    if (rendererRef) rendererRef.current = renderer;

    const src = sourceSrc || (import.meta.env.VITE_ASCII_SOURCE_IMAGE as string | undefined);
    if (src) {
      renderer.loadSourceImage(src).then(() => renderer.start());
    } else {
      renderer.start();
    }

    return () => {
      renderer.destroy();
      instanceRef.current = null;
      if (rendererRef) rendererRef.current = null;
    };
    // Intentionally only re-init on mount — config tweaks after mount go
    // through updateConfig() below rather than a full remount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (instanceRef.current && config) {
      instanceRef.current.updateConfig(config);
    }
  }, [config]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-void" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/10 via-transparent to-void/60" />
    </div>
  );
}
