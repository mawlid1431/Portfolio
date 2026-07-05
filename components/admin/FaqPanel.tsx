"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  btnDanger,
  btnGhost,
  btnPrimary,
  cardClass,
  inputClass,
  labelClass,
  useAdminTokenHash,
} from "@/lib/admin-hooks";

type Draft = { question: string; answer: string; sortOrder: number };
const empty: Draft = { question: "", answer: "", sortOrder: 0 };

export default function FaqPanel() {
  const tokenHash = useAdminTokenHash();
  const items = useQuery(api.faqs.list, tokenHash ? { tokenHash } : "skip");
  const create = useMutation(api.faqs.create);
  const update = useMutation(api.faqs.update);
  const remove = useMutation(api.faqs.remove);

  const [draft, setDraft] = useState<Draft>(empty);
  const [editingId, setEditingId] = useState<Id<"faqs"> | null>(null);
  const [open, setOpen] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenHash) return;
    if (editingId) {
      await update({ tokenHash, faqId: editingId, ...draft });
    } else {
      await create({ tokenHash, ...draft });
    }
    setDraft(empty);
    setEditingId(null);
    setOpen(false);
  };

  if (!tokenHash || items === undefined) {
    return <p className="text-sm text-cream-dim">Loading FAQ…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button
          type="button"
          className={btnPrimary}
          onClick={() => {
            setEditingId(null);
            setDraft({ ...empty, sortOrder: items.length });
            setOpen(true);
          }}
        >
          Add FAQ
        </button>
      </div>

      {open && (
        <form onSubmit={onSubmit} className={`${cardClass} flex flex-col gap-4`}>
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
          <div className="flex gap-3">
            <button type="submit" className={btnPrimary}>
              Save
            </button>
            <button type="button" className={btnGhost} onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {items.map((f) => (
          <div key={f._id} className={cardClass}>
            <p className="font-medium">{f.question}</p>
            <p className="mt-3 text-sm text-cream-dim">{f.answer}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className={btnGhost}
                onClick={() => {
                  setEditingId(f._id);
                  setDraft({
                    question: f.question,
                    answer: f.answer,
                    sortOrder: f.sortOrder,
                  });
                  setOpen(true);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className={btnDanger}
                onClick={() => void remove({ tokenHash, faqId: f._id })}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
