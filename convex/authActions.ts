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

async function isPasswordLeaked(password: string): Promise<boolean> {
  const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      { headers: { "Add-Padding": "true" } },
    );
    if (!response.ok) return false;
    const body = await response.text();
    return body.split("\n").some((line) => line.startsWith(`${suffix}:`));
  } catch {
    return false;
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
    return null;
  },
});

export const resetPassword = action({
  args: {
    tokenHash: v.string(),
    newPassword: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
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
