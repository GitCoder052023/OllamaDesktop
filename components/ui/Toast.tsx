"use client";

import React from "react";
import { useChat } from "@/context/ChatContext";
import { Check, Info, AlertCircle, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, dismissToast } = useChat();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] macos-vibrancy text-[13px] font-medium leading-tight border transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? "bg-white/80 dark:bg-[#2C2C2E]/90 text-[var(--text-primary)] border-emerald-500/20 shadow-[var(--shadow-md)]"
                : isError
                ? "bg-white/80 dark:bg-[#2C2C2E]/90 text-[var(--text-primary)] border-red-500/30 shadow-[var(--shadow-md)]"
                : "bg-white/80 dark:bg-[#2C2C2E]/90 text-[var(--text-primary)] border-[var(--border)] shadow-[var(--shadow-md)]"
            }`}
          >
            {isSuccess && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </span>
            )}
            {isError && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
                <AlertCircle className="w-3 h-3 stroke-[2.5]" />
              </span>
            )}
            {!isSuccess && !isError && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                <Info className="w-3 h-3 stroke-[2.5]" />
              </span>
            )}

            <span className="max-w-[320px] truncate">{toast.message}</span>

            <button
              onClick={() => dismissToast(toast.id)}
              className="ml-1 p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
