import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

/** Idle timeout: a session unused for this long is treated as expired even if
 * its absolute expiry hasn't passed. */
export const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

export async function getSessionByToken(
  ctx: QueryCtx | MutationCtx,
  tokenHash: string,
): Promise<(Doc<"sessions"> & { admin: Doc<"admins"> }) | null> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
    .unique();

  const now = Date.now();
  if (
    !session ||
    session.expiresAt < now ||
    now - session.lastActiveAt > IDLE_TIMEOUT_MS
  ) {
    return null;
  }

  const admin = await ctx.db.get("admins", session.adminId);
  if (!admin) return null;

  return { ...session, admin };
}

export async function requireSession(
  ctx: QueryCtx | MutationCtx,
  tokenHash: string,
): Promise<{ session: Doc<"sessions">; admin: Doc<"admins"> }> {
  const result = await getSessionByToken(ctx, tokenHash);
  if (!result) {
    throw new Error("Unauthorized");
  }

  // Only mutations can write last-active timestamp
  if ("scheduler" in ctx) {
    await (ctx as MutationCtx).db.patch("sessions", result._id, {
      lastActiveAt: Date.now(),
    });
  }

  return { session: result, admin: result.admin };
}

export function parseDeviceLabel(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("iphone")) return "iPhone";
  if (ua.includes("ipad")) return "iPad";
  if (ua.includes("android")) return "Android";
  if (ua.includes("mac os")) return "Mac";
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("linux")) return "Linux";
  return "Unknown device";
}
