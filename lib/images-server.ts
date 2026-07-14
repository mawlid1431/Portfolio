import { cloudinaryUrl, cloudinaryVideoUrl } from "./cloudinary";
import { api, getConvexClient } from "./convex";

export type SiteImageKey =
  | "hero"
  | "working"
  | "portrait"
  | "flag"
  | "graduation"
  | "about-showreel";

export type SiteImageMap = Record<SiteImageKey, string>;

const DEFAULT_PATHS: SiteImageMap = {
  hero: "devmalitos/hero",
  working: "devmalitos/working",
  portrait: "devmalitos/portrait",
  flag: "devmalitos/flag",
  graduation: "devmalitos/graduation",
  "about-showreel": "devmalitos/about-showreel",
};

export async function fetchSiteImageMap(): Promise<SiteImageMap> {
  // DEFAULT_PATHS are Cloudinary path conventions, not content — they let the
  // site render even before an image record exists for a section.
  const fallback = { ...DEFAULT_PATHS };

  try {
    const client = getConvexClient();
    const images = await client.query(api.siteImages.listPublic, {});
    if (images.length === 0) return fallback;

    const map = { ...fallback };
    for (const img of images) {
      if (img.key in map) {
        map[img.key as SiteImageKey] = img.cloudinaryPath;
      }
    }
    return map;
  } catch {
    return fallback;
  }
}

export function resolveSiteImage(
  map: SiteImageMap,
  key: SiteImageKey,
  width = 1200,
): string {
  const path = map[key] ?? DEFAULT_PATHS[key];
  return cloudinaryUrl(path, { width });
}

export function resolveSiteVideo(
  map: SiteImageMap,
  key: Extract<SiteImageKey, "about-showreel">,
): string {
  const path = map[key] ?? DEFAULT_PATHS[key];
  const url = cloudinaryVideoUrl(path);
  if (url) return url;

  return "https://res.cloudinary.com/demo/video/upload/q_auto,f_auto/c_scale,w_1920/sea-turtle";
}
