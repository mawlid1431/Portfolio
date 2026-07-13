import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./lib/session";
import {
  defaultExperience,
  defaultFaqs,
  defaultImages,
  defaultProjects,
  defaultSocials,
} from "./lib/seedData";

export const overview = query({
  args: { tokenHash: v.string() },
  returns: v.object({
    projects: v.number(),
    messages: v.number(),
    unreadMessages: v.number(),
    experiences: v.number(),
    faqs: v.number(),
    socials: v.number(),
    images: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);

    const [projects, messages, experiences, faqs, socials, images] =
      await Promise.all([
        ctx.db.query("projects").collect(),
        ctx.db.query("contactMessages").collect(),
        ctx.db.query("experiences").collect(),
        ctx.db.query("faqs").collect(),
        ctx.db.query("socialLinks").collect(),
        ctx.db.query("siteImages").collect(),
      ]);

    return {
      projects: projects.length,
      messages: messages.length,
      unreadMessages: messages.filter((m) => !m.read).length,
      experiences: experiences.length,
      faqs: faqs.length,
      socials: socials.length,
      images: images.length,
    };
  },
});

/** Import default site content from lib/data.ts values (admin only). */
export const importDefaults = mutation({
  args: { tokenHash: v.string() },
  returns: v.object({
    projects: v.number(),
    images: v.number(),
    experiences: v.number(),
    faqs: v.number(),
    socials: v.number(),
  }),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const now = Date.now();
    let projects = 0;
    let images = 0;
    let experiences = 0;
    let faqs = 0;
    let socials = 0;

    for (const p of defaultProjects) {
      const exists = await ctx.db
        .query("projects")
        .withIndex("by_slug", (q) => q.eq("slug", p.slug))
        .unique();
      if (!exists) {
        await ctx.db.insert("projects", {
          ...p,
          status: "live" as const,
          createdAt: now,
          updatedAt: now,
        });
        projects++;
      }
    }

    for (const img of defaultImages) {
      const exists = await ctx.db
        .query("siteImages")
        .withIndex("by_key", (q) => q.eq("key", img.key))
        .unique();
      if (!exists) {
        await ctx.db.insert("siteImages", { ...img, updatedAt: now });
        images++;
      }
    }

    if ((await ctx.db.query("experiences").collect()).length === 0) {
      for (const e of defaultExperience) {
        await ctx.db.insert("experiences", { ...e, createdAt: now, updatedAt: now });
        experiences++;
      }
    }

    if ((await ctx.db.query("faqs").collect()).length === 0) {
      for (const f of defaultFaqs) {
        await ctx.db.insert("faqs", { ...f, createdAt: now, updatedAt: now });
        faqs++;
      }
    }

    if ((await ctx.db.query("socialLinks").collect()).length === 0) {
      for (const s of defaultSocials) {
        await ctx.db.insert("socialLinks", { ...s, createdAt: now, updatedAt: now });
        socials++;
      }
    }

    return { projects, images, experiences, faqs, socials };
  },
});
