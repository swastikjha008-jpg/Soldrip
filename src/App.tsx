import { useCallback, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { AsciiBackground } from "@/components/AsciiBackground/AsciiBackground";
import { Navbar } from "@/components/Navbar/Navbar";
import { WalletButton } from "@/components/WalletButton/WalletButton";
import { WalletStatus } from "@/components/WalletStatus/WalletStatus";
import { BalanceCard } from "@/components/BalanceCard/BalanceCard";
import { AirdropForm } from "@/components/AirdropForm/AirdropForm";
import { Footer } from "@/components/Footer/Footer";
import { ToastStack } from "@/components/Toast/Toast";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import type { AsciiRenderer } from "@/lib/ascii/renderer";
import type { AirdropResult, ToastMessage } from "@/types";

function App() {
  const { connected } = useWallet();
  const { balance, loading, refresh } = useWalletBalance();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const rendererRef = useRef<AsciiRenderer | null>(null);

  const pushToast = useCallback((type: ToastMessage["type"], message: string) => {
    setToasts((prev) => [...prev, { id: crypto.randomUUID(), type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleAirdropSuccess = useCallback(
    (result: AirdropResult) => {
      rendererRef.current?.triggerBoost();
      pushToast("success", `${result.amount} SOL airdropped to your wallet.`);
      // Give the RPC a beat to reflect the new balance before polling.
      setTimeout(refresh, 1200);
    },
    [pushToast, refresh],
  );

  return (
    <div className="relative min-h-screen text-white">
      <AsciiBackground rendererRef={rendererRef} />
      <Navbar />

      <main className="mx-auto flex max-w-6xl flex-col items-center px-5 py-16 sm:px-8 sm:py-24">
        <div className="w-full max-w-md">
          <div className="mb-7 text-center">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-drip-green/25 bg-drip-green/[0.06] px-3 py-1 text-[11px] font-medium tracking-wide text-drip-green">
              <span className="h-1.5 w-1.5 rounded-full bg-drip-green shadow-[0_0_8px_theme(colors.drip.green)]" />
              SOLANA DEVNET
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-[44px]">
              Get Devnet SOL.
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-white/45">
              Fund your Solana wallet with test SOL for development, experiments, and on-chain builds.
            </p>
          </div>

          <div className="animate-card-in rounded-[22px] border border-white/[0.08] bg-panel p-5 shadow-2xl backdrop-blur-2xl sm:p-6">
            {!connected ? (
              <WalletButton />
            ) : (
              <div className="space-y-4">
                <WalletStatus />
                <BalanceCard balance={balance} loading={loading} onRefresh={refresh} />
                <div className="h-px bg-white/[0.06]" />
                <AirdropForm onSuccess={handleAirdropSuccess} />
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
