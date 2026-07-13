"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import AdminModal from "./AdminModal";
import AdminRowActions from "./AdminRowActions";
import CloudinaryUpload from "./CloudinaryUpload";
import {
  btnGhost,
  btnPrimary,
  cardClass,
  inputClass,
  labelClass,
  useAdminTokenHash,
} from "@/lib/admin-hooks";
import { useSubmitLock } from "@/lib/useSubmitLock";

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

type ProjectItem = NonNullable<
  ReturnType<typeof useQuery<typeof api.projects.list>>
>[number];

type ModalMode = "closed" | "create" | "edit" | "view";

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

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-cream">{value}</p>
    </div>
  );
}

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
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [viewItem, setViewItem] = useState<ProjectItem | null>(null);
  const [error, setError] = useState("");
  const { loading, run } = useSubmitLock();

  const closeModal = () => {
    setModalMode("closed");
    setEditingId(null);
    setViewItem(null);
    setDraft(empty);
    setError("");
  };

  const openCreate = () => {
    setEditingId(null);
    setViewItem(null);
    setDraft(empty);
    setModalMode("create");
  };

  const openEdit = (project: ProjectItem) => {
    setEditingId(project._id);
    setViewItem(null);
    setDraft({
      title: project.title,
      slug: project.slug,
      pitch: project.pitch,
      tag: project.tag,
      year: project.year,
      imagePath: project.imagePath,
      liveUrl: project.liveUrl ?? "",
      featured: project.featured,
      status: project.status,
    });
    setModalMode("edit");
  };

  const openView = (project: ProjectItem) => {
    setViewItem(project);
    setModalMode("view");
  };

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
      closeModal();
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to save project");
    });
  };

  if (!tokenHash || projects === undefined) {
    return <p className="text-sm text-cream-dim">Loading projects…</p>;
  }

  const isFormOpen = modalMode === "create" || modalMode === "edit";
  const isReadOnly = modalMode === "view";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button type="button" className={btnPrimary} onClick={openCreate}>
          Add project
        </button>
      </div>

      <AdminModal
        open={modalMode !== "closed"}
        onClose={closeModal}
        title={
          modalMode === "create"
            ? "New project"
            : modalMode === "edit"
              ? "Edit project"
              : "Project details"
        }
        description={
          isReadOnly
            ? "Review project information before editing."
            : "Fill in the details below and save to update your portfolio."
        }
        size="xl"
        footer={
          isReadOnly ? (
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
              <button
                type="submit"
                form="project-form"
                className={btnPrimary}
                disabled={loading}
              >
                {loading ? "Saving…" : "Save project"}
              </button>
            </>
          ) : undefined
        }
      >
        {isReadOnly && viewItem ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <ViewField label="Title" value={viewItem.title} />
            <ViewField label="Slug" value={viewItem.slug} />
            <ViewField label="Year" value={String(viewItem.year)} />
            <ViewField label="Category" value={viewItem.tag} />
            <ViewField label="Status" value={viewItem.status} />
            <ViewField
              label="Featured"
              value={viewItem.featured ? "Yes" : "No"}
            />
            <ViewField label="Image path" value={viewItem.imagePath} />
            <ViewField label="Live URL" value={viewItem.liveUrl ?? "—"} />
            <div className="sm:col-span-2">
              <ViewField label="Description" value={viewItem.pitch} />
            </div>
          </div>
        ) : isFormOpen ? (
          <form id="project-form" onSubmit={onSubmit} className="flex flex-col gap-4">
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
          </form>
        ) : null}
      </AdminModal>

      <div className="grid gap-3 lg:hidden">
        {projects.map((p) => (
          <div key={p._id} className={cardClass}>
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
            <div className="mt-4">
              <AdminRowActions
                onView={() => openView(p)}
                onEdit={() => openEdit(p)}
                onDelete={() => void remove({ tokenHash, projectId: p._id })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-cream/10 bg-ink-soft/70 lg:block">
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
                  <AdminRowActions
                    onView={() => openView(p)}
                    onEdit={() => openEdit(p)}
                    onDelete={() => void remove({ tokenHash, projectId: p._id })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
