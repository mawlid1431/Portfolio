import { api, getConvexClient } from "./convex";
import type { PublicProject } from "./projects";

export type ProjectDetail = {
  project: PublicProject;
  nextSlug: string | null;
  prevSlug: string | null;
};

export async function fetchPublicProjects(): Promise<PublicProject[]> {
  try {
    const client = getConvexClient();
    const projects = await client.query(api.projects.listPublic, {});
    return projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      pitch: p.pitch,
      tag: p.tag,
      year: p.year,
      imagePath: p.imagePath || `devmalitos/projects/${p.slug}`,
      liveUrl: p.liveUrl,
      featured: p.featured,
    }));
  } catch {
    return [];
  }
}

export async function fetchProjectBySlug(
  slug: string,
): Promise<ProjectDetail | null> {
  try {
    const client = getConvexClient();
    const result = await client.query(api.projects.getBySlugPublic, { slug });
    if (!result) return null;
    return {
      project: {
        slug: result.project.slug,
        title: result.project.title,
        pitch: result.project.pitch,
        tag: result.project.tag,
        year: result.project.year,
        imagePath:
          result.project.imagePath ||
          `devmalitos/projects/${result.project.slug}`,
        liveUrl: result.project.liveUrl,
        featured: result.project.featured,
      },
      nextSlug: result.nextSlug,
      prevSlug: result.prevSlug,
    };
  } catch {
    return null;
  }
}
