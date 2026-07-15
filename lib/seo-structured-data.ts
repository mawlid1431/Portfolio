import { getSiteUrl } from "@/lib/site-metadata";

/** Public profiles — helps Google connect your name to this site. */
export const PROFILE_URLS = [
  "https://github.com/mawlid1431",
  "https://www.linkedin.com/in/mowlid-mohamoud-haibe-8b7b6a189/",
  "https://www.instagram.com/malitfx",
  "https://www.tiktok.com/@tech_follow",
] as const;

export function buildFaqStructuredData(
  items: ReadonlyArray<{ q: string; a: string }>,
): Record<string, unknown> | null {
  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function buildBreadcrumbStructuredData(
  items: ReadonlyArray<{ name: string; path: string }>,
): Record<string, unknown> {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
