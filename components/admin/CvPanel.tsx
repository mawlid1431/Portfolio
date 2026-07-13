"use client";

import { FormEvent, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import GlassButton from "@/components/GlassButton";
import {
  btnDanger,
  btnGhost,
  btnPrimary,
  cardClass,
  formatDate,
  labelClass,
  useAdminTokenHash,
} from "@/lib/admin-hooks";

const ACCEPTED =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const MAX_BYTES = 12 * 1024 * 1024;

export default function CvPanel() {
  const tokenHash = useAdminTokenHash();
  const cv = useQuery(api.cv.getAdmin, tokenHash ? { tokenHash } : "skip");
  const generateUploadUrl = useMutation(api.cv.generateUploadUrl);
  const save = useMutation(api.cv.save);
  const remove = useMutation(api.cv.remove);

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!tokenHash || cv === undefined) {
    return <p className="text-sm text-cream-dim">Loading CV…</p>;
  }

  const onUpload = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a PDF, DOC, or DOCX file first.");
      return;
    }

    if (file.size > MAX_BYTES) {
      setError("File must be smaller than 12 MB.");
      return;
    }

    setUploading(true);
    try {
      const postUrl = await generateUploadUrl({ tokenHash });
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const body = (await result.json()) as { storageId: Id<"_storage"> };
      await save({
        tokenHash,
        storageId: body.storageId,
        fileName: file.name,
        mimeType: file.type || "application/pdf",
      });

      setSuccess("CV uploaded. It is now live on the site navbar.");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload CV");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-cream-dim">
        Upload your CV (PDF preferred). Visitors can open a preview from the
        navbar <span className="text-cream">CV</span> button and download the
        file.
      </p>

      <form onSubmit={onUpload} className={`${cardClass} flex flex-col gap-4`}>
        <div>
          <label className={labelClass} htmlFor="cv-file">
            CV file
          </label>
          <input
            id="cv-file"
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="block w-full text-sm text-cream-dim file:mr-4 file:rounded-xl file:border-0 file:bg-emerald-glow/15 file:px-4 file:py-2.5 file:text-xs file:font-bold file:uppercase file:tracking-[0.14em] file:text-emerald-bright"
          />
          <p className="mt-2 text-xs text-cream-dim">
            PDF, DOC, or DOCX · max 12 MB. New uploads replace the previous CV.
          </p>
        </div>

        {error ? <p className="text-xs text-red-400">{error}</p> : null}
        {success ? <p className="text-xs text-emerald-bright">{success}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className={btnPrimary} disabled={uploading}>
            {uploading ? "Uploading…" : cv ? "Replace CV" : "Upload CV"}
          </button>
          {cv ? (
            <button
              type="button"
              className={btnDanger}
              disabled={uploading}
              onClick={() => void remove({ tokenHash })}
            >
              Remove CV
            </button>
          ) : null}
        </div>
      </form>

      {cv ? (
        <div className={cardClass}>
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-bright">
            Current CV
          </p>
          <p className="mt-3 font-medium text-cream">{cv.fileName}</p>
          <p className="mt-1 text-xs text-cream-dim">
            {cv.mimeType} · Updated {formatDate(cv.updatedAt)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {cv.url ? (
              <>
                <GlassButton href={cv.url} external variant="ghost" size="sm">
                  Open / preview
                </GlassButton>
                <GlassButton
                  href={cv.url}
                  external
                  download={cv.fileName}
                  variant="accent"
                  size="sm"
                >
                  Download
                </GlassButton>
              </>
            ) : (
              <span className={btnGhost}>URL unavailable</span>
            )}
          </div>
        </div>
      ) : (
        <div className={`${cardClass} border-dashed`}>
          <p className="text-sm text-cream-dim">No CV uploaded yet.</p>
        </div>
      )}
    </div>
  );
}
