import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { roleValidator } from "./schema";

/** Get the current signed in user. Returns null if not signed in. */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user === null) return null;
    return user;
  },
});

/** Internal helper to get current user data. */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return await ctx.db.get(userId);
};

/** Check if a role can access velcenter. */
export const canAccessCenter = (role?: string) => {
  return role === "admin" || role === "owner" || role === "staff";
};

/** Check if a role can sell (seller or higher). */
export const canSell = (role?: string) => {
  return role === "seller" || role === "admin" || role === "owner";
};

/** Check if a role is admin or higher. */
export const canAdmin = (role?: string) => {
  return role === "admin" || role === "owner";
};

/**
 * Internal mutation to set/clear seller role on a Convex user.
 * Called by centerAdmin when seller status changes in Neon.
 */
export const setSellerRoleInternal = mutation({
  args: {
    convexUserId: v.string(),
    activated: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await getAuthUserId(ctx);
    if (!identity) throw new Error("Not authenticated");

    const users = await ctx.db.query("users").collect();
    const user = users.find((u) => u._id === args.convexUserId);
    if (!user) throw new Error("User not found");

    if (args.activated) {
      await ctx.db.patch(user._id, { role: "seller" });
    } else {
      await ctx.db.patch(user._id, { role: "customer" });
    }

    return { ok: true };
  },
});

/** Check if an owner has been bootstrapped yet. */
export const ownerBootstrapStatus = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const ownerExists = users.some((u) => u.role === "owner" || u.role === "admin");
    const configured = !!process.env.BOOTSTRAP_OWNER_SECRET;
    return { ownerExists, configured };
  },
});

/** Bootstrap the first owner using the one-time secret code. */
export const claimOwner = mutation({
  args: { bootstrapCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const secret = process.env.BOOTSTRAP_OWNER_SECRET;
    if (!secret) throw new Error("Bootstrap not configured");
    if (args.bootstrapCode !== secret) throw new Error("Invalid bootstrap code");
    const users = await ctx.db.query("users").collect();
    const hasOwner = users.some((u) => u.role === "owner");
    if (hasOwner) throw new Error("An owner already exists");
    await ctx.db.patch(userId, { role: "owner" });
    return { ok: true };
  },
});

/**
 * Update the signed-in user's `image` field on the Convex users table.
 * Called by saveProfileImage after the Neon avatar_url is persisted so that
 * currentUser (and therefore useAuth) returns the correct avatar URL
 * across logout / login / page refresh.
 */
export const patchUserImage = mutation({
  args: { image: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { image: args.image });
    return { ok: true };
  },
});

/** List all users (admin only). */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user || !canAdmin(user.role)) throw new Error("Admin only");
    return await ctx.db.query("users").collect();
  },
});

/** Set user access / role (admin only). */
export const setUserAccess = mutation({
  args: {
    targetUserId: v.id("users"),
    role: roleValidator,
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user || !canAdmin(user.role)) throw new Error("Admin only");
    await ctx.db.patch(args.targetUserId, {
      role: args.role,
      department: args.department,
    });
    return { ok: true };
  },
});
