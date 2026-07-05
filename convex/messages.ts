import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkRateLimit } from "./lib/rateLimit";
import { getSessionByToken, requireSession } from "./lib/session";

const messageValidator = v.object({
  _id: v.id("contactMessages"),
  name: v.string(),
  email: v.string(),
  budget: v.string(),
  message: v.string(),
  read: v.boolean(),
  createdAt: v.number(),
});

export const list = query({
  args: { tokenHash: v.string() },
  returns: v.array(messageValidator),
  handler: async (ctx, args) => {
    const session = await getSessionByToken(ctx, args.tokenHash);
    if (!session) return [];

    return await ctx.db.query("contactMessages").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    budget: v.string(),
    message: v.string(),
    rateLimitKey: v.string(),
    idempotencyKey: v.string(),
  },
  returns: v.id("contactMessages"),
  handler: async (ctx, args) => {
    const allowed = await checkRateLimit(ctx, args.rateLimitKey, 5, 60 * 60 * 1000);
    if (!allowed) {
      throw new Error("Too many messages sent. Please try again in an hour.");
    }

    const existingKey = await ctx.db
      .query("idempotencyKeys")
      .withIndex("by_key", (q) => q.eq("key", args.idempotencyKey))
      .unique();

    if (existingKey && existingKey.expiresAt >= Date.now()) {
      return existingKey.resultId as Id<"contactMessages">;
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("contactMessages", {
      name: args.name.trim(),
      email: args.email.trim().toLowerCase(),
      budget: args.budget.trim(),
      message: args.message.trim(),
      read: false,
      createdAt: now,
    });

    await ctx.db.insert("idempotencyKeys", {
      key: args.idempotencyKey,
      resultId: messageId,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000,
    });

    return messageId;
  },
});

export const markRead = mutation({
  args: {
    tokenHash: v.string(),
    messageId: v.id("contactMessages"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.patch("contactMessages", args.messageId, { read: true });
    return null;
  },
});

export const markUnread = mutation({
  args: {
    tokenHash: v.string(),
    messageId: v.id("contactMessages"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.patch("contactMessages", args.messageId, { read: false });
    return null;
  },
});

export const remove = mutation({
  args: {
    tokenHash: v.string(),
    messageId: v.id("contactMessages"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.delete("contactMessages", args.messageId);
    return null;
  },
});
