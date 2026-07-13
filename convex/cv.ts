import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireSession } from "./lib/session";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function resolveMimeType(fileName: string, mimeType: string): string {
  const trimmed = mimeType.trim().toLowerCase();
  if (ALLOWED_MIME.has(trimmed)) return trimmed;

  const lower = fileName.trim().toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  throw new Error("Only PDF, DOC, or DOCX files are allowed");
}

const cvPublicValidator = v.object({
  url: v.string(),
  fileName: v.string(),
  mimeType: v.string(),
  updatedAt: v.number(),
});

const cvAdminValidator = v.object({
  _id: v.id("cvDocuments"),
  _creationTime: v.number(),
  storageId: v.id("_storage"),
  fileName: v.string(),
  mimeType: v.string(),
  updatedAt: v.number(),
  url: v.union(v.string(), v.null()),
});

/** Public CV for navbar preview / download. */
export const getPublic = query({
  args: {},
  returns: v.union(cvPublicValidator, v.null()),
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("cvDocuments")
      .withIndex("by_updated")
      .order("desc")
      .first();
    if (!doc) return null;

    const url = await ctx.storage.getUrl(doc.storageId);
    if (!url) return null;

    return {
      url,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
      updatedAt: doc.updatedAt,
    };
  },
});

export const getAdmin = query({
  args: { tokenHash: v.string() },
  returns: v.union(cvAdminValidator, v.null()),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const doc = await ctx.db
      .query("cvDocuments")
      .withIndex("by_updated")
      .order("desc")
      .first();
    if (!doc) return null;

    const url = await ctx.storage.getUrl(doc.storageId);
    return {
      ...doc,
      url,
    };
  },
});

export const generateUploadUrl = mutation({
  args: { tokenHash: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    return await ctx.storage.generateUploadUrl();
  },
});

export const save = mutation({
  args: {
    tokenHash: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    mimeType: v.string(),
  },
  returns: v.id("cvDocuments"),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);

    const fileName = args.fileName.trim();
    if (!fileName) {
      throw new Error("File name is required");
    }

    const mimeType = resolveMimeType(fileName, args.mimeType);
    const now = Date.now();
    const existing = await ctx.db.query("cvDocuments").collect();

    for (const doc of existing) {
      await ctx.storage.delete(doc.storageId);
      await ctx.db.delete("cvDocuments", doc._id);
    }

    return await ctx.db.insert("cvDocuments", {
      storageId: args.storageId,
      fileName,
      mimeType,
      updatedAt: now,
    });
  },
});

export const remove = mutation({
  args: { tokenHash: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireSession(ctx, args.tokenHash);
    const existing = await ctx.db.query("cvDocuments").collect();
    for (const doc of existing) {
      await ctx.storage.delete(doc.storageId);
      await ctx.db.delete("cvDocuments", doc._id);
    }
    return null;
  },
});
