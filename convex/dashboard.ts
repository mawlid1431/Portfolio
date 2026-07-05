import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./lib/session";

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

    const defaultProjects = [
      { slug: "callback-ai", title: "CallBack AI", pitch: "An autonomous career agent — AI that follows up, schedules and advances your job search on its own.", tag: "AI Application", year: 2025, imagePath: "devmalitos/projects/callback-ai", featured: true },
      { slug: "pure-crm", title: "Pure CRM", pitch: "Intelligent job-hunting CRM that tracks applications and surfaces the next best action with AI.", tag: "AI Application", year: 2025, imagePath: "devmalitos/projects/pure-crm", featured: false },
      { slug: "somalisk-studenter", title: "Somalisk Studenter-organisation", pitch: "Community & student platform connecting Somali students across Scandinavia.", tag: "Community Platform", year: 2024, imagePath: "devmalitos/projects/somalisk-studenter", featured: true },
      { slug: "barkulan-fintech", title: "BarkulanFintech", pitch: "Invoice & billing management system built for growing businesses.", tag: "Fintech", year: 2024, imagePath: "devmalitos/projects/barkulan-fintech", featured: true },
      { slug: "mubarak-charity", title: "Mubarak Charity", pitch: "A clean, impactful platform helping a charity communicate its mission.", tag: "Nonprofit", year: 2024, imagePath: "devmalitos/projects/mubarak-charity", liveUrl: "https://mubarakcharity.org", featured: true },
    ];

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

    const defaultImages = [
      { key: "hero", label: "Hero", cloudinaryPath: "devmalitos/hero" },
      { key: "working", label: "Working", cloudinaryPath: "devmalitos/working" },
      { key: "portrait", label: "Portrait", cloudinaryPath: "devmalitos/portrait" },
      { key: "flag", label: "Flag", cloudinaryPath: "devmalitos/flag" },
      { key: "graduation", label: "Graduation", cloudinaryPath: "devmalitos/graduation" },
      { key: "about-showreel", label: "About showreel", cloudinaryPath: "devmalitos/about-showreel" },
    ];

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

    const defaultExperience = [
      { role: "Software Engineer", org: "BuildSom", period: "September 2025 — Present", text: "Responsible for the full software development lifecycle — planning and designing software solutions, defining project scope, and leading implementation.", sortOrder: 0 },
      { role: "Digital Media & Protocol Manager", org: "Africa Science Week", period: "2023 — 2025", text: "Led digital media coverage and protocol management across 11 African countries.", sortOrder: 1 },
    ];

    if ((await ctx.db.query("experiences").collect()).length === 0) {
      for (const e of defaultExperience) {
        await ctx.db.insert("experiences", { ...e, createdAt: now, updatedAt: now });
        experiences++;
      }
    }

    const defaultFaqs = [
      { question: "What services do you offer?", answer: "Web application development, full-stack solutions, UI/UX design, and digital platforms for education, nonprofits and community initiatives.", sortOrder: 0 },
      { question: "How long does a typical project take?", answer: "A standard website takes 1–2 weeks. Larger full-stack applications typically run 3–6 weeks depending on scope.", sortOrder: 1 },
    ];

    if ((await ctx.db.query("faqs").collect()).length === 0) {
      for (const f of defaultFaqs) {
        await ctx.db.insert("faqs", { ...f, createdAt: now, updatedAt: now });
        faqs++;
      }
    }

    const defaultSocials = [
      { label: "GitHub", href: "https://github.com/mawlid1431", sortOrder: 0 },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/mowlid-mohamoud-haibe-8b7b6a189/", sortOrder: 1 },
      { label: "Twitter", href: "https://twitter.com/malitfx1", sortOrder: 2 },
    ];

    if ((await ctx.db.query("socialLinks").collect()).length === 0) {
      for (const s of defaultSocials) {
        await ctx.db.insert("socialLinks", { ...s, createdAt: now, updatedAt: now });
        socials++;
      }
    }

    return { projects, images, experiences, faqs, socials };
  },
});
