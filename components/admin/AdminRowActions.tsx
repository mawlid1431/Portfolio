"use client";

import { glassButtonClasses } from "@/lib/glass-button-classes";

const actionGhost = glassButtonClasses({ variant: "ghost", size: "sm" });
const actionDanger = glassButtonClasses({ variant: "danger", size: "sm" });

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
        <button type="button" className={actionGhost} onClick={onView}>
          View
        </button>
      )}
      {onEdit && (
        <button type="button" className={actionGhost} onClick={onEdit}>
          Edit
        </button>
      )}
      {onDelete && (
        <button type="button" className={actionDanger} onClick={onDelete}>
          {deleteLabel}
        </button>
      )}
    </div>
  );
}
