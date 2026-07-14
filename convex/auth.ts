import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { checkRateLimit } from "./lib/rateLimit";
import { getSessionByToken, requireSession } from "./lib/session";

export const logout = mutation({
  args: { tokenHash: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("tokenHash", args.tokenHash))
      .unique();

    if (session) {
      await ctx.db.delete("sessions", session._id);
    }
    return null;
  },
});

export const me = query({
  args: { tokenHash: v.string() },
  returns: v.union(
    v.object({
      adminId: v.id("admins"),
      email: v.string(),
      name: v.string(),
      sessionId: v.id("sessions"),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const result = await getSessionByToken(ctx, args.tokenHash);
    if (!result) return null;

    return {
      adminId: result.admin._id,
      email: result.admin.email,
      name: result.admin.name,
      sessionId: result._id,
    };
  },
});

export const updateProfile = mutation({
  args: { tokenHash: v.string(), name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { admin } = await requireSession(ctx, args.tokenHash);
    const name = args.name.trim();
    if (!name) throw new Error("Name is required");
    if (name.length > 80) throw new Error("Name is too long");
    await ctx.db.patch("admins", admin._id, {
      name,
      updatedAt: Date.now(),
    });
    return null;
  },
});

const RESET_CODE_TTL_MS = 15 * 60 * 1000;

/** Max wrong reset-code attempts (per email) before the code is invalidated. */
const RESET_VERIFY_LIMIT = 10;
const RESET_VERIFY_WINDOW_MS = 15 * 60 * 1000;

async function deleteUnusedResetTokens(
  ctx: MutationCtx,
  adminId: Id<"admins">,
): Promise<void> {
  const tokens = await ctx.db
    .query("passwordResetTokens")
    .withIndex("by_admin", (q) => q.eq("adminId", adminId))
    .collect();
  for (const t of tokens) {
    if (!t.usedAt) await ctx.db.delete("passwordResetTokens", t._id);
  }
}

export const requestPasswordReset = mutation({
  args: {
    email: v.string(),
    tokenHash: v.string(),
    rateLimitKey: v.string(),
  },
  // Returns the admin email when one exists, else null — the caller responds
  // generically either way so the endpoint can't be used to enumerate admins.
  returns: v.union(v.object({ email: v.string() }), v.null()),
  handler: async (ctx, args) => {
    // Rate-limit BEFORE the existence check so the check itself is throttled.
    const allowed = await checkRateLimit(ctx, args.rateLimitKey, 3, 60 * 60 * 1000);
    if (!allowed) {
      throw new Error("Too many reset requests. Try again in an hour.");
    }

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();

    if (!admin) return null;

    // Only one live code at a time — kill any prior unused tokens.
    await deleteUnusedResetTokens(ctx, admin._id);

    const now = Date.now();
    await ctx.db.insert("passwordResetTokens", {
      adminId: admin._id,
      tokenHash: args.tokenHash,
      expiresAt: now + RESET_CODE_TTL_MS,
      createdAt: now,
    });

    return { email: admin.email };
  },
});

export const verifyPasswordResetCode = mutation({
  args: {
    tokenHash: v.string(),
    email: v.string(),
    rateLimitKey: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    // Per-email throttle (not IP-scoped) so rotating IPs can't help brute-force
    // the 6-digit code. On lockout, invalidate the live code entirely.
    const allowed = await checkRateLimit(
      ctx,
      args.rateLimitKey,
      RESET_VERIFY_LIMIT,
      RESET_VERIFY_WINDOW_MS,
    );
    if (!allowed) {
      const admin = await ctx.db
        .query("admins")
        .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
        .unique();
      if (admin) await deleteUnusedResetTokens(ctx, admin._id);
      throw new Error(
        "Too many attempts. Please request a new reset code.",
      );
    }

    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("tokenHash", args.tokenHash))
      .unique();

    return !!(
      resetToken &&
      !resetToken.usedAt &&
      resetToken.expiresAt >= Date.now()
    );
  },
});

export const listSessions = query({
  args: { tokenHash: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("sessions"),
      deviceLabel: v.string(),
      userAgent: v.string(),
      createdAt: v.number(),
      lastActiveAt: v.number(),
      isCurrent: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const current = await getSessionByToken(ctx, args.tokenHash);
    if (!current) return [];

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_admin", (q) => q.eq("adminId", current.admin._id))
      .collect();

    return sessions
      .filter((s) => s.expiresAt >= Date.now())
      .map((s) => ({
        _id: s._id,
        deviceLabel: s.deviceLabel,
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        lastActiveAt: s.lastActiveAt,
        isCurrent: s._id === current._id,
      }))
      .sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  },
});

export const revokeSession = mutation({
  args: {
    tokenHash: v.string(),
    sessionId: v.id("sessions"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { admin, session: current } = await requireSession(ctx, args.tokenHash);
    const target = await ctx.db.get("sessions", args.sessionId);

    if (!target || target.adminId !== admin._id) {
      throw new Error("Session not found");
    }

    await ctx.db.delete("sessions", target._id);

    if (target._id === current._id) {
      throw new Error("CURRENT_SESSION_REVOKED");
    }

    return null;
  },
});
