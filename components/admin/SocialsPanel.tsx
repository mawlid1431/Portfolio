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

type Draft = { label: string; href: string; sortOrder: number };
const empty: Draft = { label: "", href: "", sortOrder: 0 };

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
  const [open, setOpen] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenHash) return;
    if (editingId) {
      await update({ tokenHash, socialId: editingId, ...draft });
    } else {
      await create({ tokenHash, ...draft });
    }
    setDraft(empty);
    setEditingId(null);
    setOpen(false);
  };

  if (!tokenHash || items === undefined) {
    return <p className="text-sm text-cream-dim">Loading social links…</p>;
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
          Add link
        </button>
      </div>

      {open && (
        <form onSubmit={onSubmit} className={`${cardClass} flex flex-col gap-4`}>
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

      <div className="flex flex-col gap-3 md:hidden">
        {items.map((s) => (
          <div
            key={s._id}
            className="rounded-2xl border border-cream/10 bg-ink-soft/70 p-4"
          >
            <p className="font-medium">{s.label}</p>
            <a
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all text-sm text-cream-dim hover:text-emerald-bright"
            >
              {s.href}
            </a>
            <p className="mt-2 text-xs text-cream-dim">Order: {s.sortOrder}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className={btnGhost}
                onClick={() => {
                  setEditingId(s._id);
                  setDraft({
                    label: s.label,
                    href: s.href,
                    sortOrder: s.sortOrder,
                  });
                  setOpen(true);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className={btnDanger}
                onClick={() => void remove({ tokenHash, socialId: s._id })}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-cream/10 bg-ink-soft/70 md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-cream/10 text-xs uppercase tracking-[0.2em] text-cream-dim">
              <th className="p-4">Platform</th>
              <th className="p-4">URL</th>
              <th className="p-4">Order</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s._id} className="border-b border-cream/5 hover:bg-cream/5">
                <td className="p-4 font-medium">{s.label}</td>
                <td className="p-4 text-cream-dim">
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-bright"
                  >
                    {s.href}
                  </a>
                </td>
                <td className="p-4 text-cream-dim">{s.sortOrder}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => {
                        setEditingId(s._id);
                        setDraft({
                          label: s.label,
                          href: s.href,
                          sortOrder: s.sortOrder,
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
                        void remove({ tokenHash, socialId: s._id })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
