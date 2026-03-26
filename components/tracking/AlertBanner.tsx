"use client";

import { X } from "lucide-react";

interface AlertBannerProps {
  message: string;
  onDismiss: () => void;
}

export function AlertBanner({ message, onDismiss }: AlertBannerProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
      <p>{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-amber-300/60 transition-colors hover:text-amber-300"
        aria-label="Dismiss alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
