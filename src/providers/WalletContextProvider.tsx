import { useMemo, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { RPC_URL } from "@/lib/solana";

// Wallet adapter's default UI stylesheet — we re-skin its classes in
// index.css to match SOLDRIP's glassmorphism instead of pulling in a
// separate custom modal implementation.
import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletContextProvider({ children }: { children: ReactNode }) {
  // Phantom and Solflare are registered explicitly for older wallet
  // versions that predate the Wallet Standard. Backpack (and any other
  // Wallet Standard-compliant wallet) is auto-detected by
  // wallet-adapter-react at runtime and needs no explicit adapter here —
  // it will simply appear in the connect modal if the extension is
  // installed.
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
