import { useCallback, useEffect, useRef, useState } from "react";
import { COOLDOWN_SECONDS } from "@/lib/solana";

const STORAGE_KEY = "soldrip:lastClaimAt";

/**
 * Client-side claim cooldown, persisted in localStorage so a page refresh
 * can't be used to bypass the rate limit. This is a UX guardrail, not a
 * security boundary — real abuse prevention belongs server-side (see README).
 */
export function useCooldown(seconds = COOLDOWN_SECONDS) {
  const [remaining, setRemaining] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    const last = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    const elapsed = (Date.now() - last) / 1000;
    const left = Math.max(0, Math.ceil(seconds - elapsed));
    setRemaining(left);
    if (left <= 0 && intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [seconds]);

  useEffect(() => {
    tick();
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    tick();
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(tick, 1000);
  }, [tick]);

  return { remaining, start, active: remaining > 0 };
}
