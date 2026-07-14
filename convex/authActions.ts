"use node";

import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

type LoginResult = {
  adminId: Id<"admins">;
  email: string;
  name: string;
};

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

const PASSWORD_CHECK_UNAVAILABLE =
  "Couldn't verify password safety right now. Please try again in a moment.";

/**
 * Returns true if the password appears in the HIBP breach corpus.
 * Fails CLOSED: if the check can't complete, it throws rather than returning
 * false, so a breached password is never silently accepted during an outage.
 */
async function isPasswordLeaked(password: string): Promise<boolean> {
  const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  let body: string;
  try {
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      { headers: { "Add-Padding": "true" } },
    );
    if (!response.ok) throw new Error(PASSWORD_CHECK_UNAVAILABLE);
    body = await response.text();
  } catch (error) {
    if (error instanceof Error && error.message === PASSWORD_CHECK_UNAVAILABLE) {
      throw error;
    }
    throw new Error(PASSWORD_CHECK_UNAVAILABLE);
  }
  return body.split("\n").some((line) => line.startsWith(`${suffix}:`));
}

/** Enforced before hashing. bcrypt silently truncates past 72 bytes, and a
 * huge input is a CPU-DoS vector, so cap length. */
function assertPasswordPolicy(password: string): void {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  if (password.length > 200) {
    throw new Error("Password must be at most 200 characters.");
  }
}

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
    tokenHash: v.string(),
    userAgent: v.string(),
    ipHash: v.string(),
    rateLimitKey: v.string(),
  },
  returns: v.object({
    adminId: v.id("admins"),
    email: v.string(),
    name: v.string(),
  }),
  handler: async (ctx, args): Promise<LoginResult> => {
    const allowed = await ctx.runMutation(internal.authMutations.checkRateLimitMutation, {
      key: args.rateLimitKey,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!allowed) {
      throw new Error("Too many login attempts. Try again in 15 minutes.");
    }

    const admin = await ctx.runQuery(internal.admins.getByEmail, {
      email: args.email,
    });

    if (!admin || !(await verifyPassword(args.password, admin.passwordHash))) {
      throw new Error("Invalid email or password");
    }

    return await ctx.runMutation(internal.authMutations.createSession, {
      adminId: admin._id,
      email: admin.email,
      name: admin.name,
      tokenHash: args.tokenHash,
      userAgent: args.userAgent,
      ipHash: args.ipHash,
    });
  },
});

export const changePassword = action({
  args: {
    tokenHash: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.authMutations.getSessionAdmin, {
      tokenHash: args.tokenHash,
    });
    if (!session) throw new Error("Unauthorized");

    if (!(await verifyPassword(args.currentPassword, session.passwordHash))) {
      throw new Error("Current password is incorrect");
    }

    if (args.currentPassword === args.newPassword) {
      throw new Error("New password must be different from current password");
    }

    assertPasswordPolicy(args.newPassword);

    if (await isPasswordLeaked(args.newPassword)) {
      throw new Error(
        "This password has appeared in a data breach. Please choose a different password.",
      );
    }

    const passwordHash = await hashPassword(args.newPassword);
    await ctx.runMutation(internal.authMutations.updatePassword, {
      adminId: session.adminId,
      passwordHash,
    });
    // Evict every other session so a compromised session can't survive a
    // password change (mirrors the reset flow, but keeps the current session).
    await ctx.runMutation(internal.authMutations.deleteOtherSessions, {
      adminId: session.adminId,
      keepTokenHash: args.tokenHash,
    });
    return null;
  },
});

export const resetPassword = action({
  args: {
    tokenHash: v.string(),
    newPassword: v.string(),
    rateLimitKey: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Throttle the completion step per email, matching the verify step, so the
    // reset action can't be brute-forced directly against Convex.
    const allowed = await ctx.runMutation(
      internal.authMutations.checkRateLimitMutation,
      { key: args.rateLimitKey, limit: 10, windowMs: 15 * 60 * 1000 },
    );
    if (!allowed) {
      throw new Error("Too many attempts. Please request a new reset code.");
    }

    assertPasswordPolicy(args.newPassword);

    if (await isPasswordLeaked(args.newPassword)) {
      throw new Error(
        "This password has appeared in a data breach. Please choose a different password.",
      );
    }

    const passwordHash = await hashPassword(args.newPassword);
    await ctx.runMutation(internal.authMutations.completePasswordReset, {
      tokenHash: args.tokenHash,
      passwordHash,
    });
    return null;
  },
});

export const initializeAdmin = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    setupKey: v.string(),
  },
  returns: v.id("admins"),
  handler: async (ctx, args): Promise<Id<"admins">> => {
    assertPasswordPolicy(args.password);

    if (await isPasswordLeaked(args.password)) {
      throw new Error("Password has been found in a data breach. Choose another.");
    }

    const passwordHash = await hashPassword(args.password);
    return await ctx.runMutation(internal.authMutations.createAdmin, {
      email: args.email,
      passwordHash,
      name: args.name,
      setupKey: args.setupKey,
    });
  },
});
