"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import AdminModal from "./AdminModal";
import AdminRowActions from "./AdminRowActions";
import {
  btnGhost,
  btnPrimary,
  cardClass,
  inputClass,
  labelClass,
  useAdminTokenHash,
} from "@/lib/admin-hooks";

type Draft = { question: string; answer: string; sortOrder: number };

type FaqItem = NonNullable<
  ReturnType<typeof useQuery<typeof api.faqs.list>>
>[number];

type ModalMode = "closed" | "create" | "edit" | "view";

const empty: Draft = { question: "", answer: "", sortOrder: 0 };

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-cream">{value}</p>
    </div>
  );
}

export default function FaqPanel() {
  const tokenHash = useAdminTokenHash();
  const items = useQuery(api.faqs.list, tokenHash ? { tokenHash } : "skip");
  const create = useMutation(api.faqs.create);
  const update = useMutation(api.faqs.update);
  const remove = useMutation(api.faqs.remove);

  const [draft, setDraft] = useState<Draft>(empty);
  const [editingId, setEditingId] = useState<Id<"faqs"> | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [viewItem, setViewItem] = useState<FaqItem | null>(null);

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

  const openEdit = (item: FaqItem) => {
    setEditingId(item._id);
    setViewItem(null);
    setDraft({
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
    });
    setModalMode("edit");
  };

  const openView = (item: FaqItem) => {
    setViewItem(item);
    setModalMode("view");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenHash) return;
    if (editingId) {
      await update({ tokenHash, faqId: editingId, ...draft });
    } else {
      await create({ tokenHash, ...draft });
    }
    closeModal();
  };

  if (!tokenHash || items === undefined) {
    return <p className="text-sm text-cream-dim">Loading FAQ…</p>;
  }

  const isFormOpen = modalMode === "create" || modalMode === "edit";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button type="button" className={btnPrimary} onClick={openCreate}>
          Add FAQ
        </button>
      </div>

      <AdminModal
        open={modalMode !== "closed"}
        onClose={closeModal}
        title={
          modalMode === "create"
            ? "New FAQ"
            : modalMode === "edit"
              ? "Edit FAQ"
              : "FAQ details"
        }
        size="lg"
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
              <button type="submit" form="faq-form" className={btnPrimary}>
                Save
              </button>
            </>
          ) : undefined
        }
      >
        {modalMode === "view" && viewItem ? (
          <div className="flex flex-col gap-4">
            <ViewField label="Question" value={viewItem.question} />
            <ViewField label="Answer" value={viewItem.answer} />
            <ViewField label="Sort order" value={String(viewItem.sortOrder)} />
          </div>
        ) : isFormOpen ? (
          <form id="faq-form" onSubmit={onSubmit} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Question</label>
              <input
                className={inputClass}
                value={draft.question}
                onChange={(e) => setDraft({ ...draft, question: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Answer</label>
              <textarea
                className={inputClass}
                rows={4}
                value={draft.answer}
                onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
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
          </form>
        ) : null}
      </AdminModal>

      <div className="flex flex-col gap-4">
        {items.map((f) => (
          <div key={f._id} className={cardClass}>
            <p className="font-medium">{f.question}</p>
            <p className="mt-3 line-clamp-2 text-sm text-cream-dim">{f.answer}</p>
            <div className="mt-4">
              <AdminRowActions
                onView={() => openView(f)}
                onEdit={() => openEdit(f)}
                onDelete={() => void remove({ tokenHash, faqId: f._id })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
