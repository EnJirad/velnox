import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * Update the current user's profile image URL and avatar public ID.
 * Called by the profile upload action after successful Cloudinary upload.
 */
export const updateProfileImage = mutation({
  args: {
    image: v.string(),
    avatarPublicId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    await ctx.db.patch(userId, {
      image: args.image,
      avatarPublicId: args.avatarPublicId,
    });

    return { success: true };
  },
});

/**
 * Update the current user's profile information.
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        zip: v.optional(v.string()),
        country: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.address !== undefined) updates.address = args.address;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(userId, updates);
    }

    return { success: true };
  },
});
