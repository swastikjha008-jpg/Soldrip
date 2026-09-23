import { Connection, LAMPORTS_PER_SOL, clusterApiUrl, PublicKey } from "@solana/web3.js";

/** Devnet RPC endpoint — overridable via VITE_SOLANA_RPC_URL for a dedicated RPC provider. */
export const RPC_URL =
  (import.meta.env.VITE_SOLANA_RPC_URL as string | undefined) || clusterApiUrl("devnet");

export const EXPLORER_CLUSTER =
  (import.meta.env.VITE_EXPLORER_CLUSTER as string | undefined) || "devnet";

export const MAX_AIRDROP_SOL = Number(import.meta.env.VITE_MAX_AIRDROP_SOL ?? 2);

export const COOLDOWN_SECONDS = Number(import.meta.env.VITE_COOLDOWN_SECONDS ?? 60);

let connectionSingleton: Connection | null = null;

/** Shared Devnet connection instance. */
export function getConnection(): Connection {
  if (!connectionSingleton) {
    connectionSingleton = new Connection(RPC_URL, "confirmed");
  }
  return connectionSingleton;
}

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL);
}

export function abbreviateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${EXPLORER_CLUSTER}`;
}

export function explorerAddressUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=${EXPLORER_CLUSTER}`;
}

/** Validates a raw user-entered amount string against faucet limits. */
export function validateAmount(raw: string): { ok: true; value: number } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Enter an amount." };

  const value = Number(trimmed);
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return { ok: false, error: "Enter a valid number." };
  }
  if (value <= 0) {
    return { ok: false, error: "Amount must be greater than 0." };
  }
  if (value > MAX_AIRDROP_SOL) {
    return { ok: false, error: `Max ${MAX_AIRDROP_SOL} SOL per request on this faucet.` };
  }
  // Solana amounts only make sense to a handful of decimal places.
  if (!/^\d+(\.\d{1,9})?$/.test(trimmed)) {
    return { ok: false, error: "Too many decimal places." };
  }
  return { ok: true, value };
}

export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/** Human-readable messages for common Devnet airdrop failure modes. */
export function describeAirdropError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const msg = raw.toLowerCase();

  if (msg.includes("429") || msg.includes("rate limit") || msg.includes("too many requests")) {
    return "The Devnet faucet is rate-limited right now. Wait a bit and try again.";
  }
  if (msg.includes("airdrop limit") || msg.includes("exceeds") || msg.includes("limit for airdrop")) {
    return "That exceeds the Devnet airdrop limit for this RPC. Try a smaller amount.";
  }
  if (msg.includes("user rejected") || msg.includes("rejected the request")) {
    return "Wallet action was rejected.";
  }
  if (msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("network request failed")) {
    return "Network error reaching the Devnet RPC. Check your connection and try again.";
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return "The request timed out waiting for confirmation. It may still land — check Explorer shortly.";
  }
  if (msg.includes("blockhash not found") || msg.includes("block height exceeded")) {
    return "The transaction expired before it could be confirmed. Please try again.";
  }
  return "Something went wrong requesting the airdrop. Please try again.";
}
