import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./lib/session";
import { sanitizeLinkHref } from "./lib/url";

const socialValidator = v.object({
  _id: v.id("socialLinks"),
  _creationTime: v.number(),
  label: v.string(),
  href: v.string(),
  sortOrder: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const list = query({
  args: { tokenHash: v.string() },
  returns: v.array(socialValidator),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const items = await ctx.db.query("socialLinks").collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listPublic = query({
  args: {},
  returns: v.array(socialValidator),
  handler: async (ctx) => {
    const items = await ctx.db.query("socialLinks").collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    tokenHash: v.string(),
    label: v.string(),
    href: v.string(),
    sortOrder: v.number(),
  },
  returns: v.id("socialLinks"),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const now = Date.now();
    return await ctx.db.insert("socialLinks", {
      label: args.label.trim(),
      href: sanitizeLinkHref(args.href),
      sortOrder: args.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    tokenHash: v.string(),
    socialId: v.id("socialLinks"),
    label: v.string(),
    href: v.string(),
    sortOrder: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.patch("socialLinks", args.socialId, {
      label: args.label.trim(),
      href: sanitizeLinkHref(args.href),
      sortOrder: args.sortOrder,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutation({
  args: {
    tokenHash: v.string(),
    socialId: v.id("socialLinks"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.delete("socialLinks", args.socialId);
    return null;
  },
});
