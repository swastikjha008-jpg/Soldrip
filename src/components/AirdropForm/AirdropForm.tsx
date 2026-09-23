import { useState } from "react";
import { Droplets, Loader2 } from "lucide-react";
import { AmountSelector } from "./AmountSelector";
import { CooldownTimer } from "@/components/CooldownTimer/CooldownTimer";
import { TransactionResult } from "@/components/TransactionResult/TransactionResult";
import { validateAmount } from "@/lib/solana";
import { useAirdrop } from "@/hooks/useAirdrop";
import { useCooldown } from "@/hooks/useCooldown";
import type { AirdropResult } from "@/types";

interface AirdropFormProps {
  onSuccess: (result: AirdropResult) => void;
}

export function AirdropForm({ onSuccess }: AirdropFormProps) {
  const [amount, setAmount] = useState("1");
  const [formError, setFormError] = useState<string | null>(null);
  const airdrop = useAirdrop();
  const cooldown = useCooldown();

  const busy = airdrop.status === "requesting" || airdrop.status === "confirming";

  const handleSubmit = async () => {
    setFormError(null);
    const validation = validateAmount(amount);
    if (!validation.ok) {
      setFormError(validation.error);
      return;
    }
    const signature = await airdrop.requestAirdrop(validation.value);
    if (signature) {
      cooldown.start();
      onSuccess({ status: "success", signature, amount: validation.value, error: null });
    }
  };

  const label =
    airdrop.status === "requesting"
      ? "Requesting…"
      : airdrop.status === "confirming"
        ? "Confirming…"
        : "Claim Devnet SOL";

  return (
    <div className="space-y-3.5">
      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/35">Amount</p>
        <AmountSelector value={amount} onChange={setAmount} disabled={busy || cooldown.active} />
        {formError && <p className="mt-2 text-[12px] text-red-400">{formError}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={busy || cooldown.active}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-drip-purple via-drip-blue to-drip-green bg-[length:200%_100%] px-5 py-3.5 text-[14px] font-semibold text-white shadow-glow-blue transition-[background-position,transform] duration-300 hover:bg-[100%_0] hover:scale-[1.01] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Droplets className="h-4 w-4" strokeWidth={2.5} />
        )}
        {cooldown.active ? "On cooldown" : label}
      </button>

      <p className="text-center text-[11px] text-white/30">Devnet only • Rate limits apply</p>

      <CooldownTimer seconds={cooldown.remaining} />

      <TransactionResult {...airdrop} />
    </div>
  );
}
