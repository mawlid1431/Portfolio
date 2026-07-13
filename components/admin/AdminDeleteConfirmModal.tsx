"use client";

import { useState } from "react";
import AdminModal from "./AdminModal";
import AdminButton from "./AdminButton";

type AdminDeleteConfirmModalProps = {
  open: boolean;
  entityName: string;
  targetLabel: string;
  detail?: string;
  deleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function AdminDeleteConfirmModal({
  open,
  entityName,
  targetLabel,
  detail,
  deleting = false,
  onCancel,
  onConfirm,
}: AdminDeleteConfirmModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  const close = () => {
    setConfirmed(false);
    onCancel();
  };

  return (
    <AdminModal
      open={open}
      onClose={close}
      title={`Delete ${entityName}`}
      description="This action cannot be undone."
      size="md"
      footer={
        <>
          <AdminButton variant="muted" onClick={close} disabled={deleting}>
            Cancel
          </AdminButton>
          <AdminButton
            variant="muted"
            className="border-red-500/40 text-red-400 hover:bg-red-500/10"
            disabled={!confirmed || deleting}
            onClick={() => {
              onConfirm();
              setConfirmed(false);
            }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--admin-text-dim)]">
          You are about to permanently delete{" "}
          <span className="font-semibold text-[var(--admin-text)]">
            {targetLabel}
          </span>
          .
        </p>
        {detail && (
          <p className="text-sm text-[var(--admin-text-faint)]">{detail}</p>
        )}
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--admin-text-dim)]">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="h-4 w-4 accent-[var(--secondary)]"
          />
          Yes, I understand and want to delete this permanently.
        </label>
      </div>
    </AdminModal>
  );
}
