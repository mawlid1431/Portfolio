import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  admins: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    adminId: v.id("admins"),
    tokenHash: v.string(),
    deviceLabel: v.string(),
    userAgent: v.string(),
    ipHash: v.string(),
    createdAt: v.number(),
    lastActiveAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_token", ["tokenHash"])
    .index("by_admin", ["adminId"]),

  projects: defineTable({
    slug: v.string(),
    title: v.string(),
    pitch: v.string(),
    tag: v.optional(v.string()),
    year: v.number(),
    imagePath: v.string(),
    liveUrl: v.optional(v.string()),
    featured: v.boolean(),
    status: v.union(v.literal("live"), v.literal("draft")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_created", ["createdAt"])
    .index("by_year", ["year"]),

  siteImages: defineTable({
    key: v.string(),
    label: v.string(),
    cloudinaryPath: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  experiences: defineTable({
    role: v.string(),
    org: v.string(),
    period: v.string(),
    text: v.string(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_sort", ["sortOrder"]),

  faqs: defineTable({
    question: v.string(),
    answer: v.string(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_sort", ["sortOrder"]),

  socialLinks: defineTable({
    label: v.string(),
    href: v.string(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_sort", ["sortOrder"]),

  /** Single active CV document for the public site navbar */
  cvDocuments: defineTable({
    storageId: v.id("_storage"),
    fileName: v.string(),
    mimeType: v.string(),
    updatedAt: v.number(),
  }).index("by_updated", ["updatedAt"]),

  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    budget: v.string(),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  passwordResetTokens: defineTable({
    adminId: v.id("admins"),
    tokenHash: v.string(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_token", ["tokenHash"])
    .index("by_admin", ["adminId"]),

  rateLimits: defineTable({
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
  }).index("by_key", ["key"]),

  idempotencyKeys: defineTable({
    key: v.string(),
    resultId: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_key", ["key"]),
});
