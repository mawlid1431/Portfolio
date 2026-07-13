"use client";

import { btnDanger, btnGhost } from "@/lib/admin-hooks";

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
        <button type="button" className={btnGhost} onClick={onView}>
          View
        </button>
      )}
      {onEdit && (
        <button type="button" className={btnGhost} onClick={onEdit}>
          Edit
        </button>
      )}
      {onDelete && (
        <button type="button" className={btnDanger} onClick={onDelete}>
          {deleteLabel}
        </button>
      )}
    </div>
  );
}
