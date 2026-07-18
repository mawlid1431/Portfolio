const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

/**
 * Split a stored value into its public_id and (optional) version.
 *
 * The version matters: when an asset is overwritten at the same public_id,
 * the version is the only part of the delivery URL that changes. Preserving it
 * makes the URL unique per upload, which busts Cloudinary's CDN + browser cache
 * so a replaced video/image actually shows up instead of the stale cached one.
 */
export function parseCloudinary(value: string): {
  id: string;
  version: string;
} {
  const trimmed = value.trim();
  if (!trimmed) return { id: "", version: "" };

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const match = trimmed.match(
      /\/upload\/(?:(v\d+)\/)?(.+?)(?:\.[a-z0-9]+)?$/i,
    );
    if (match?.[2]) {
      return { id: match[2], version: match[1] ?? "" };
    }
  }

  return { id: trimmed.replace(/^\/+/, ""), version: "" };
}

/** Strip a full Cloudinary URL down to its public_id, or return the path as-is. */
export function normalizeCloudinaryPath(value: string): string {
  return parseCloudinary(value).id;
}

/** Build a Cloudinary delivery URL for an image in your media library. */
export function cloudinaryUrl(
  publicId: string,
  options?: { width?: number; quality?: "auto" | number },
): string {
  const { id, version } = parseCloudinary(publicId);
  if (!id) return "";

  const transforms: string[] = ["f_auto", "q_auto"];
  if (options?.width) transforms.push(`w_${options.width}`);

  const transformation = transforms.join(",");
  const versionSegment = version ? `${version}/` : "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${versionSegment}${id}`;
}

/** Build a Cloudinary delivery URL for a video in your media library. */
export function cloudinaryVideoUrl(publicId: string): string {
  const { id, version } = parseCloudinary(publicId);
  if (!id) return "";

  const versionSegment = version ? `${version}/` : "";
  return `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto/${versionSegment}${id}`;
}
