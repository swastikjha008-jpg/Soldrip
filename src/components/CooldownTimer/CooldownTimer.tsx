import { Timer } from "lucide-react";

export function CooldownTimer({ seconds }: { seconds: number }) {
  if (seconds <= 0) return null;
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return (
    <div className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-white/40">
      <Timer className="h-3.5 w-3.5" />
      Next claim available in{" "}
      <span className="font-mono text-white/70">
        {mm > 0 ? `${mm}m ` : ""}
        {ss}s
      </span>
    </div>
  );
}
