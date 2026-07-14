"use client";

import { useEffect, useRef, useState } from "react";
import { cloudinaryUrl, cloudinaryVideoUrl } from "@/lib/cloudinary";
import { useAdminSession } from "@/lib/admin-hooks";
import { adminButtonClass } from "./AdminButton";
import { IconX } from "./AdminIcons";

type LibraryAsset = {
  publicId: string;
  url: string;
  resourceType: "image" | "video";
  createdAt: string;
};

function MediaLibraryPicker({
  resourceType,
  onSelect,
  onClose,
}: {
  resourceType: "image" | "video";
  onSelect: (asset: LibraryAsset) => void;
  onClose: () => void;
}) {
  const [assets, setAssets] = useState<LibraryAsset[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/media-library?type=${resourceType}`, {
          credentials: "same-origin",
        });
        const body = (await res.json()) as {
          assets?: LibraryAsset[];
          error?: string;
        };
        if (!res.ok || !body.assets) {
          throw new Error(body.error ?? "Failed to load media library");
        }
        if (!cancelled) setAssets(body.assets);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load media library",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resourceType]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close media library"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="card-surface admin-modal-surface relative z-10 flex max-h-[80dvh] w-full max-w-2xl flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-4 py-3 sm:px-5">
          <h3 className="font-semibold text-[var(--admin-text)]">
            Choose from uploaded {resourceType === "video" ? "videos" : "images"}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--admin-text-dim)] hover:border-secondary/40 hover:text-secondary"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : assets === null ? (
            <p className="text-sm text-[var(--admin-text-dim)]">
              Loading media…
            </p>
          ) : assets.length === 0 ? (
            <p className="text-sm text-[var(--admin-text-dim)]">
              No uploaded {resourceType === "video" ? "videos" : "images"} yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {assets.map((asset) => (
                <button
                  key={asset.publicId}
                  type="button"
                  title={asset.publicId}
                  onClick={() => onSelect(asset)}
                  className="group overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--input-bg)] text-left transition-colors hover:border-secondary"
                >
                  {resourceType === "video" ? (
                    <video
                      src={asset.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cloudinaryUrl(asset.publicId, { width: 300 })}
                      alt={asset.publicId}
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                    />
                  )}
                  <p className="truncate px-2 py-1.5 text-[11px] text-[var(--admin-text-faint)] group-hover:text-secondary">
                    {asset.publicId}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type Props = {
  /** Cloudinary folder, e.g. `devmalitos` or `devmalitos/projects` */
  folder: string;
  /** Optional public id within folder (e.g. slug or section key) */
  publicId?: string;
  /** Current stored path — used for preview */
  value?: string;
  label?: string;
  resourceType?: "image" | "video";
  onUploaded: (publicId: string, url: string) => void;
};

export default function CloudinaryUpload({
  folder,
  publicId,
  value,
  label,
  resourceType = "image",
  onUploaded,
}: Props) {
  const { admin } = useAdminSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(value ?? "");
  const [previewBroken, setPreviewBroken] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const onLibrarySelect = (asset: LibraryAsset) => {
    setPreview(asset.publicId);
    setPreviewBroken(false);
    setPickerOpen(false);
    onUploaded(asset.publicId, asset.url);
  };

  const onPick = async (file: File) => {
    if (!admin) {
      setError("Session expired — sign in again");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      if (publicId) form.append("publicId", publicId);

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const body = (await res.json()) as {
        publicId?: string;
        url?: string;
        error?: string;
      };

      if (!res.ok || !body.publicId || !body.url) {
        throw new Error(body.error ?? "Upload failed");
      }

      setPreview(body.publicId);
      setPreviewBroken(false);
      onUploaded(body.publicId, body.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const isVideo = resourceType === "video";
  const uploadLabel = label ?? (isVideo ? "Upload video" : "Upload image");
  const accept = isVideo
    ? "video/mp4,video/webm,video/quicktime"
    : "image/jpeg,image/png,image/webp,image/gif";

  const displayPath = preview || value;
  const previewUrl = displayPath
    ? isVideo
      ? cloudinaryVideoUrl(displayPath)
      : cloudinaryUrl(displayPath, { width: 600 })
    : "";
  const showPreview = Boolean(previewUrl) && !previewBroken;

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onPick(file);
        }}
      />

      {showPreview ? (
        <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--input-bg)]">
          {isVideo ? (
            <video
              src={previewUrl}
              controls
              className="max-h-44 w-full object-cover"
              onError={() => setPreviewBroken(true)}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Upload preview"
              className="max-h-44 w-full object-cover"
              onError={() => setPreviewBroken(true)}
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading || !admin}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--input-bg)] px-6 py-8 text-center transition-colors hover:border-secondary/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="text-sm font-medium text-[var(--admin-text)]">
            {uploading ? "Uploading…" : uploadLabel}
          </span>
          <span className="text-xs text-[var(--admin-text-faint)]">
            {isVideo
              ? "Click to choose an MP4/WebM file"
              : "Click to choose a JPG, PNG or WebP file"}
          </span>
        </button>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={adminButtonClass("muted", "!px-3 !py-1.5 !text-xs")}
          disabled={uploading || !admin}
          onClick={() => inputRef.current?.click()}
        >
          {uploading
            ? "Uploading…"
            : showPreview
              ? "Replace from device"
              : "Upload from device"}
        </button>
        <button
          type="button"
          className={adminButtonClass("simple", "!px-3 !py-1.5 !text-xs")}
          disabled={uploading || !admin}
          onClick={() => setPickerOpen(true)}
        >
          Choose from uploaded
        </button>
        {displayPath && (
          <code className="break-all text-xs text-secondary">
            {displayPath}
          </code>
        )}
      </div>

      {pickerOpen && (
        <MediaLibraryPicker
          resourceType={resourceType}
          onSelect={onLibrarySelect}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
