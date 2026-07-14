import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./lib/session";

const educationValidator = v.object({
  _id: v.id("educations"),
  _creationTime: v.number(),
  title: v.string(),
  org: v.string(),
  period: v.string(),
  text: v.string(),
  sortOrder: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const list = query({
  args: { tokenHash: v.string() },
  returns: v.array(educationValidator),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const items = await ctx.db.query("educations").collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listPublic = query({
  args: {},
  returns: v.array(educationValidator),
  handler: async (ctx) => {
    const items = await ctx.db.query("educations").collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    tokenHash: v.string(),
    title: v.string(),
    org: v.string(),
    period: v.string(),
    text: v.string(),
    sortOrder: v.number(),
  },
  returns: v.id("educations"),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const now = Date.now();
    return await ctx.db.insert("educations", {
      title: args.title.trim(),
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
    educationId: v.id("educations"),
    title: v.string(),
    org: v.string(),
    period: v.string(),
    text: v.string(),
    sortOrder: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.patch("educations", args.educationId, {
      title: args.title.trim(),
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
    educationId: v.id("educations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.delete("educations", args.educationId);
    return null;
  },
});
