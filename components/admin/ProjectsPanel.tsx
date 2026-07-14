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
  pitch: string;
  year: number;
  imagePath: string;
  liveUrl: string;
};

type ProjectItem = NonNullable<
  ReturnType<typeof useQuery<typeof api.projects.list>>
>[number];

type ModalMode = "closed" | "create" | "edit" | "view";

const empty: Draft = {
  title: "",
  pitch: "",
  year: new Date().getFullYear(),
  imagePath: "",
  liveUrl: "",
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
      pitch: project.pitch,
      year: project.year,
      imagePath: project.imagePath,
      liveUrl: project.liveUrl ?? "",
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

    if (!draft.imagePath.trim()) {
      setError("Please upload a project image first.");
      return;
    }

    await run(async () => {
      const payload = {
        title: draft.title,
        pitch: draft.pitch,
        year: draft.year,
        imagePath: draft.imagePath.trim(),
        liveUrl: draft.liveUrl.trim() || undefined,
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
        description={isReadOnly ? viewItem?.title : undefined}
        size="md"
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
                className="max-h-64 w-full object-cover"
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
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="card-surface-inner p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-faint)]">
                  Title
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-[var(--admin-text)]">
                  {viewItem.title}
                </p>
              </div>
              <div className="card-surface-inner p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-faint)]">
                  Year
                </p>
                <p className="mt-1 text-sm text-[var(--admin-text)]">
                  {viewItem.year}
                </p>
              </div>
              <div className="card-surface-inner p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-faint)]">
                  Live link
                </p>
                {viewItem.liveUrl ? (
                  <a
                    href={viewItem.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block truncate text-sm font-medium text-secondary hover:underline"
                  >
                    {viewItem.liveUrl}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-[var(--admin-text-dim)]">—</p>
                )}
              </div>
            </div>

            <p className="whitespace-pre-wrap text-sm text-[var(--admin-text-dim)]">
              {viewItem.pitch}
            </p>
          </div>
        ) : isFormOpen ? (
          <form
            id="project-form"
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
          >
            <div>
              <label className={labelClass}>Project image</label>
              <CloudinaryUpload
                folder="devmalitos/projects"
                value={draft.imagePath}
                label="Upload project image"
                onUploaded={(publicId) =>
                  setDraft({ ...draft, imagePath: publicId })
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  className={inputClass}
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
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
              <div>
                <label className={labelClass}>Live link</label>
                <input
                  type="url"
                  className={inputClass}
                  placeholder="https://… (optional)"
                  value={draft.liveUrl}
                  onChange={(e) =>
                    setDraft({ ...draft, liveUrl: e.target.value })
                  }
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
            {error && <p className="text-xs text-red-400">{error}</p>}
          </form>
        ) : null}
      </AdminModal>

      <AdminDeleteConfirmModal
        open={deleteTarget !== null}
        entityName="project"
        targetLabel={deleteTarget?.title ?? ""}
        detail={
          deleteTarget ? `${deleteTarget.year} · ${deleteTarget.status}` : undefined
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
            meta={String(p.year)}
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
