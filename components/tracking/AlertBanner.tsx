"use client";

import { AlertTriangle, X } from "lucide-react";

interface AlertBannerProps {
  message: string;
  onDismiss: () => void;
}

export function AlertBanner({ message, onDismiss }: AlertBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200 shadow-lg shadow-black/20 backdrop-blur-sm">
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-yellow-300" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-lg p-1 text-yellow-200/80 transition-all duration-200 hover:bg-yellow-500/10 hover:text-yellow-100"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
