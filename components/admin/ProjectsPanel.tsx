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
import { useSubmitLock } from "@/lib/useSubmitLock";
import CloudinaryUpload from "./CloudinaryUpload";

type Draft = {
  title: string;
  slug: string;
  pitch: string;
  tag: string;
  year: number;
  imagePath: string;
  liveUrl: string;
  featured: boolean;
  status: "live" | "draft";
};

const empty: Draft = {
  title: "",
  slug: "",
  pitch: "",
  tag: "",
  year: new Date().getFullYear(),
  imagePath: "",
  liveUrl: "",
  featured: false,
  status: "live",
};

export default function ProjectsPanel() {
  const tokenHash = useAdminTokenHash();
  const projects = useQuery(
    api.projects.list,
    tokenHash ? { tokenHash } : "skip",
  );
  const create = useMutation(api.projects.create);
  const update = useMutation(api.projects.update);
  const remove = useMutation(api.projects.remove);

  const [draft, setDraft] = useState<Draft>(empty);
  const [editingId, setEditingId] = useState<Id<"projects"> | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const { loading, run } = useSubmitLock();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenHash) return;
    setError("");

    await run(async () => {
      const payload = {
        ...draft,
        liveUrl: draft.liveUrl.trim() || undefined,
        imagePath:
          draft.imagePath.trim() ||
          `devmalitos/projects/${draft.slug.trim().toLowerCase()}`,
      };

      if (editingId) {
        await update({ tokenHash, projectId: editingId, ...payload });
      } else {
        await create({
          tokenHash,
          ...payload,
          idempotencyKey: crypto.randomUUID(),
        });
      }
      setDraft(empty);
      setEditingId(null);
      setOpen(false);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to save project");
    });
  };

  const startEdit = (p: NonNullable<typeof projects>[number]) => {
    setEditingId(p._id);
    setDraft({
      title: p.title,
      slug: p.slug,
      pitch: p.pitch,
      tag: p.tag,
      year: p.year,
      imagePath: p.imagePath,
      liveUrl: p.liveUrl ?? "",
      featured: p.featured,
      status: p.status,
    });
    setOpen(true);
  };

  if (!tokenHash || projects === undefined) {
    return <p className="text-sm text-cream-dim">Loading projects…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button
          type="button"
          className={btnPrimary}
          onClick={() => {
            setEditingId(null);
            setDraft(empty);
            setOpen(true);
          }}
        >
          Add project
        </button>
      </div>

      {open && (
        <form onSubmit={onSubmit} className={`${cardClass} flex flex-col gap-4`}>
          <h2 className="text-xs uppercase tracking-[0.3em] text-emerald-bright">
            {editingId ? "Edit project" : "New project"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Title</label>
              <input
                className={inputClass}
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input
                className={inputClass}
                value={draft.slug}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    slug: e.target.value,
                    imagePath:
                      draft.imagePath ||
                      `devmalitos/projects/${e.target.value.trim().toLowerCase()}`,
                  })
                }
                required
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Short description</label>
            <textarea
              className={inputClass}
              rows={3}
              value={draft.pitch}
              onChange={(e) => setDraft({ ...draft, pitch: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Year</label>
              <input
                type="number"
                min={2000}
                max={2100}
                className={inputClass}
                value={draft.year}
                onChange={(e) =>
                  setDraft({ ...draft, year: Number(e.target.value) })
                }
                required
              />
            </div>
            <div>
              <label className={labelClass}>Live site URL</label>
              <input
                type="url"
                className={inputClass}
                placeholder="https://example.com"
                value={draft.liveUrl}
                onChange={(e) =>
                  setDraft({ ...draft, liveUrl: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Project image</label>
            <CloudinaryUpload
              folder="devmalitos/projects"
              publicId={draft.slug.trim().toLowerCase() || undefined}
              value={draft.imagePath}
              label="Upload project image"
              onUploaded={(publicId) =>
                setDraft({ ...draft, imagePath: publicId })
              }
            />
            <input
              className={`${inputClass} mt-3`}
              placeholder="devmalitos/projects/my-project"
              value={draft.imagePath}
              onChange={(e) =>
                setDraft({ ...draft, imagePath: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className={labelClass}>Category</label>
              <input
                className={inputClass}
                value={draft.tag}
                onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                className={inputClass}
                value={draft.status}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    status: e.target.value as "live" | "draft",
                  })
                }
              >
                <option value="live">Live</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <label className="flex items-end gap-2 pb-3 text-sm text-cream-dim">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(e) =>
                  setDraft({ ...draft, featured: e.target.checked })
                }
              />
              Featured
            </label>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" className={btnPrimary} disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className={btnGhost}
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3 md:hidden">
        {projects.map((p) => (
          <div
            key={p._id}
            className="rounded-2xl border border-cream/10 bg-ink-soft/70 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="mt-1 text-xs text-cream-dim">
                  {p.year} · {p.tag}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                  p.status === "live"
                    ? "bg-emerald-glow/15 text-emerald-bright"
                    : "bg-cream/10 text-cream-dim"
                }`}
              >
                {p.status}
              </span>
            </div>
            {p.featured && (
              <p className="mt-2 text-xs text-emerald-bright">★ Featured</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className={btnGhost}
                onClick={() => startEdit(p)}
              >
                Edit
              </button>
              <button
                type="button"
                className={btnDanger}
                onClick={() => void remove({ tokenHash, projectId: p._id })}
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
              <th className="p-4">Project</th>
              <th className="p-4">Year</th>
              <th className="p-4">Category</th>
              <th className="p-4">Status</th>
              <th className="p-4">Featured</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr
                key={p._id}
                className="border-b border-cream/5 transition-colors hover:bg-cream/5"
              >
                <td className="p-4 font-medium">{p.title}</td>
                <td className="p-4 text-cream-dim">{p.year}</td>
                <td className="p-4 text-cream-dim">{p.tag}</td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      p.status === "live"
                        ? "bg-emerald-glow/15 text-emerald-bright"
                        : "bg-cream/10 text-cream-dim"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="p-4 text-cream-dim">{p.featured ? "★" : "—"}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={btnDanger}
                      onClick={() =>
                        void remove({ tokenHash, projectId: p._id })
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
