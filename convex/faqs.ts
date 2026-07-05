import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./lib/session";

const faqValidator = v.object({
  _id: v.id("faqs"),
  question: v.string(),
  answer: v.string(),
  sortOrder: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const list = query({
  args: { tokenHash: v.string() },
  returns: v.array(faqValidator),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const items = await ctx.db.query("faqs").collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listPublic = query({
  args: {},
  returns: v.array(faqValidator),
  handler: async (ctx) => {
    const items = await ctx.db.query("faqs").collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    tokenHash: v.string(),
    question: v.string(),
    answer: v.string(),
    sortOrder: v.number(),
  },
  returns: v.id("faqs"),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const now = Date.now();
    return await ctx.db.insert("faqs", {
      question: args.question.trim(),
      answer: args.answer.trim(),
      sortOrder: args.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    tokenHash: v.string(),
    faqId: v.id("faqs"),
    question: v.string(),
    answer: v.string(),
    sortOrder: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.patch("faqs", args.faqId, {
      question: args.question.trim(),
      answer: args.answer.trim(),
      sortOrder: args.sortOrder,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutation({
  args: {
    tokenHash: v.string(),
    faqId: v.id("faqs"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    await ctx.db.delete("faqs", args.faqId);
    return null;
  },
});
