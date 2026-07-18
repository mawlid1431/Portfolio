"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  cloudinaryUrl,
  cloudinaryVideoUrl,
  normalizeCloudinaryPath,
} from "@/lib/cloudinary";
import AdminModal from "./AdminModal";
import AdminButton from "./AdminButton";
import AdminDeleteConfirmModal from "./AdminDeleteConfirmModal";
import AdminRowActions from "./AdminRowActions";
import CloudinaryUpload from "./CloudinaryUpload";
import { inputClass, labelClass, useAdminTokenHash } from "@/lib/admin-hooks";

const SECTIONS = [
  {
    key: "hero",
    label: "Hero section",
    description: "Main image on the home page hero.",
  },
  {
    key: "working",
    label: "Working section",
    description: "Image shown in the working/process section.",
  },
  {
    key: "portrait",
    label: "Portrait / work",
    description: "Portrait image used across the work pages.",
  },
  {
    key: "flag",
    label: "About — flag",
    description: "Flag image on the about page.",
  },
  {
    key: "graduation",
    label: "About — graduation",
    description: "Graduation image on the about page.",
  },
  {
    key: "about-showreel",
    label: "About — showreel video",
    description: "Showreel video (MP4) on the about page.",
  },
];

type ImageItem = NonNullable<
  ReturnType<typeof useQuery<typeof api.siteImages.list>>
>[number];

type ModalMode = "closed" | "form" | "view";

function ViewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-surface-inner p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--admin-text-faint)]">
        {label}
      </p>
      <p className="mt-1 break-all text-sm text-[var(--admin-text)]">{value}</p>
    </div>
  );
}

function MediaPreview({
  path,
  isVideo,
  alt,
  className,
}: {
  path: string;
  isVideo: boolean;
  alt: string;
  className: string;
}) {
  return isVideo ? (
    <video
      src={cloudinaryVideoUrl(path)}
      muted
      playsInline
      preload="metadata"
      controls={false}
      className={className}
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={cloudinaryUrl(path, { width: 800 })} alt={alt} className={className} />
  );
}

export default function ImagesPanel() {
  const tokenHash = useAdminTokenHash();
  const images = useQuery(
    api.siteImages.list,
    tokenHash ? { tokenHash } : "skip",
  );
  const upsert = useMutation(api.siteImages.upsert);
  const remove = useMutation(api.siteImages.remove);

  const [key, setKey] = useState("hero");
  const [label, setLabel] = useState("Hero section");
  const [cloudinaryPath, setCloudinaryPath] = useState("devmalitos/hero");
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [viewItem, setViewItem] = useState<ImageItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ImageItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isShowreel = key === "about-showreel";

  const closeModal = () => {
    setModalMode("closed");
    setViewItem(null);
    setError("");
  };

  const openForSection = (section: (typeof SECTIONS)[number]) => {
    const existing = images?.find((i) => i.key === section.key);
    setKey(section.key);
    setLabel(existing?.label ?? section.label);
    // No pre-filled path for empty slots — otherwise a previously deleted
    // asset at the default path would reappear in the preview.
    setCloudinaryPath(existing?.cloudinaryPath ?? "");
    setViewItem(null);
    setModalMode("form");
  };

  const openEdit = (img: ImageItem) => {
    setKey(img.key);
    setLabel(img.label);
    setCloudinaryPath(img.cloudinaryPath);
    setViewItem(null);
    setModalMode("form");
  };

  const openView = (img: ImageItem) => {
    setViewItem(img);
    setModalMode("view");
  };

  const confirmDelete = async () => {
    if (!tokenHash || !deleteTarget) return;
    setDeleting(true);
    try {
      await remove({ tokenHash, imageId: deleteTarget._id });
      // Also delete the actual file from Cloudinary so it doesn't reappear.
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Stored value may be a full versioned URL — the delete API expects
            // a bare public_id, so normalize it back down first.
            publicId: normalizeCloudinaryPath(deleteTarget.cloudinaryPath),
            resourceType:
              deleteTarget.key === "about-showreel" ? "video" : "image",
          }),
        });
      } catch {
        // Record is gone either way; asset cleanup is best-effort.
      }
      setDeleteTarget(null);
      if (viewItem?._id === deleteTarget._id) closeModal();
    } finally {
      setDeleting(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenHash) return;
    if (!cloudinaryPath.trim()) {
      setError("Upload an image or video first.");
      return;
    }
    setError("");
    try {
      await upsert({ tokenHash, key, label, cloudinaryPath });
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save image");
    }
  };

  if (!tokenHash || images === undefined) {
    return (
      <p className="text-sm text-[var(--admin-text-dim)]">Loading images…</p>
    );
  }

  const sectionKeys = new Set(SECTIONS.map((s) => s.key));
  const otherImages = images.filter((i) => !sectionKeys.has(i.key));
  const sectionLabel =
    SECTIONS.find((s) => s.key === (viewItem?.key ?? key))?.label ?? "Custom";

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--admin-text-dim)]">
        Each site section has its own media slot. Upload to Cloudinary and it
        appears on the live site after save.
      </p>

      {SECTIONS.map((section) => {
        const img = images.find((i) => i.key === section.key);
        const isVideo = section.key === "about-showreel";
        return (
          <section
            key={section.key}
            className="card-surface card-surface-interactive overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
              <div className="min-w-0">
                <h2 className="font-semibold text-[var(--admin-text)]">
                  {section.label}
                </h2>
                <p className="mt-0.5 text-xs text-[var(--admin-text-dim)]">
                  {section.description}
                </p>
              </div>
              <AdminButton
                variant="primary"
                className="!px-3 !py-1.5 !text-xs"
                onClick={() => openForSection(section)}
              >
                {img
                  ? isVideo
                    ? "Replace video"
                    : "Replace image"
                  : isVideo
                    ? "Add video"
                    : "Add image"}
              </AdminButton>
            </div>

            <div className="p-4 sm:p-5">
              {img ? (
                <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
                  <article className="card-surface card-surface-interactive flex h-full flex-col p-4">
                    <button
                      type="button"
                      onClick={() => openView(img)}
                      className="mb-4 block w-full overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--input-bg)] text-left"
                    >
                      <MediaPreview
                        path={img.cloudinaryPath}
                        isVideo={isVideo}
                        alt={img.label}
                        className="aspect-[16/10] w-full object-cover"
                      />
                    </button>
                    <h3 className="line-clamp-2 font-semibold text-[var(--admin-text)]">
                      {img.label}
                    </h3>
                    <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
                      <AdminRowActions
                        onView={() => openView(img)}
                        onEdit={() => openEdit(img)}
                        onDelete={() => setDeleteTarget(img)}
                      />
                    </div>
                  </article>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--border-subtle)] px-6 py-10 text-center">
                  <p className="text-sm font-medium text-[var(--admin-text)]">
                    No {isVideo ? "video" : "image"} yet
                  </p>
                  <p className="mt-2 text-sm text-[var(--admin-text-dim)]">
                    Add {isVideo ? "a video" : "an image"} for this section to
                    show it on the live site.
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {otherImages.length > 0 && (
        <section className="card-surface card-surface-interactive overflow-hidden">
          <div className="border-b border-[var(--border-subtle)] px-4 py-3 sm:px-5 sm:py-4">
            <h2 className="font-semibold text-[var(--admin-text)]">
              Other images
            </h2>
            <p className="mt-0.5 text-xs text-[var(--admin-text-dim)]">
              Images with custom section keys.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-4 min-[480px]:grid-cols-2 sm:p-5 lg:grid-cols-3">
            {otherImages.map((img) => (
              <article
                key={img._id}
                className="card-surface card-surface-interactive flex h-full flex-col p-4"
              >
                <button
                  type="button"
                  onClick={() => openView(img)}
                  className="mb-4 block w-full overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--input-bg)] text-left"
                >
                  <MediaPreview
                    path={img.cloudinaryPath}
                    isVideo={false}
                    alt={img.label}
                    className="aspect-[16/10] w-full object-cover"
                  />
                </button>
                <h3 className="line-clamp-2 font-semibold text-[var(--admin-text)]">
                  {img.label}
                </h3>
                <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
                  <AdminRowActions
                    onView={() => openView(img)}
                    onEdit={() => openEdit(img)}
                    onDelete={() => setDeleteTarget(img)}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <AdminModal
        open={modalMode !== "closed"}
        onClose={closeModal}
        title={
          modalMode === "view"
            ? "Media details"
            : `${sectionLabel} — ${isShowreel ? "video" : "image"}`
        }
        description={modalMode === "view" ? viewItem?.label : undefined}
        size="md"
        footer={
          modalMode === "view" && viewItem ? (
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
          ) : modalMode === "form" ? (
            <>
              <AdminButton variant="muted" onClick={closeModal}>
                Cancel
              </AdminButton>
              <AdminButton variant="primary" type="submit" form="image-form">
                Save
              </AdminButton>
            </>
          ) : undefined
        }
      >
        {modalMode === "view" && viewItem ? (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
              {viewItem.key === "about-showreel" ? (
                <video
                  src={cloudinaryVideoUrl(viewItem.cloudinaryPath)}
                  controls
                  className="h-44 w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cloudinaryUrl(viewItem.cloudinaryPath, { width: 800 })}
                  alt={viewItem.label}
                  className="h-44 w-full object-cover"
                />
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ViewField label="Section key" value={viewItem.key} />
              <ViewField label="Label" value={viewItem.label} />
            </div>
          </div>
        ) : modalMode === "form" ? (
          <form
            id="image-form"
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
          >
            <div>
              <label className={labelClass}>
                {isShowreel ? "Showreel video" : "Section image"}
              </label>
              <CloudinaryUpload
                folder="devmalitos"
                publicId={key}
                value={cloudinaryPath}
                resourceType={isShowreel ? "video" : "image"}
                label={
                  isShowreel
                    ? "Upload MP4 to Cloudinary"
                    : "Upload to Cloudinary"
                }
                onUploaded={(_publicId, url) => setCloudinaryPath(url)}
              />
            </div>
            <div>
              <label className={labelClass}>Label</label>
              <input
                className={inputClass}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </form>
        ) : null}
      </AdminModal>

      <AdminDeleteConfirmModal
        open={deleteTarget !== null}
        entityName="site image"
        targetLabel={deleteTarget?.label ?? ""}
        detail={deleteTarget?.cloudinaryPath}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
