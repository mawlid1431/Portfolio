"use client";

import { IconEye, IconPencil, IconTrash } from "./AdminIcons";
import { cn } from "@/lib/cn";

const iconBtnBase =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition duration-200 disabled:cursor-not-allowed disabled:opacity-50";

type AdminRowActionsProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
};

export default function AdminRowActions({
  onView,
  onEdit,
  onDelete,
  deleteLabel = "Delete",
}: AdminRowActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {onView && (
        <button
          type="button"
          title="View"
          aria-label="View"
          onClick={onView}
          className={cn(
            iconBtnBase,
            "border-secondary bg-secondary text-black hover:bg-secondary/90",
          )}
        >
          <IconEye className="h-4 w-4" />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          title="Edit"
          aria-label="Edit"
          onClick={onEdit}
          className={cn(
            iconBtnBase,
            "border-[var(--border-subtle)] bg-transparent text-[var(--admin-text-dim)] hover:border-secondary/40 hover:text-secondary",
          )}
        >
          <IconPencil className="h-4 w-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          title={deleteLabel}
          aria-label={deleteLabel}
          onClick={onDelete}
          className={cn(
            iconBtnBase,
            "border-[var(--border-subtle)] bg-[var(--input-bg)] text-[var(--admin-text-dim)] hover:border-red-500/40 hover:text-red-400",
          )}
        >
          <IconTrash className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
