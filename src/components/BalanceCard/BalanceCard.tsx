import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

interface BalanceCardProps {
  balance: number | null;
  loading: boolean;
  onRefresh: () => void;
}

export function BalanceCard({ balance, loading, onRefresh }: BalanceCardProps) {
  const [displayed, setDisplayed] = useState(balance ?? 0);

  // Lightweight number "count up" when balance changes, using rAF rather
  // than a timer library.
  useEffect(() => {
    if (balance == null) return;
    const start = displayed;
    const end = balance;
    const duration = 500;
    const t0 = performance.now();
    let raf: number;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(start + (end - start) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance]);

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">Devnet balance</p>
        <p className="mt-0.5 animate-count-up font-mono text-xl font-semibold text-white">
          ◎ {balance == null ? "—" : displayed.toFixed(4)}
          <span className="ml-1.5 text-sm font-normal text-white/40">SOL</span>
        </p>
      </div>
      <button
        onClick={onRefresh}
        aria-label="Refresh balance"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
