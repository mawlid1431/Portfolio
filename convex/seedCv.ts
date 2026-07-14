import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { CV_EDUCATIONS, CV_EXPERIENCES, CV_FAQS, CV_SKILL_GROUPS } from "./cvData";

/**
 * Seed the database with CV content from cvData.ts.
 * Run: npx convex run seedCv:run
 *
 * Upserts by natural key (experience: role+org, education: title+org,
 * skills: group name) so it is safe to re-run — existing rows are updated,
 * missing rows are inserted, nothing is deleted.
 */
export const run = internalMutation({
  args: {},
  returns: v.object({
    experiences: v.object({ inserted: v.number(), updated: v.number() }),
    educations: v.object({ inserted: v.number(), updated: v.number() }),
    skillGroups: v.object({ inserted: v.number(), updated: v.number() }),
    faqs: v.object({ inserted: v.number(), updated: v.number() }),
  }),
  handler: async (ctx) => {
    const now = Date.now();

    const existingExperiences = await ctx.db.query("experiences").collect();
    let expInserted = 0;
    let expUpdated = 0;
    for (const [index, exp] of CV_EXPERIENCES.entries()) {
      const match = existingExperiences.find(
        (e) =>
          e.role.toLowerCase() === exp.role.toLowerCase() &&
          e.org.toLowerCase() === exp.org.toLowerCase(),
      );
      if (match) {
        await ctx.db.patch("experiences", match._id, {
          period: exp.period,
          text: exp.text,
          sortOrder: index,
          updatedAt: now,
        });
        expUpdated++;
      } else {
        await ctx.db.insert("experiences", {
          ...exp,
          sortOrder: index,
          createdAt: now,
          updatedAt: now,
        });
        expInserted++;
      }
    }

    const existingEducations = await ctx.db.query("educations").collect();
    let eduInserted = 0;
    let eduUpdated = 0;
    for (const [index, edu] of CV_EDUCATIONS.entries()) {
      const match = existingEducations.find(
        (e) =>
          e.title.toLowerCase() === edu.title.toLowerCase() &&
          e.org.toLowerCase() === edu.org.toLowerCase(),
      );
      if (match) {
        await ctx.db.patch("educations", match._id, {
          period: edu.period,
          text: edu.text,
          sortOrder: index,
          updatedAt: now,
        });
        eduUpdated++;
      } else {
        await ctx.db.insert("educations", {
          ...edu,
          sortOrder: index,
          createdAt: now,
          updatedAt: now,
        });
        eduInserted++;
      }
    }

    const existingSkillGroups = await ctx.db.query("skillGroups").collect();
    let skillInserted = 0;
    let skillUpdated = 0;
    for (const [index, group] of CV_SKILL_GROUPS.entries()) {
      const match = existingSkillGroups.find(
        (g) => g.group.toLowerCase() === group.group.toLowerCase(),
      );
      if (match) {
        await ctx.db.patch("skillGroups", match._id, {
          items: group.items,
          sortOrder: index,
          updatedAt: now,
        });
        skillUpdated++;
      } else {
        await ctx.db.insert("skillGroups", {
          ...group,
          sortOrder: index,
          createdAt: now,
          updatedAt: now,
        });
        skillInserted++;
      }
    }

    const existingFaqs = await ctx.db.query("faqs").collect();
    let faqInserted = 0;
    let faqUpdated = 0;
    for (const [index, faq] of CV_FAQS.entries()) {
      const match = existingFaqs.find(
        (f) => f.question.toLowerCase() === faq.question.toLowerCase(),
      );
      if (match) {
        await ctx.db.patch("faqs", match._id, {
          answer: faq.answer,
          sortOrder: index,
          updatedAt: now,
        });
        faqUpdated++;
      } else {
        await ctx.db.insert("faqs", {
          ...faq,
          sortOrder: index,
          createdAt: now,
          updatedAt: now,
        });
        faqInserted++;
      }
    }

    return {
      experiences: { inserted: expInserted, updated: expUpdated },
      educations: { inserted: eduInserted, updated: eduUpdated },
      skillGroups: { inserted: skillInserted, updated: skillUpdated },
      faqs: { inserted: faqInserted, updated: faqUpdated },
    };
  },
});
