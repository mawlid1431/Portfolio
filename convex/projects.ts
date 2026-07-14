import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./lib/session";

export const projectValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  slug: v.string(),
  title: v.string(),
  pitch: v.string(),
  tag: v.optional(v.string()),
  year: v.number(),
  imagePath: v.string(),
  liveUrl: v.optional(v.string()),
  featured: v.boolean(),
  status: v.union(v.literal("live"), v.literal("draft")),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export type ProjectDoc = {
  _id: Id<"projects">;
  _creationTime: number;
  slug: string;
  title: string;
  pitch: string;
  tag?: string;
  year: number;
  imagePath: string;
  liveUrl?: string;
  featured: boolean;
  status: "live" | "draft";
  createdAt: number;
  updatedAt: number;
};

/** Derive a URL-safe slug from the project title. */
function slugify(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sortLiveProjects<T extends { year: number; createdAt: number }>(
  projects: T[],
): T[] {
  return [...projects].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.createdAt - a.createdAt;
  });
}

function withDefaults(project: {
  _id: Id<"projects">;
  _creationTime: number;
  slug: string;
  title: string;
  pitch: string;
  tag?: string;
  year?: number;
  imagePath?: string;
  liveUrl?: string;
  featured: boolean;
  status: "live" | "draft";
  createdAt: number;
  updatedAt: number;
}): ProjectDoc {
  return {
    ...project,
    year: project.year ?? new Date(project.createdAt).getFullYear(),
    imagePath: project.imagePath ?? `devmalitos/projects/${project.slug}`,
    liveUrl: project.liveUrl,
  };
}

export const list = query({
  args: { tokenHash: v.string() },
  returns: v.array(projectValidator),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const projects = await ctx.db.query("projects").order("desc").collect();
    return projects.map(withDefaults);
  },
});

export const listPublic = query({
  args: {},
  returns: v.array(projectValidator),
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    return sortLiveProjects(
      projects.filter((p) => p.status === "live").map(withDefaults),
    );
  },
});

export const getBySlugPublic = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      project: projectValidator,
      nextSlug: v.union(v.string(), v.null()),
      prevSlug: v.union(v.string(), v.null()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const slug = args.slug.trim().toLowerCase();
    const project = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!project || project.status !== "live") return null;

    const live = sortLiveProjects(
      (await ctx.db.query("projects").collect())
        .filter((p) => p.status === "live")
        .map(withDefaults),
    );

    const index = live.findIndex((p) => p.slug === slug);
    if (index === -1) return null;

    return {
      project: live[index]!,
      nextSlug: live[index + 1]?.slug ?? null,
      prevSlug: live[index - 1]?.slug ?? null,
    };
  },
});

export const create = mutation({
  args: {
    tokenHash: v.string(),
    title: v.string(),
    pitch: v.string(),
    year: v.number(),
    imagePath: v.string(),
    liveUrl: v.optional(v.string()),
    idempotencyKey: v.string(),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);

    const existingKey = await ctx.db
      .query("idempotencyKeys")
      .withIndex("by_key", (q) => q.eq("key", args.idempotencyKey))
      .unique();

    if (existingKey) {
      if (existingKey.expiresAt < Date.now()) {
        await ctx.db.delete("idempotencyKeys", existingKey._id);
      } else {
        return existingKey.resultId as Id<"projects">;
      }
    }

    const baseSlug = slugify(args.title) || "project";
    let slug = baseSlug;
    for (let suffix = 2; ; suffix++) {
      const duplicate = await ctx.db
        .query("projects")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!duplicate) break;
      slug = `${baseSlug}-${suffix}`;
    }

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      slug,
      title: args.title.trim(),
      pitch: args.pitch.trim(),
      year: args.year,
      imagePath: args.imagePath.trim(),
      liveUrl: args.liveUrl?.trim() || undefined,
      featured: false,
      status: "live",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("idempotencyKeys", {
      key: args.idempotencyKey,
      resultId: projectId,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    });

    return projectId;
  },
});

export const update = mutation({
  args: {
    tokenHash: v.string(),
    projectId: v.id("projects"),
    title: v.string(),
    pitch: v.string(),
    year: v.number(),
    imagePath: v.string(),
    liveUrl: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);

    // Slug stays stable after creation so public project URLs don't break.
    await ctx.db.patch("projects", args.projectId, {
      title: args.title.trim(),
      pitch: args.pitch.trim(),
      year: args.year,
      imagePath: args.imagePath.trim(),
      liveUrl: args.liveUrl?.trim() || undefined,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutation({
  args: {
    tokenHash: v.string(),
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.delete("projects", args.projectId);
    return null;
  },
});
