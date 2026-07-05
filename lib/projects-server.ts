import { api, getConvexClient } from "./convex";
import {
  getStaticProjectBySlug,
  STATIC_PROJECTS,
  type PublicProject,
} from "./projects";

export type ProjectDetail = {
  project: PublicProject;
  nextSlug: string | null;
  prevSlug: string | null;
};

export async function fetchPublicProjects(): Promise<PublicProject[]> {
  const staticBySlug = new Map(STATIC_PROJECTS.map((p) => [p.slug, p]));

  try {
    const client = getConvexClient();
    const projects = await client.query(api.projects.listPublic, {});
    if (projects.length > 0) {
      return projects.map((p) => {
        const fallback = staticBySlug.get(p.slug);
        return {
          slug: p.slug,
          title: p.title,
          pitch: p.pitch,
          tag: p.tag,
          year: p.year,
          imagePath: p.imagePath || fallback?.imagePath || `devmalitos/projects/${p.slug}`,
          liveUrl: p.liveUrl ?? fallback?.liveUrl,
          featured: p.featured,
        };
      });
    }
  } catch {
    // fall through to static data
  }
  return STATIC_PROJECTS;
}

export async function fetchProjectBySlug(
  slug: string,
): Promise<ProjectDetail | null> {
  const staticDetail = getStaticProjectBySlug(slug);

  try {
    const client = getConvexClient();
    const result = await client.query(api.projects.getBySlugPublic, { slug });
    if (result) {
      const fallback = staticDetail?.project;
      return {
        project: {
          slug: result.project.slug,
          title: result.project.title,
          pitch: result.project.pitch,
          tag: result.project.tag,
          year: result.project.year,
          imagePath:
            result.project.imagePath ||
            fallback?.imagePath ||
            `devmalitos/projects/${result.project.slug}`,
          liveUrl: result.project.liveUrl ?? fallback?.liveUrl,
          featured: result.project.featured,
        },
        nextSlug: result.nextSlug,
        prevSlug: result.prevSlug,
      };
    }
  } catch {
    // fall through to static data
  }
  return staticDetail;
}
