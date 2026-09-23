import { useCallback, useEffect, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { lamportsToSol } from "@/lib/solana";

/**
 * Tracks the connected wallet's Devnet SOL balance, with polling and a
 * manual refresh hook (used right after an airdrop lands).
 */
export function useWalletBalance(pollMs = 15000) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    setLoading(true);
    try {
      const lamports = await connection.getBalance(publicKey, "confirmed");
      setBalance(lamportsToSol(lamports));
    } catch {
      // Keep last known balance on transient RPC errors.
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(null);
      return;
    }
    refresh();
    timerRef.current = window.setInterval(refresh, pollMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [connected, publicKey, pollMs, refresh]);

  return { balance, loading, refresh };
}
