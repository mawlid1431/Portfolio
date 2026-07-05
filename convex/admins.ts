import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

export const getByEmail = internalQuery({
  args: { email: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("admins"),
      email: v.string(),
      passwordHash: v.string(),
      name: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .unique();

    if (!admin) return null;
    return {
      _id: admin._id,
      email: admin.email,
      passwordHash: admin.passwordHash,
      name: admin.name,
    };
  },
});
