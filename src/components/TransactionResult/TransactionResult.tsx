import { CheckCircle2, ExternalLink, AlertCircle } from "lucide-react";
import { explorerTxUrl } from "@/lib/solana";
import type { AirdropResult } from "@/types";

export function TransactionResult({ status, signature, amount, error }: AirdropResult) {
  if (status === "success" && signature) {
    return (
      <div className="animate-card-in rounded-xl border border-drip-green/25 bg-drip-green/[0.06] p-4">
        <div className="flex items-center gap-2 text-drip-green">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-[13px] font-semibold">Airdrop sent</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-white/35">Amount</p>
            <p className="font-mono text-[15px] font-semibold text-white">{amount} SOL</p>
          </div>
          <a
            href={explorerTxUrl(signature)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-white/80 transition-colors hover:border-drip-green/30 hover:text-drip-green"
          >
            View on Explorer
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <div className="animate-card-in flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        <p className="text-[13px] leading-snug text-red-200/90">{error}</p>
      </div>
    );
  }

  return null;
}
