import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * One-off repair: point site images back at the devmalitos/ Cloudinary
 * assets and feature the live projects so the home page isn't empty.
 * Run: npx convex run fixSiteData:run --prod
 */
const CORRECT_IMAGE_PATHS: Record<string, string> = {
  hero: "devmalitos/hero",
  working: "devmalitos/working",
  portrait: "devmalitos/portrait",
  flag: "devmalitos/flag",
  graduation: "devmalitos/graduation",
};

const FEATURED_TITLES = ["Mubarak Charity", "BuildSom", "SkyDanubia"];

export const run = internalMutation({
  args: {},
  returns: v.object({ imagesFixed: v.number(), projectsFeatured: v.number() }),
  handler: async (ctx) => {
    const now = Date.now();

    let imagesFixed = 0;
    const images = await ctx.db.query("siteImages").collect();
    for (const img of images) {
      const correct = CORRECT_IMAGE_PATHS[img.key];
      if (correct && img.cloudinaryPath !== correct) {
        await ctx.db.patch("siteImages", img._id, {
          cloudinaryPath: correct,
          updatedAt: now,
        });
        imagesFixed++;
      }
    }

    let projectsFeatured = 0;
    const projects = await ctx.db.query("projects").collect();
    for (const project of projects) {
      const shouldFeature = FEATURED_TITLES.includes(project.title);
      if (shouldFeature && !project.featured) {
        await ctx.db.patch("projects", project._id, {
          featured: true,
          updatedAt: now,
        });
        projectsFeatured++;
      }
    }

    return { imagesFixed, projectsFeatured };
  },
});
