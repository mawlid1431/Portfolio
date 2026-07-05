import { cloudinaryUrl, cloudinaryVideoUrl } from "./cloudinary";
import { IMAGES } from "./data";
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

/** Paths from static fallbacks (full URLs in data.ts). */
function pathsFromStatic(): SiteImageMap {
  const extract = (url: string) => {
    const match = url.match(/\/upload\/[^/]+\/(.+)$/);
    return match?.[1] ?? "";
  };
  return {
    hero: extract(IMAGES.hero) || DEFAULT_PATHS.hero,
    working: extract(IMAGES.working) || DEFAULT_PATHS.working,
    portrait: extract(IMAGES.portrait) || DEFAULT_PATHS.portrait,
    flag: extract(IMAGES.flag) || DEFAULT_PATHS.flag,
    graduation: extract(IMAGES.graduation) || DEFAULT_PATHS.graduation,
    "about-showreel": DEFAULT_PATHS["about-showreel"],
  };
}

export async function fetchSiteImageMap(): Promise<SiteImageMap> {
  const fallback = pathsFromStatic();

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
