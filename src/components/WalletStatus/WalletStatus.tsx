import { useWallet } from "@solana/wallet-adapter-react";
import { Copy, LogOut, Check } from "lucide-react";
import { useState } from "react";
import { abbreviateAddress } from "@/lib/solana";

export function WalletStatus() {
  const { publicKey, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  if (!publicKey) return null;
  const address = publicKey.toBase58();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — silently ignore
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-drip-green opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-drip-green" />
        </span>
        <span className="font-mono text-[13px] text-white/80">{abbreviateAddress(address, 5)}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={copy}
          aria-label="Copy wallet address"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-drip-green" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={() => disconnect()}
          aria-label="Disconnect wallet"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
