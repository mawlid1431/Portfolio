import type { MutationCtx } from "../_generated/server";

export async function checkRateLimit(
  ctx: MutationCtx,
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();

  if (!existing) {
    await ctx.db.insert("rateLimits", {
      key,
      count: 1,
      windowStart: now,
    });
    return true;
  }

  if (now - existing.windowStart > windowMs) {
    await ctx.db.patch("rateLimits", existing._id, {
      count: 1,
      windowStart: now,
    });
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  await ctx.db.patch("rateLimits", existing._id, {
    count: existing.count + 1,
  });
  return true;
}
