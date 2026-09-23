import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Wallet } from "lucide-react";

/**
 * Thin wrapper around wallet-adapter's modal — we use its connection logic
 * and selection UI, but render our own trigger button to match SOLDRIP's
 * design language (see index.css for wallet-adapter-react-ui overrides).
 */
export function WalletButton() {
  const { setVisible } = useWalletModal();
  const { connecting } = useWallet();

  return (
    <button
      onClick={() => setVisible(true)}
      disabled={connecting}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-drip-green to-drip-blue px-5 py-3.5 text-[14px] font-semibold text-void shadow-glow transition-transform duration-200 hover:scale-[1.015] active:scale-[0.985] disabled:cursor-wait disabled:opacity-70"
    >
      <Wallet className="h-4 w-4" strokeWidth={2.5} />
      {connecting ? "Connecting…" : "Connect Wallet"}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 group-hover:translate-x-full" />
    </button>
  );
}
