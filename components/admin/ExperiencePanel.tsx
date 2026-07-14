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

type Draft = {
  role: string;
  org: string;
  period: string;
  text: string;
  sortOrder: number;
};

type ExperienceItem = NonNullable<
  ReturnType<typeof useQuery<typeof api.experiences.list>>
>[number];

type ModalMode = "closed" | "create" | "edit" | "view";

const empty: Draft = {
  role: "",
  org: "",
  period: "",
  text: "",
  sortOrder: 0,
};

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-cream">{value}</p>
    </div>
  );
}

export default function ExperiencePanel() {
  const tokenHash = useAdminTokenHash();
  const items = useQuery(
    api.experiences.list,
    tokenHash ? { tokenHash } : "skip",
  );
  const create = useMutation(api.experiences.create);
  const update = useMutation(api.experiences.update);
  const remove = useMutation(api.experiences.remove);

  const [draft, setDraft] = useState<Draft>(empty);
  const [editingId, setEditingId] = useState<Id<"experiences"> | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [viewItem, setViewItem] = useState<ExperienceItem | null>(null);

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

  const openEdit = (item: ExperienceItem) => {
    setEditingId(item._id);
    setViewItem(null);
    setDraft({
      role: item.role,
      org: item.org,
      period: item.period,
      text: item.text,
      sortOrder: item.sortOrder,
    });
    setModalMode("edit");
  };

  const openView = (item: ExperienceItem) => {
    setViewItem(item);
    setModalMode("view");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenHash) return;
    if (editingId) {
      await update({ tokenHash, experienceId: editingId, ...draft });
    } else {
      await create({ tokenHash, ...draft });
    }
    closeModal();
  };

  if (!tokenHash || items === undefined) {
    return <p className="text-sm text-cream-dim">Loading experience…</p>;
  }

  const isFormOpen = modalMode === "create" || modalMode === "edit";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button type="button" className={btnPrimary} onClick={openCreate}>
          Add experience
        </button>
      </div>

      <AdminModal
        open={modalMode !== "closed"}
        onClose={closeModal}
        title={
          modalMode === "create"
            ? "New experience"
            : modalMode === "edit"
              ? "Edit experience"
              : "Experience details"
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
              <button type="submit" form="experience-form" className={btnPrimary}>
                Save
              </button>
            </>
          ) : undefined
        }
      >
        {modalMode === "view" && viewItem ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <ViewField label="Role" value={viewItem.role} />
            <ViewField label="Organization" value={viewItem.org} />
            <ViewField label="Period" value={viewItem.period} />
            <ViewField label="Sort order" value={String(viewItem.sortOrder)} />
            <div className="sm:col-span-2">
              <ViewField label="Description" value={viewItem.text} />
            </div>
          </div>
        ) : isFormOpen ? (
          <form
            id="experience-form"
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Role</label>
                <input
                  className={inputClass}
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Organization</label>
                <input
                  className={inputClass}
                  value={draft.org}
                  onChange={(e) => setDraft({ ...draft, org: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>Period</label>
                <input
                  className={inputClass}
                  value={draft.period}
                  onChange={(e) => setDraft({ ...draft, period: e.target.value })}
                  required
                />
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
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={inputClass}
                rows={4}
                value={draft.text}
                onChange={(e) => setDraft({ ...draft, text: e.target.value })}
                required
              />
            </div>
          </form>
        ) : null}
      </AdminModal>

      <div className={adminGridClass}>
        {items.map((e) => (
          <AdminEntityCard
            key={e._id}
            title={e.role}
            subtitle={e.org}
            meta={e.period}
            onView={() => openView(e)}
            onEdit={() => openEdit(e)}
            onDelete={() => void remove({ tokenHash, experienceId: e._id })}
          >
            {e.text}
          </AdminEntityCard>
        ))}
      </div>
    </div>
  );
}
