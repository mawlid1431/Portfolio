"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cloudinaryUrl, cloudinaryVideoUrl } from "@/lib/cloudinary";
import AdminModal from "./AdminModal";
import AdminEntityCard, { adminGridClass } from "./AdminEntityCard";
import CloudinaryUpload from "./CloudinaryUpload";
import {
  btnGhost,
  btnPrimary,
  inputClass,
  labelClass,
  useAdminTokenHash,
} from "@/lib/admin-hooks";

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

  const isShowreel = key === "about-showreel";

  const closeModal = () => {
    setModalMode("closed");
    setViewItem(null);
    setError("");
  };

  const onPreset = (preset: (typeof SECTION_PRESETS)[number]) => {
    setKey(preset.key);
    setLabel(preset.label);
    const existing = images?.find((i) => i.key === preset.key);
    setCloudinaryPath(existing?.cloudinaryPath ?? `devmalitos/${preset.key}`);
  };

  const openCreate = () => {
    setViewItem(null);
    onPreset(SECTION_PRESETS[0]!);
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
    return <p className="text-sm text-cream-dim">Loading images…</p>;
  }

  const isFormOpen = modalMode === "create" || modalMode === "edit";
  const previewPath = viewItem?.cloudinaryPath ?? cloudinaryPath;
  const previewIsShowreel =
    viewItem?.key === "about-showreel" || isShowreel;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-cream-dim">
        Upload images to Cloudinary. Paths are saved in Convex and appear on the
        live site after save.
      </p>

      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {SECTION_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              className={btnGhost}
              onClick={() => {
                onPreset(preset);
                setModalMode("create");
                setViewItem(null);
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <button type="button" className={btnPrimary} onClick={openCreate}>
          Add image
        </button>
      </div>

      <AdminModal
        open={modalMode !== "closed"}
        onClose={closeModal}
        title={
          modalMode === "create"
            ? "New site image"
            : modalMode === "edit"
              ? "Edit site image"
              : "Image details"
        }
        size="xl"
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
              <button type="submit" form="image-form" className={btnPrimary}>
                Save section image
              </button>
            </>
          ) : undefined
        }
      >
        {modalMode === "view" && viewItem ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div>
                <p className={labelClass}>Section key</p>
                <p className="mt-1 text-sm text-cream">{viewItem.key}</p>
              </div>
              <div>
                <p className={labelClass}>Label</p>
                <p className="mt-1 text-sm text-cream">{viewItem.label}</p>
              </div>
              <div>
                <p className={labelClass}>Cloudinary path</p>
                <p className="mt-1 break-all text-sm text-cream">
                  {viewItem.cloudinaryPath}
                </p>
              </div>
            </div>
            <div>
              <p className={labelClass}>Preview</p>
              {previewIsShowreel ? (
                <video
                  src={cloudinaryVideoUrl(previewPath)}
                  controls
                  className="mt-2 max-h-64 w-full rounded-xl border border-cream/10 object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cloudinaryUrl(previewPath, { width: 800 })}
                  alt={viewItem.label}
                  className="mt-2 max-h-64 w-full rounded-xl border border-cream/10 object-cover"
                />
              )}
            </div>
          </div>
        ) : isFormOpen ? (
          <form
            id="image-form"
            onSubmit={onSubmit}
            className="grid gap-6 lg:grid-cols-2"
          >
            <div className="flex flex-col gap-4">
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
                  onUploaded={(publicId) => setCloudinaryPath(publicId)}
                />
                <input
                  className={`${inputClass} mt-3`}
                  value={cloudinaryPath}
                  onChange={(e) => setCloudinaryPath(e.target.value)}
                  placeholder="devmalitos/hero"
                  required
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
            <div>
              <p className={labelClass}>Preview</p>
              {isShowreel ? (
                <video
                  src={cloudinaryVideoUrl(cloudinaryPath)}
                  controls
                  className="mt-2 max-h-64 w-full rounded-xl border border-cream/10 object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cloudinaryUrl(cloudinaryPath, { width: 800 })}
                  alt={label}
                  className="mt-2 max-h-64 w-full rounded-xl border border-cream/10 object-cover"
                />
              )}
            </div>
          </form>
        ) : null}
      </AdminModal>

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
                    className="h-36 w-full bg-ink object-cover"
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
              onDelete={() => void remove({ tokenHash, imageId: img._id })}
            />
          );
        })}
      </div>
    </div>
  );
}
