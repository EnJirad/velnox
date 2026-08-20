import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Query to get the avatar URL for the current or specified user.
 * Used by the frontend to display profile avatars from Convex File Storage
 * with fallback to legacy Cloudinary URL.
 */
export const avatarUrl = query({
  args: {
    targetUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let userId;
    if (args.targetUserId) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("_id"), args.targetUserId))
        .first();
      if (!user) return { url: null };
      userId = user._id;
    } else {
      const authUserId = await getAuthUserId(ctx);
      if (!authUserId) return { url: null };
      userId = authUserId;
    }

    const user = await ctx.db.get(userId);
    if (!user) return { url: null };

    // Try Convex storage first
    if (user.avatarMediaId) {
      const media = await ctx.db.get(user.avatarMediaId as any);
      if (media && "storageId" in media) {
        const url = await ctx.storage.getUrl((media as any).storageId);
        if (url) return { url };
      }
    }

    // Fall back to legacy image field (Cloudinary URL)
    return { url: user.image ?? null };
  },
});

/**
 * Step 1: Generate an upload URL for the authenticated user's profile avatar.
 * The client will POST the file directly to this URL (Convex File Storage).
 */
export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("กรุณาเข้าสู่ระบบก่อนอัปโหลดรูปโปรไฟล์");
    }

    const user = await ctx.db.get(userId);
    const oldMediaId = user?.avatarMediaId ?? null;

    const uploadUrl = await ctx.storage.generateUploadUrl();

    return { uploadUrl, oldMediaId };
  },
});

/**
 * Step 2: After the client uploads the file to Convex Storage,
 * call this mutation to validate, create a media record,
 * update the user's avatarMediaId, and delete the old storage asset.
 */
export const saveAvatar = mutation({
  args: {
    storageId: v.id("_storage"),
    mimeType: v.string(),
    fileSize: v.number(),
    oldMediaId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("กรุณาเข้าสู่ระบบก่อนอัปโหลดรูปโปรไฟล์");
    }

    // Server-side validation
    if (!ALLOWED_TYPES.includes(args.mimeType.toLowerCase())) {
      await ctx.storage.delete(args.storageId);
      throw new Error("ไม่สามารถอัปโหลดรูปโปรไฟล์ได้ อนุญาตเฉพาะ JPEG, PNG และ WebP เท่านั้น");
    }

    if (args.fileSize <= 0 || args.fileSize > MAX_SIZE) {
      await ctx.storage.delete(args.storageId);
      throw new Error("ไม่สามารถอัปโหลดรูปโปรไฟล์ได้ ไฟล์ต้องมีขนาดไม่เกิน 10 MB");
    }

    const storageMetadata = await ctx.storage.getMetadata(args.storageId);
    if (!storageMetadata) {
      throw new Error("ไม่พบไฟล์ที่อัปโหลด กรุณาลองใหม่อีกครั้ง");
    }

    // Create the profileMedia record
    const mediaId = await ctx.db.insert("profileMedia", {
      userId: userId.toString(),
      storageId: args.storageId,
      kind: "avatar",
      mimeType: args.mimeType,
      size: args.fileSize,
      status: "active",
      createdAt: Date.now(),
    });

    // Update user's avatarMediaId + image URL (for backward compat)
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    await ctx.db.patch(userId, {
      avatarMediaId: mediaId.toString(),
      image: imageUrl ?? undefined,
    });

    const url = await ctx.storage.getUrl(args.storageId);

    // Best-effort delete old media AFTER successful save
    if (args.oldMediaId) {
      try {
        const oldMedia = await ctx.db.get(args.oldMediaId as any);
        if (oldMedia && "storageId" in oldMedia) {
          await ctx.storage.delete((oldMedia as any).storageId);
          await ctx.db.delete(args.oldMediaId as any);
        }
      } catch (err) {
        console.error("[PROFILE_MEDIA] Old image cleanup failed:", err);
      }
    }

    // Remove legacy Cloudinary reference if present
    const user = await ctx.db.get(userId);
    if (user?.avatarPublicId) {
      await ctx.db.patch(userId, { avatarPublicId: undefined });
    }

    return { success: true, url, mediaId: mediaId.toString() };
  },
});
