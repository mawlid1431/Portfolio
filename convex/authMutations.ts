import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { checkRateLimit } from "./lib/rateLimit";
import { parseDeviceLabel } from "./lib/session";

const SESSION_DAYS = 30;

export const checkRateLimitMutation = internalMutation({
  args: {
    key: v.string(),
    limit: v.number(),
    windowMs: v.number(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    return await checkRateLimit(ctx, args.key, args.limit, args.windowMs);
  },
});

export const createSession = internalMutation({
  args: {
    adminId: v.id("admins"),
    email: v.string(),
    name: v.string(),
    tokenHash: v.string(),
    userAgent: v.string(),
    ipHash: v.string(),
  },
  returns: v.object({
    adminId: v.id("admins"),
    email: v.string(),
    name: v.string(),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("sessions", {
      adminId: args.adminId,
      tokenHash: args.tokenHash,
      deviceLabel: parseDeviceLabel(args.userAgent),
      userAgent: args.userAgent,
      ipHash: args.ipHash,
      createdAt: now,
      lastActiveAt: now,
      expiresAt: now + SESSION_DAYS * 24 * 60 * 60 * 1000,
    });

    return {
      adminId: args.adminId,
      email: args.email,
      name: args.name,
    };
  },
});

export const getSessionAdmin = internalQuery({
  args: { tokenHash: v.string() },
  returns: v.union(
    v.object({
      adminId: v.id("admins"),
      passwordHash: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("tokenHash", args.tokenHash))
      .unique();

    if (!session || session.expiresAt < Date.now()) return null;

    const admin = await ctx.db.get("admins", session.adminId);
    if (!admin) return null;

    return { adminId: admin._id, passwordHash: admin.passwordHash };
  },
});

export const updatePassword = internalMutation({
  args: {
    adminId: v.id("admins"),
    passwordHash: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("admins", args.adminId, {
      passwordHash: args.passwordHash,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const completePasswordReset = internalMutation({
  args: {
    tokenHash: v.string(),
    passwordHash: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("tokenHash", args.tokenHash))
      .unique();

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < Date.now()) {
      throw new Error("Invalid or expired reset link");
    }

    await ctx.db.patch("admins", resetToken.adminId, {
      passwordHash: args.passwordHash,
      updatedAt: Date.now(),
    });

    await ctx.db.patch("passwordResetTokens", resetToken._id, {
      usedAt: Date.now(),
    });

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_admin", (q) => q.eq("adminId", resetToken.adminId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete("sessions", session._id);
    }

    return null;
  },
});

export const createAdmin = internalMutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    setupKey: v.string(),
  },
  returns: v.id("admins"),
  handler: async (ctx, args) => {
    const setupKeyEnv = process.env.ADMIN_SETUP_KEY;
    if (!setupKeyEnv) {
      throw new Error("Admin setup is not configured");
    }
    if (args.setupKey !== setupKeyEnv) {
      throw new Error("Invalid setup key");
    }

    const admins = await ctx.db.query("admins").collect();
    if (admins.length > 0) {
      throw new Error("Admin already exists");
    }

    const now = Date.now();
    return await ctx.db.insert("admins", {
      email: args.email.toLowerCase(),
      passwordHash: args.passwordHash,
      name: args.name,
      createdAt: now,
      updatedAt: now,
    });
  },
});
