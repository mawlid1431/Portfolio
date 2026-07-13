"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import AdminRowActions from "./AdminRowActions";
import { cn } from "@/lib/cn";

export const adminGridClass =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export const adminCardClass =
  "card-surface card-surface-interactive group flex h-full flex-col overflow-hidden p-4";

export const featuredBadgeClass =
  "inline-flex items-center rounded-full border border-secondary/40 bg-secondary/15 px-2.5 py-0.5 text-xs font-medium text-secondary";

type AdminEntityCardProps = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  badge?: ReactNode;
  children?: ReactNode;
  media?: ReactNode;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
};

export default function AdminEntityCard({
  title,
  subtitle,
  meta,
  badge,
  children,
  media,
  onView,
  onEdit,
  onDelete,
  className,
}: AdminEntityCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className={cn(adminCardClass, className)}
    >
      {media && (
        <button
          type="button"
          onClick={onView}
          className="mb-4 block w-full overflow-hidden rounded-lg border border-[var(--border-subtle)] text-left"
          disabled={!onView}
        >
          {media}
        </button>
      )}

      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={onView}
          className="min-w-0 flex-1 text-left"
          disabled={!onView}
        >
          <h3 className="line-clamp-2 font-semibold text-[var(--admin-text)] transition-colors group-hover:text-secondary">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 truncate text-sm text-secondary/90">
              {subtitle}
            </p>
          )}
          {meta && (
            <div className="mt-1.5 text-xs text-[var(--admin-text-faint)]">
              {meta}
            </div>
          )}
        </button>
        {badge}
      </div>

      {children && (
        <div className="mt-3 line-clamp-3 flex-1 text-sm text-[var(--admin-text-dim)]">
          {children}
        </div>
      )}

      <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
        <AdminRowActions onView={onView} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </motion.article>
  );
}
