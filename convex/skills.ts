import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./lib/session";

const skillGroupValidator = v.object({
  _id: v.id("skillGroups"),
  _creationTime: v.number(),
  group: v.string(),
  items: v.array(v.string()),
  sortOrder: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const list = query({
  args: { tokenHash: v.string() },
  returns: v.array(skillGroupValidator),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const items = await ctx.db.query("skillGroups").collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listPublic = query({
  args: {},
  returns: v.array(skillGroupValidator),
  handler: async (ctx) => {
    const items = await ctx.db.query("skillGroups").collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    tokenHash: v.string(),
    group: v.string(),
    items: v.array(v.string()),
    sortOrder: v.number(),
  },
  returns: v.id("skillGroups"),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const now = Date.now();
    return await ctx.db.insert("skillGroups", {
      group: args.group.trim(),
      items: args.items.map((i) => i.trim()).filter(Boolean),
      sortOrder: args.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    tokenHash: v.string(),
    skillGroupId: v.id("skillGroups"),
    group: v.string(),
    items: v.array(v.string()),
    sortOrder: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.patch("skillGroups", args.skillGroupId, {
      group: args.group.trim(),
      items: args.items.map((i) => i.trim()).filter(Boolean),
      sortOrder: args.sortOrder,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutation({
  args: {
    tokenHash: v.string(),
    skillGroupId: v.id("skillGroups"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.delete("skillGroups", args.skillGroupId);
    return null;
  },
});
