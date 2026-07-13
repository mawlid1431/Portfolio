"use client";

import { useEffect, type ReactNode } from "react";
import { btnGhost } from "@/lib/admin-hooks";
import { cn } from "@/lib/cn";

type AdminModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: "md" | "lg" | "xl";
  children: ReactNode;
  footer?: ReactNode;
};

const sizeClass = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function AdminModal({
  open,
  onClose,
  title,
  description,
  size = "lg",
  children,
  footer,
}: AdminModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-cream/15 bg-ink-soft shadow-2xl sm:max-h-[88dvh] sm:rounded-2xl",
          sizeClass[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-cream/10 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="admin-modal-title"
              className="font-display text-xl uppercase tracking-wide text-cream sm:text-2xl"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-cream-dim">{description}</p>
            )}
          </div>
          <button
            type="button"
            className={cn(btnGhost, "shrink-0 px-3")}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-cream/10 px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
