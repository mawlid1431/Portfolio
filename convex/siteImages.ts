import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./lib/session";

const imageValidator = v.object({
  _id: v.id("siteImages"),
  key: v.string(),
  label: v.string(),
  cloudinaryPath: v.string(),
  updatedAt: v.number(),
});

export const list = query({
  args: { tokenHash: v.string() },
  returns: v.array(imageValidator),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const images = await ctx.db.query("siteImages").collect();
    return images.sort((a, b) => a.key.localeCompare(b.key));
  },
});

export const listPublic = query({
  args: {},
  returns: v.array(imageValidator),
  handler: async (ctx) => {
    return await ctx.db.query("siteImages").collect();
  },
});

export const upsert = mutation({
  args: {
    tokenHash: v.string(),
    key: v.string(),
    label: v.string(),
    cloudinaryPath: v.string(),
  },
  returns: v.id("siteImages"),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);

    const key = args.key.trim().toLowerCase();
    const existing = await ctx.db
      .query("siteImages")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();

    const now = Date.now();
    const data = {
      key,
      label: args.label.trim(),
      cloudinaryPath: args.cloudinaryPath.trim(),
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch("siteImages", existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert("siteImages", data);
  },
});

export const remove = mutation({
  args: {
    tokenHash: v.string(),
    imageId: v.id("siteImages"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.delete("siteImages", args.imageId);
    return null;
  },
});
