"use client";

import AdminButton from "./AdminButton";

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
        <AdminButton variant="primary" onClick={onView}>
          View
        </AdminButton>
      )}
      {onEdit && (
        <AdminButton variant="simple" onClick={onEdit}>
          Edit
        </AdminButton>
      )}
      {onDelete && (
        <AdminButton variant="muted" onClick={onDelete}>
          {deleteLabel}
        </AdminButton>
      )}
    </div>
  );
}
