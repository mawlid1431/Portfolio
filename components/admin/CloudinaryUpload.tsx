"use client";

import { useRef, useState } from "react";
import { cloudinaryUrl, cloudinaryVideoUrl } from "@/lib/cloudinary";
import { useAdminSession } from "@/lib/admin-hooks";
import { btnGhost } from "@/lib/admin-hooks";

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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
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
        <button
          type="button"
          className={btnGhost}
          disabled={uploading || !admin}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : uploadLabel}
        </button>
        {displayPath && (
          <code className="text-xs text-emerald-bright">{displayPath}</code>
        )}
      </div>

      {previewUrl && isVideo && (
        <video
          src={previewUrl}
          controls
          className="max-h-48 w-full rounded-xl border border-cream/10 object-cover"
        />
      )}

      {previewUrl && !isVideo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Upload preview"
          className="max-h-48 w-full rounded-xl border border-cream/10 object-cover"
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
