"use client";

import { useCallback, useState } from "react";

type ToastType = "success" | "error";
type ToastItem = { id: number; type: ToastType; message: string };

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.type === "success" ? "bg-black text-white" : "bg-red-600 text-white"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Cerrar notificación"
            className="text-white/60 transition-colors hover:text-white"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
