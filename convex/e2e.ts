import { createHash } from "crypto";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

const RESET_CODE_TTL_MS = 15 * 60 * 1000;

function assertE2eSecret(secret: string): void {
  const expected = process.env.E2E_TEST_SECRET;
  if (!expected || secret !== expected) {
    throw new Error("Forbidden");
  }
}

function resetTokenHash(email: string, code: string): string {
  return createHash("sha256")
    .update(`${email.toLowerCase().trim()}:${code.trim()}`)
    .digest("hex");
}

/** Test-only: insert a known reset code for forgot-password E2E flows. */
export const seedPasswordResetToken = mutation({
  args: {
    secret: v.string(),
    email: v.string(),
    code: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    assertE2eSecret(args.secret);

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();

    if (!admin) {
      throw new Error("Admin not found");
    }

    const now = Date.now();
    await ctx.db.insert("passwordResetTokens", {
      adminId: admin._id,
      tokenHash: resetTokenHash(args.email, args.code),
      expiresAt: now + RESET_CODE_TTL_MS,
      createdAt: now,
    });

    return null;
  },
});

/** Test-only: remove projects created during E2E (slug prefix `e2e-`). */
export const cleanupTestProjects = mutation({
  args: { secret: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    assertE2eSecret(args.secret);

    const projects = await ctx.db.query("projects").collect();
    let removed = 0;

    for (const project of projects) {
      if (project.slug.startsWith("e2e-")) {
        await ctx.db.delete("projects", project._id);
        removed++;
      }
    }

    return removed;
  },
});

/** Test-only: remove experiences with role prefix `E2E `. */
export const cleanupTestExperiences = mutation({
  args: { secret: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    assertE2eSecret(args.secret);

    const items = await ctx.db.query("experiences").collect();
    let removed = 0;

    for (const item of items) {
      if (item.role.startsWith("E2E ")) {
        await ctx.db.delete("experiences", item._id);
        removed++;
      }
    }

    return removed;
  },
});

/** Test-only: remove FAQs with question prefix `E2E:`. */
export const cleanupTestFaqs = mutation({
  args: { secret: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    assertE2eSecret(args.secret);

    const items = await ctx.db.query("faqs").collect();
    let removed = 0;

    for (const item of items) {
      if (item.question.startsWith("E2E:")) {
        await ctx.db.delete("faqs", item._id);
        removed++;
      }
    }

    return removed;
  },
});

/** Test-only: remove contact messages from E2E test email. */
export const cleanupTestMessages = mutation({
  args: { secret: v.string(), email: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    assertE2eSecret(args.secret);

    const messages = await ctx.db.query("contactMessages").collect();
    let removed = 0;
    const email = args.email.toLowerCase();

    for (const message of messages) {
      if (message.email.toLowerCase() === email) {
        await ctx.db.delete("contactMessages", message._id);
        removed++;
      }
    }

    return removed;
  },
});
