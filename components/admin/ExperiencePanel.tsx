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

type Draft = {
  role: string;
  org: string;
  period: string;
  text: string;
  sortOrder: number;
};

const empty: Draft = {
  role: "",
  org: "",
  period: "",
  text: "",
  sortOrder: 0,
};

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
  const [open, setOpen] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenHash) return;
    if (editingId) {
      await update({ tokenHash, experienceId: editingId, ...draft });
    } else {
      await create({ tokenHash, ...draft });
    }
    setDraft(empty);
    setEditingId(null);
    setOpen(false);
  };

  if (!tokenHash || items === undefined) {
    return <p className="text-sm text-cream-dim">Loading experience…</p>;
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
          Add experience
        </button>
      </div>

      {open && (
        <form onSubmit={onSubmit} className={`${cardClass} flex flex-col gap-4`}>
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
        {items.map((e) => (
          <div key={e._id} className={cardClass}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium">{e.role}</p>
                <p className="text-sm text-emerald-bright">{e.org}</p>
                <p className="mt-1 text-xs text-cream-dim">{e.period}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => {
                    setEditingId(e._id);
                    setDraft({
                      role: e.role,
                      org: e.org,
                      period: e.period,
                      text: e.text,
                      sortOrder: e.sortOrder,
                    });
                    setOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={btnDanger}
                  onClick={() =>
                    void remove({ tokenHash, experienceId: e._id })
                  }
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-4 text-sm text-cream-dim">{e.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
