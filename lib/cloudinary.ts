const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

/** Strip a full Cloudinary URL down to its public_id, or return the path as-is. */
export function normalizeCloudinaryPath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const match = trimmed.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
    if (match?.[1]) return match[1];
  }

  return trimmed.replace(/^\/+/, "");
}

/** Build a Cloudinary delivery URL for an image in your media library. */
export function cloudinaryUrl(
  publicId: string,
  options?: { width?: number; quality?: "auto" | number },
): string {
  const id = normalizeCloudinaryPath(publicId);
  if (!id) return "";

  if (id.startsWith("http://") || id.startsWith("https://")) {
    return id;
  }

  const transforms: string[] = ["f_auto", "q_auto"];
  if (options?.width) transforms.push(`w_${options.width}`);

  const transformation = transforms.join(",");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${id}`;
}

/** Build a Cloudinary delivery URL for a video in your media library. */
export function cloudinaryVideoUrl(publicId: string): string {
  const id = normalizeCloudinaryPath(publicId);
  if (!id) return "";

  if (id.startsWith("http://") || id.startsWith("https://")) {
    return id;
  }

  return `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto/${id}`;
}
