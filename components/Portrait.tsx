"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Portrait photo with a styled fallback when the image isn't available yet.
 * Images are served from Cloudinary — upload to the devmalitos/ folder.
 */
export default function Portrait({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // the error event can fire before hydration attaches onError,
  // so also check the loaded state on mount
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-b from-ink-soft to-ink ${className}`}
      >
        <div className="text-center px-6">
          <div className="mx-auto mb-4 h-24 w-24 rounded-full border border-emerald-glow/40 flex items-center justify-center">
            <span className="font-display text-4xl text-emerald-bright">
              MH
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest text-cream-dim">
            Upload to Cloudinary
            <br />
            <code className="text-emerald-bright">devmalitos/</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
