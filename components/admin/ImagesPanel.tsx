"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cloudinaryUrl, cloudinaryVideoUrl } from "@/lib/cloudinary";
import AdminModal from "./AdminModal";
import AdminButton from "./AdminButton";
import AdminDeleteConfirmModal from "./AdminDeleteConfirmModal";
import AdminEntityCard, { adminGridClass } from "./AdminEntityCard";
import CloudinaryUpload from "./CloudinaryUpload";
import { inputClass, labelClass, useAdminTokenHash } from "@/lib/admin-hooks";

const SECTION_PRESETS = [
  { key: "hero", label: "Hero (home)" },
  { key: "working", label: "Working section" },
  { key: "portrait", label: "Portrait / work" },
  { key: "flag", label: "About — flag" },
  { key: "graduation", label: "About — graduation" },
  { key: "about-showreel", label: "About — showreel video" },
];

type ImageItem = NonNullable<
  ReturnType<typeof useQuery<typeof api.siteImages.list>>
>[number];

type ModalMode = "closed" | "create" | "edit" | "view";

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

export default function ImagesPanel() {
  const tokenHash = useAdminTokenHash();
  const images = useQuery(
    api.siteImages.list,
    tokenHash ? { tokenHash } : "skip",
  );
  const upsert = useMutation(api.siteImages.upsert);
  const remove = useMutation(api.siteImages.remove);

  const [key, setKey] = useState("hero");
  const [label, setLabel] = useState("Hero (home)");
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

  const onPreset = (presetKey: string) => {
    const preset = SECTION_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;
    setKey(preset.key);
    setLabel(preset.label);
    const existing = images?.find((i) => i.key === preset.key);
    setCloudinaryPath(existing?.cloudinaryPath ?? `devmalitos/${preset.key}`);
  };

  const openCreate = () => {
    setViewItem(null);
    onPreset(SECTION_PRESETS[0]!.key);
    setModalMode("create");
  };

  const openEdit = (img: ImageItem) => {
    setViewItem(null);
    setKey(img.key);
    setLabel(img.label);
    setCloudinaryPath(img.cloudinaryPath);
    setModalMode("edit");
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

  const isFormOpen = modalMode === "create" || modalMode === "edit";
  const isPresetKey = SECTION_PRESETS.some((p) => p.key === key);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--admin-text-dim)]">
          Upload images to Cloudinary. Paths are saved in Convex and appear on
          the live site after save.
        </p>
        <AdminButton variant="primary" onClick={openCreate}>
          Add image
        </AdminButton>
      </div>

      <AdminModal
        open={modalMode !== "closed"}
        onClose={closeModal}
        title={
          modalMode === "create"
            ? "Add site image"
            : modalMode === "edit"
              ? "Edit site image"
              : "Image details"
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
          ) : isFormOpen ? (
            <>
              <AdminButton variant="muted" onClick={closeModal}>
                Cancel
              </AdminButton>
              <AdminButton variant="primary" type="submit" form="image-form">
                Save image
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

            <div className="grid gap-3 sm:grid-cols-3">
              <ViewField label="Section key" value={viewItem.key} />
              <ViewField label="Label" value={viewItem.label} />
              <ViewField
                label="Cloudinary path"
                value={viewItem.cloudinaryPath}
              />
            </div>
          </div>
        ) : isFormOpen ? (
          <form id="image-form" onSubmit={onSubmit} className="flex flex-col gap-4">
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
                  isShowreel ? "Upload MP4 to Cloudinary" : "Upload to Cloudinary"
                }
                onUploaded={(publicId) => setCloudinaryPath(publicId)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Section</label>
                <select
                  className={inputClass}
                  value={isPresetKey ? key : "custom"}
                  onChange={(e) => {
                    if (e.target.value !== "custom") onPreset(e.target.value);
                  }}
                >
                  {SECTION_PRESETS.map((preset) => (
                    <option key={preset.key} value={preset.key}>
                      {preset.label}
                    </option>
                  ))}
                  {!isPresetKey && <option value="custom">Custom</option>}
                </select>
              </div>
              <div>
                <label className={labelClass}>Section key</label>
                <input
                  className={inputClass}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
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
            </div>
            <div>
              <label className={labelClass}>Cloudinary path</label>
              <input
                className={inputClass}
                value={cloudinaryPath}
                onChange={(e) => setCloudinaryPath(e.target.value)}
                placeholder="devmalitos/hero"
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

      <div className={adminGridClass}>
        {images.map((img) => {
          const isVideo = img.key === "about-showreel";
          return (
            <AdminEntityCard
              key={img._id}
              title={img.label}
              meta={img.cloudinaryPath}
              media={
                isVideo ? (
                  <video
                    src={cloudinaryVideoUrl(img.cloudinaryPath)}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-36 w-full bg-charcoal object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cloudinaryUrl(img.cloudinaryPath, { width: 480 })}
                    alt={img.label}
                    className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                )
              }
              onView={() => openView(img)}
              onEdit={() => openEdit(img)}
              onDelete={() => setDeleteTarget(img)}
            />
          );
        })}
      </div>
    </div>
  );
}
