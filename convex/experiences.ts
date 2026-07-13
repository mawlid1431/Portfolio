import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./lib/session";

const experienceValidator = v.object({
  _id: v.id("experiences"),
  _creationTime: v.number(),
  role: v.string(),
  org: v.string(),
  period: v.string(),
  text: v.string(),
  sortOrder: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const list = query({
  args: { tokenHash: v.string() },
  returns: v.array(experienceValidator),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const items = await ctx.db.query("experiences").collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listPublic = query({
  args: {},
  returns: v.array(experienceValidator),
  handler: async (ctx) => {
    const items = await ctx.db.query("experiences").collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    tokenHash: v.string(),
    role: v.string(),
    org: v.string(),
    period: v.string(),
    text: v.string(),
    sortOrder: v.number(),
  },
  returns: v.id("experiences"),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const now = Date.now();
    return await ctx.db.insert("experiences", {
      role: args.role.trim(),
      org: args.org.trim(),
      period: args.period.trim(),
      text: args.text.trim(),
      sortOrder: args.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    tokenHash: v.string(),
    experienceId: v.id("experiences"),
    role: v.string(),
    org: v.string(),
    period: v.string(),
    text: v.string(),
    sortOrder: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.patch("experiences", args.experienceId, {
      role: args.role.trim(),
      org: args.org.trim(),
      period: args.period.trim(),
      text: args.text.trim(),
      sortOrder: args.sortOrder,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutation({
  args: {
    tokenHash: v.string(),
    experienceId: v.id("experiences"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.delete("experiences", args.experienceId);
    return null;
  },
});
