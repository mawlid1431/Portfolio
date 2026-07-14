"use client";

import { useRef, useState } from "react";
import { cloudinaryUrl, cloudinaryVideoUrl } from "@/lib/cloudinary";
import { useAdminSession } from "@/lib/admin-hooks";
import { adminButtonClass } from "./AdminButton";

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

      <div className="flex flex-wrap items-center gap-3">
        {showPreview && (
          <button
            type="button"
            className={adminButtonClass("muted", "!px-3 !py-1.5 !text-xs")}
            disabled={uploading || !admin}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Replace"}
          </button>
        )}
        {displayPath && (
          <code className="break-all text-xs text-secondary">
            {displayPath}
          </code>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
