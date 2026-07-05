"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cloudinaryUrl, cloudinaryVideoUrl } from "@/lib/cloudinary";
import CloudinaryUpload from "./CloudinaryUpload";
import {
  btnDanger,
  btnGhost,
  btnPrimary,
  cardClass,
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

  const onPreset = (preset: (typeof SECTION_PRESETS)[number]) => {
    setKey(preset.key);
    setLabel(preset.label);
    const existing = images?.find((i) => i.key === preset.key);
    setCloudinaryPath(existing?.cloudinaryPath ?? `devmalitos/${preset.key}`);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenHash) return;
    setError("");
    try {
      await upsert({ tokenHash, key, label, cloudinaryPath });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save image");
    }
  };

  if (!tokenHash || images === undefined) {
    return <p className="text-sm text-cream-dim">Loading images…</p>;
  }

  const isShowreel = key === "about-showreel";

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-cream-dim">
        Upload images directly to your Cloudinary account. Paths are saved in
        Convex and appear on the live site immediately after save. For the
        about showreel, upload an MP4 to Cloudinary and set the path to{" "}
        <code className="text-emerald-bright">devmalitos/about-showreel</code>.
      </p>

      <div className="flex flex-wrap gap-2">
        {SECTION_PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            className={btnGhost}
            onClick={() => onPreset(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className={`${cardClass} grid gap-4 lg:grid-cols-2`}>
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
              label={isShowreel ? "Upload MP4 to Cloudinary" : "Upload to Cloudinary"}
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
          <button type="submit" className={`${btnPrimary} w-fit`}>
            Save section image
          </button>
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <div key={img._id} className={cardClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryUrl(img.cloudinaryPath, { width: 400 })}
              alt={img.label}
              className="mb-4 h-36 w-full rounded-xl object-cover"
            />
            <p className="font-medium">{img.label}</p>
            <p className="mt-1 text-xs text-cream-dim">{img.cloudinaryPath}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className={btnGhost}
                onClick={() => {
                  setKey(img.key);
                  setLabel(img.label);
                  setCloudinaryPath(img.cloudinaryPath);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className={btnDanger}
                onClick={() => void remove({ tokenHash, imageId: img._id })}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
