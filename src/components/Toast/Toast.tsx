import { useEffect } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import type { ToastMessage } from "@/types";

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const COLORS = {
  success: "border-drip-green/25 text-drip-green",
  error: "border-red-500/25 text-red-400",
  info: "border-drip-blue/25 text-drip-blue",
};

export function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.type];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 4200);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      className={`animate-card-in flex w-full max-w-sm items-start gap-2.5 rounded-xl border bg-ink/90 p-3.5 shadow-lg backdrop-blur-xl ${COLORS[toast.type]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1 text-[13px] leading-snug text-white/85">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss" className="text-white/30 hover:text-white/70">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }: { toasts: ToastMessage[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
