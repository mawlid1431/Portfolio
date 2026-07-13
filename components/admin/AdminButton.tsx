"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AdminButtonVariant = "primary" | "muted" | "simple";

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50";

export const adminButtonVariants: Record<AdminButtonVariant, string> = {
  primary:
    "border-secondary bg-secondary text-black font-semibold hover:bg-secondary/90",
  muted:
    "border-[var(--border-subtle)] bg-[var(--input-bg)] text-[var(--admin-text)] hover:bg-[var(--admin-hover-bg)]",
  simple:
    "border-transparent bg-transparent text-[var(--admin-text-dim)] hover:border-secondary/40 hover:text-secondary",
};

export function adminButtonClass(
  variant: AdminButtonVariant = "muted",
  extra?: string,
) {
  return cn(baseClass, adminButtonVariants[variant], extra);
}

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant;
  children: ReactNode;
};

export default function AdminButton({
  variant = "muted",
  className,
  children,
  type = "button",
  ...rest
}: AdminButtonProps) {
  return (
    <button
      type={type}
      className={adminButtonClass(variant, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
