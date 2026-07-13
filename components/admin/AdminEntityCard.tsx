"use client";

import type { ReactNode } from "react";
import AdminRowActions from "./AdminRowActions";
import { cn } from "@/lib/cn";

export const adminGridClass =
  "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export const adminCardClass =
  "group flex h-full flex-col rounded-2xl border border-cream/10 bg-ink-soft/70 p-5 transition-colors hover:border-emerald-glow/35";

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
    <article className={cn(adminCardClass, className)}>
      {media && (
        <button
          type="button"
          onClick={onView}
          className="mb-4 block w-full overflow-hidden rounded-xl text-left"
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
          <h3 className="truncate font-medium text-cream transition-colors group-hover:text-emerald-bright">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 truncate text-sm text-emerald-bright/90">
              {subtitle}
            </p>
          )}
          {meta && (
            <div className="mt-2 text-xs uppercase tracking-[0.12em] text-cream-dim">
              {meta}
            </div>
          )}
        </button>
        {badge}
      </div>

      {children && (
        <div className="mt-3 line-clamp-3 flex-1 text-sm text-cream-dim">
          {children}
        </div>
      )}

      <div className="mt-4 border-t border-cream/10 pt-4">
        <AdminRowActions
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}
