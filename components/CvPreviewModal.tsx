"use client";

import { useEffect, useState } from "react";
import GlassButton from "@/components/GlassButton";
import { cn } from "@/lib/cn";

export type CvFileInfo = {
  url: string;
  fileName: string;
  mimeType: string;
};

type CvPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  cv: CvFileInfo | null | undefined;
};

function isPdf(mimeType: string, fileName: string) {
  return (
    mimeType === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf")
  );
}

async function downloadFile(url: string, fileName: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Fallback: open in a new tab if blob download is blocked
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export default function CvPreviewModal({
  open,
  onClose,
  cv,
}: CvPreviewModalProps) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const canPreview = cv ? isPdf(cv.mimeType, cv.fileName) : false;

  const onDownload = async () => {
    if (!cv) return;
    setDownloading(true);
    try {
      await downloadFile(cv.url, cv.fileName);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-preview-title"
    >
      <button
        type="button"
        aria-label="Close CV preview"
        className="admin-modal-backdrop absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-cream/25 bg-ink-soft shadow-2xl sm:h-[88dvh] sm:rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream/15 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2
              id="cv-preview-title"
              className="font-display text-xl uppercase tracking-wide text-cream"
            >
              CV preview
            </h2>
            <p className="mt-0.5 truncate text-xs text-cream-dim">
              {cv?.fileName ?? "No CV uploaded yet"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
              Go back
            </GlassButton>
            {cv ? (
              <GlassButton
                type="button"
                variant="accent"
                size="sm"
                disabled={downloading}
                onClick={() => void onDownload()}
              >
                {downloading ? "Downloading…" : "Download"}
              </GlassButton>
            ) : null}
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-ink">
          {!cv ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-cream-dim">
                CV is not available yet. Check back soon.
              </p>
              <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
                Go back
              </GlassButton>
            </div>
          ) : canPreview ? (
            <iframe
              title={cv.fileName}
              src={`${cv.url}#toolbar=1&navpanes=0`}
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <p className={cn("max-w-md text-sm text-cream-dim")}>
                Preview is available for PDF files. Download{" "}
                <span className="text-cream">{cv.fileName}</span> to open it on
                your device.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
                  Go back
                </GlassButton>
                <GlassButton
                  type="button"
                  variant="accent"
                  size="sm"
                  disabled={downloading}
                  onClick={() => void onDownload()}
                >
                  {downloading ? "Downloading…" : "Download"}
                </GlassButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
