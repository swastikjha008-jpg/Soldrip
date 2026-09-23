import { useCallback, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { describeAirdropError, solToLamports } from "@/lib/solana";
import type { AirdropResult } from "@/types";

const IDLE: AirdropResult = { status: "idle", signature: null, amount: null, error: null };

/**
 * Drives the full airdrop flow against Solana Devnet: request -> confirm ->
 * surface a signature (or a human-readable error).
 */
export function useAirdrop() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [result, setResult] = useState<AirdropResult>(IDLE);

  const reset = useCallback(() => setResult(IDLE), []);

  const requestAirdrop = useCallback(
    async (amountSol: number) => {
      if (!connected || !publicKey) {
        setResult({ status: "error", signature: null, amount: null, error: "Connect a wallet first." });
        return;
      }

      setResult({ status: "requesting", signature: null, amount: amountSol, error: null });
      try {
        const signature = await connection.requestAirdrop(publicKey, solToLamports(amountSol));

        setResult({ status: "confirming", signature, amount: amountSol, error: null });

        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction(
          {
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          },
          "confirmed",
        );

        setResult({ status: "success", signature, amount: amountSol, error: null });
        return signature;
      } catch (err) {
        setResult({
          status: "error",
          signature: null,
          amount: amountSol,
          error: describeAirdropError(err),
        });
        return null;
      }
    },
    [connection, connected, publicKey],
  );

  return { ...result, requestAirdrop, reset };
}
