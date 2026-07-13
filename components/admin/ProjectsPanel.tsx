"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import AdminModal from "./AdminModal";
import AdminButton from "./AdminButton";
import AdminDeleteConfirmModal from "./AdminDeleteConfirmModal";
import AdminEntityCard, {
  adminGridClass,
  featuredBadgeClass,
} from "./AdminEntityCard";
import CloudinaryUpload from "./CloudinaryUpload";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { inputClass, labelClass, useAdminTokenHash } from "@/lib/admin-hooks";
import { useSubmitLock } from "@/lib/useSubmitLock";

type Draft = {
  title: string;
  slug: string;
  pitch: string;
  tag: string;
  year: number;
  imagePath: string;
  hasLiveSite: boolean;
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
  hasLiveSite: false,
  liveUrl: "",
  featured: false,
  status: "live",
};

function InnerField({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface-inner p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-faint)]">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[var(--admin-text)]">
        {value}
      </p>
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
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [deleting, setDeleting] = useState(false);
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
      hasLiveSite: Boolean(project.liveUrl),
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

  const confirmDelete = async () => {
    if (!tokenHash || !deleteTarget) return;
    setDeleting(true);
    try {
      await remove({ tokenHash, projectId: deleteTarget._id });
      setDeleteTarget(null);
      if (viewItem?._id === deleteTarget._id) closeModal();
    } finally {
      setDeleting(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenHash) return;
    setError("");

    await run(async () => {
      // hasLiveSite is UI-only state — it must not reach the Convex validators
      const { hasLiveSite, ...fields } = draft;
      const payload = {
        ...fields,
        liveUrl: hasLiveSite ? draft.liveUrl.trim() || undefined : undefined,
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
    return (
      <p className="text-sm text-[var(--admin-text-dim)]">Loading projects…</p>
    );
  }

  const isFormOpen = modalMode === "create" || modalMode === "edit";
  const isReadOnly = modalMode === "view";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <AdminButton variant="primary" onClick={openCreate}>
          Add project
        </AdminButton>
      </div>

      <AdminModal
        open={modalMode !== "closed"}
        onClose={closeModal}
        title={
          modalMode === "create"
            ? "Add project"
            : modalMode === "edit"
              ? "Edit project"
              : "Project details"
        }
        description={
          isReadOnly
            ? viewItem?.title
            : "Fill in the details below and save to update your portfolio."
        }
        size="lg"
        footer={
          isReadOnly && viewItem ? (
            <>
              <AdminButton variant="muted" onClick={closeModal}>
                Close
              </AdminButton>
              <AdminButton variant="simple" onClick={() => openEdit(viewItem)}>
                Edit
              </AdminButton>
              <AdminButton
                variant="muted"
                className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                onClick={() => setDeleteTarget(viewItem)}
              >
                Delete
              </AdminButton>
            </>
          ) : isFormOpen ? (
            <>
              <AdminButton variant="muted" onClick={closeModal}>
                Cancel
              </AdminButton>
              <AdminButton
                variant="primary"
                type="submit"
                form="project-form"
                disabled={loading}
              >
                {loading ? "Saving…" : "Save project"}
              </AdminButton>
            </>
          ) : undefined
        }
      >
        {isReadOnly && viewItem ? (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cloudinaryUrl(viewItem.imagePath, { width: 1200 })}
                alt={viewItem.title}
                className="max-h-72 w-full object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {viewItem.featured && (
                <span className={featuredBadgeClass}>Featured</span>
              )}
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  viewItem.status === "live"
                    ? "border-secondary/40 bg-secondary/15 text-secondary"
                    : "border-[var(--border-subtle)] text-[var(--admin-text-dim)]"
                }`}
              >
                {viewItem.status}
              </span>
              <p className="text-sm text-[var(--admin-text-dim)]">
                {viewItem.tag} · {viewItem.year}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[var(--admin-text)]">
                {viewItem.title}
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--admin-text-dim)]">
                {viewItem.pitch}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InnerField label="Slug" value={viewItem.slug} />
              <InnerField label="Image path" value={viewItem.imagePath} />
            </div>

            {viewItem.liveUrl && (
              <a
                href={viewItem.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-sm font-medium text-secondary hover:underline"
              >
                View live project →
              </a>
            )}
          </div>
        ) : isFormOpen ? (
          <form
            id="project-form"
            onSubmit={onSubmit}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="md:col-span-2">
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
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                className={inputClass}
                rows={3}
                value={draft.pitch}
                onChange={(e) => setDraft({ ...draft, pitch: e.target.value })}
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
            <div>
              <label className={labelClass}>Category</label>
              <input
                className={inputClass}
                value={draft.tag}
                onChange={(e) => setDraft({ ...draft, tag: e.target.value })}
                required
              />
            </div>
            <div className="md:col-span-2 flex flex-col gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--input-bg)] p-4">
              <label className="flex items-center gap-2 text-sm text-[var(--admin-text-dim)]">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--secondary)]"
                  checked={draft.hasLiveSite}
                  onChange={(e) =>
                    setDraft({ ...draft, hasLiveSite: e.target.checked })
                  }
                />
                This project has a live website.
              </label>
              {draft.hasLiveSite && (
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
                    required
                  />
                </div>
              )}
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
            <label className="flex items-end gap-2 pb-3 text-sm text-[var(--admin-text-dim)]">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--secondary)]"
                checked={draft.featured}
                onChange={(e) =>
                  setDraft({ ...draft, featured: e.target.checked })
                }
              />
              Featured
            </label>
            {error && (
              <p className="md:col-span-2 text-xs text-red-400">{error}</p>
            )}
          </form>
        ) : null}
      </AdminModal>

      <AdminDeleteConfirmModal
        open={deleteTarget !== null}
        entityName="project"
        targetLabel={deleteTarget?.title ?? ""}
        detail={
          deleteTarget
            ? `${deleteTarget.tag} · ${deleteTarget.year} · ${deleteTarget.status}`
            : undefined
        }
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />

      <div className={adminGridClass}>
        {projects.map((p) => (
          <AdminEntityCard
            key={p._id}
            title={p.title}
            meta={`${p.tag} · ${p.year}`}
            badge={
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    p.status === "live"
                      ? "border-secondary/40 bg-secondary/15 text-secondary"
                      : "border-[var(--border-subtle)] text-[var(--admin-text-dim)]"
                  }`}
                >
                  {p.status}
                </span>
                {p.featured && (
                  <span className={featuredBadgeClass}>Featured</span>
                )}
              </span>
            }
            media={
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cloudinaryUrl(p.imagePath, { width: 640 })}
                alt={p.title}
                className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            }
            onView={() => openView(p)}
            onEdit={() => openEdit(p)}
            onDelete={() => setDeleteTarget(p)}
          >
            {p.pitch}
          </AdminEntityCard>
        ))}
      </div>
    </div>
  );
}
