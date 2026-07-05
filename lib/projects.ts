import { cloudinaryUrl } from "./cloudinary";
import { PROJECTS } from "./data";

export type PublicProject = {
  slug: string;
  title: string;
  pitch: string;
  tag: string;
  year: number;
  imagePath: string;
  liveUrl?: string;
  featured?: boolean;
};

export const STATIC_PROJECTS: PublicProject[] = PROJECTS.map((p) => ({
  slug: p.slug,
  title: p.title,
  pitch: p.pitch,
  tag: p.tag,
  year: p.year,
  imagePath: p.imagePath,
  liveUrl: p.liveUrl,
  featured: p.featured,
}));

export function projectImageUrl(imagePath: string, width = 1200): string {
  return cloudinaryUrl(imagePath, { width });
}

export function getStaticProjectBySlug(slug: string): {
  project: PublicProject;
  nextSlug: string | null;
  prevSlug: string | null;
} | null {
  const index = STATIC_PROJECTS.findIndex((p) => p.slug === slug);
  if (index === -1) return null;

  return {
    project: STATIC_PROJECTS[index]!,
    nextSlug: STATIC_PROJECTS[index + 1]?.slug ?? null,
    prevSlug: STATIC_PROJECTS[index - 1]?.slug ?? null,
  };
}
