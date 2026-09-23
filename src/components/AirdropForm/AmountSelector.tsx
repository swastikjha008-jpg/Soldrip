import { useState } from "react";
import { MAX_AIRDROP_SOL } from "@/lib/solana";

const PRESETS = [0.5, 1, 2].filter((v) => v <= MAX_AIRDROP_SOL);

interface AmountSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AmountSelector({ value, onChange, disabled }: AmountSelectorProps) {
  const [customMode, setCustomMode] = useState(!PRESETS.some((p) => String(p) === value));

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((preset) => {
          const active = !customMode && value === String(preset);
          return (
            <button
              key={preset}
              type="button"
              disabled={disabled}
              onClick={() => {
                setCustomMode(false);
                onChange(String(preset));
              }}
              className={`rounded-lg border px-2 py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-40 ${
                active
                  ? "border-drip-green/40 bg-drip-green/[0.1] text-drip-green"
                  : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white"
              }`}
            >
              {preset} SOL
            </button>
          );
        })}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setCustomMode(true)}
          className={`rounded-lg border px-2 py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-40 ${
            customMode
              ? "border-drip-blue/40 bg-drip-blue/[0.1] text-drip-blue"
              : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white"
          }`}
        >
          Custom
        </button>
      </div>

      {customMode && (
        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 focus-within:border-drip-blue/40">
          <input
            type="text"
            inputMode="decimal"
            placeholder={`0.1 – ${MAX_AIRDROP_SOL}`}
            disabled={disabled}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent font-mono text-[14px] text-white outline-none placeholder:text-white/25 disabled:opacity-40"
          />
          <span className="text-[12px] font-medium text-white/30">SOL</span>
        </div>
      )}
    </div>
  );
}
