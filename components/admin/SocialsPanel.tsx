"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import AdminModal from "./AdminModal";
import AdminEntityCard, { adminGridClass } from "./AdminEntityCard";
import {
  btnGhost,
  btnPrimary,
  inputClass,
  labelClass,
  useAdminTokenHash,
} from "@/lib/admin-hooks";

type Draft = { label: string; href: string; sortOrder: number };

type SocialItem = NonNullable<
  ReturnType<typeof useQuery<typeof api.socialLinks.list>>
>[number];

type ModalMode = "closed" | "create" | "edit" | "view";

const empty: Draft = { label: "", href: "", sortOrder: 0 };

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className="mt-1 break-all text-sm text-cream">{value}</p>
    </div>
  );
}

export default function SocialsPanel() {
  const tokenHash = useAdminTokenHash();
  const items = useQuery(
    api.socialLinks.list,
    tokenHash ? { tokenHash } : "skip",
  );
  const create = useMutation(api.socialLinks.create);
  const update = useMutation(api.socialLinks.update);
  const remove = useMutation(api.socialLinks.remove);

  const [draft, setDraft] = useState<Draft>(empty);
  const [editingId, setEditingId] = useState<Id<"socialLinks"> | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [viewItem, setViewItem] = useState<SocialItem | null>(null);

  const closeModal = () => {
    setModalMode("closed");
    setEditingId(null);
    setViewItem(null);
    setDraft(empty);
  };

  const openCreate = () => {
    setEditingId(null);
    setViewItem(null);
    setDraft({ ...empty, sortOrder: items?.length ?? 0 });
    setModalMode("create");
  };

  const openEdit = (item: SocialItem) => {
    setEditingId(item._id);
    setViewItem(null);
    setDraft({
      label: item.label,
      href: item.href,
      sortOrder: item.sortOrder,
    });
    setModalMode("edit");
  };

  const openView = (item: SocialItem) => {
    setViewItem(item);
    setModalMode("view");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenHash) return;
    if (editingId) {
      await update({ tokenHash, socialId: editingId, ...draft });
    } else {
      await create({ tokenHash, ...draft });
    }
    closeModal();
  };

  if (!tokenHash || items === undefined) {
    return <p className="text-sm text-cream-dim">Loading social links…</p>;
  }

  const isFormOpen = modalMode === "create" || modalMode === "edit";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button type="button" className={btnPrimary} onClick={openCreate}>
          Add link
        </button>
      </div>

      <AdminModal
        open={modalMode !== "closed"}
        onClose={closeModal}
        title={
          modalMode === "create"
            ? "New social link"
            : modalMode === "edit"
              ? "Edit social link"
              : "Social link details"
        }
        size="md"
        footer={
          modalMode === "view" ? (
            <>
              <button type="button" className={btnGhost} onClick={closeModal}>
                Close
              </button>
              {viewItem && (
                <button
                  type="button"
                  className={btnPrimary}
                  onClick={() => openEdit(viewItem)}
                >
                  Edit
                </button>
              )}
            </>
          ) : isFormOpen ? (
            <>
              <button type="button" className={btnGhost} onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" form="social-form" className={btnPrimary}>
                Save
              </button>
            </>
          ) : undefined
        }
      >
        {modalMode === "view" && viewItem ? (
          <div className="flex flex-col gap-4">
            <ViewField label="Platform" value={viewItem.label} />
            <ViewField label="URL" value={viewItem.href} />
            <ViewField label="Sort order" value={String(viewItem.sortOrder)} />
          </div>
        ) : isFormOpen ? (
          <form id="social-form" onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Platform</label>
                <input
                  className={inputClass}
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  placeholder="GitHub"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>URL</label>
                <input
                  className={inputClass}
                  type="url"
                  value={draft.href}
                  onChange={(e) => setDraft({ ...draft, href: e.target.value })}
                  placeholder="https://"
                  required
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Sort order</label>
              <input
                type="number"
                className={inputClass}
                value={draft.sortOrder}
                onChange={(e) =>
                  setDraft({ ...draft, sortOrder: Number(e.target.value) })
                }
              />
            </div>
          </form>
        ) : null}
      </AdminModal>

      <div className={adminGridClass}>
        {items.map((s) => (
          <AdminEntityCard
            key={s._id}
            title={s.label}
            meta={`Order ${s.sortOrder}`}
            onView={() => openView(s)}
            onEdit={() => openEdit(s)}
            onDelete={() => void remove({ tokenHash, socialId: s._id })}
          >
            {s.href}
          </AdminEntityCard>
        ))}
      </div>
    </div>
  );
}
