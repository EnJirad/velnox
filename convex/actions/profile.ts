"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_SIZE = 10 * 1024 * 1024;

function generateSignature(
  params: Record<string, string | number>,
  secret: string,
): string {
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHmac("sha1", secret).update(sorted).digest("hex");
}

/**
 * Server-side profile avatar upload.
 * Client → base64 → Convex action → Cloudinary REST API → DB update → client.
 * The browser NEVER uploads directly to Cloudinary.
 */
export const uploadAvatar = action({
  args: {
    fileData: v.string(),
    mimeType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const requestId = crypto.randomUUID().slice(0, 8);
    console.log(`[PROFILE_UPLOAD] requestId=${requestId}`);

    if (!ALLOWED_TYPES.includes(args.mimeType.toLowerCase())) {
      console.log(`[PROFILE_UPLOAD] requestId=${requestId} INVALID_FILE_TYPE: ${args.mimeType}`);
      throw new Error("ไม่สามารถอัปโหลดรูปโปรไฟล์ได้ อนุญาตเฉพาะ JPEG, PNG, WebP และ AVIF เท่านั้น");
    }

    if (args.fileSize <= 0 || args.fileSize > MAX_SIZE) {
      console.log(`[PROFILE_UPLOAD] requestId=${requestId} FILE_TOO_LARGE: ${args.fileSize}`);
      throw new Error("ไม่สามารถอัปโหลดรูปโปรไฟล์ได้ ไฟล์ต้องมีขนาดไม่เกิน 10 MB");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log(`[PROFILE_UPLOAD] requestId=${requestId} UNAUTHORIZED`);
      throw new Error("กรุณาเข้าสู่ระบบก่อนอัปโหลดรูปโปรไฟล์");
    }

    const userId = identity.subject;
    console.log(`[PROFILE_UPLOAD] requestId=${requestId} userId=${userId}`);
    console.log(`[PROFILE_UPLOAD] requestId=${requestId} fileSize=${args.fileSize} mimeType=${args.mimeType}`);

    // Decode base64 to buffer
    const base64Data = args.fileData.includes(",") ? args.fileData.split(",")[1] : args.fileData;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const buffer = Buffer.from(bytes);

    const { getCloudinaryConfig, uploadImageWithSignature, deleteImageWithSignature } = await import("../lib/cloudinary");
    const config = getCloudinaryConfig();

    // Get current user for old avatar cleanup (use typed API)
    const currentUser = await ctx.runQuery(api.users.currentUser);
    const oldPublicId = (currentUser as Record<string, unknown> | null)?.avatarPublicId as string | undefined;

    console.log(`[PROFILE_UPLOAD] requestId=${requestId} Cloudinary upload started`);

    const publicId = `avatar_${userId}`;
    const folder = "velnox/users/avatar";
    const transformation = "c_fill,g_face,w_512,h_512,q_auto,f_auto";
    const timestamp = Math.floor(Date.now() / 1000);

    const sigParams: Record<string, string | number> = { folder, overwrite: "1", public_id: publicId, timestamp, transformation };
    const signature = generateSignature(sigParams, config.apiSecret);

    const formData: Record<string, string> = { folder, overwrite: "1", public_id: publicId, timestamp: String(timestamp), transformation, api_key: config.apiKey, signature };

    let uploadResult;
    try {
      uploadResult = await uploadImageWithSignature(buffer, formData);
    } catch (error) {
      console.error(`[PROFILE_UPLOAD] requestId=${requestId} Cloudinary upload failed:`, error);
      throw new Error("ไม่สามารถอัปโหลดรูปโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง");
    }

    console.log(`[PROFILE_UPLOAD] requestId=${requestId} Cloudinary upload succeeded publicId=${uploadResult.publicId}`);

    try {
      await ctx.runMutation(api.mutations.updateProfileImage, { image: uploadResult.secureUrl, avatarPublicId: uploadResult.publicId });
    } catch (error) {
      console.error(`[PROFILE_UPLOAD] requestId=${requestId} Database update failed:`, error);
      // Rollback: delete the uploaded image since DB update failed
      const dp = { timestamp: Math.floor(Date.now() / 1000) };
      await deleteImageWithSignature(uploadResult.publicId, { api_key: config.apiKey, timestamp: String(dp.timestamp), signature: generateSignature(dp, config.apiSecret) });
      throw new Error("ไม่สามารถอัปโหลดรูปโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง");
    }

    console.log(`[PROFILE_UPLOAD] requestId=${requestId} Database update succeeded`);

    // Clean up old avatar AFTER successful replacement
    if (oldPublicId && oldPublicId !== uploadResult.publicId) {
      console.log(`[PROFILE_UPLOAD] requestId=${requestId} Deleting old image: ${oldPublicId}`);
      const dp = { timestamp: Math.floor(Date.now() / 1000) };
      await deleteImageWithSignature(oldPublicId, { api_key: config.apiKey, timestamp: String(dp.timestamp), signature: generateSignature(dp, config.apiSecret) });
    }

    console.log(`[PROFILE_UPLOAD] requestId=${requestId} completed`);
    return { success: true, imageUrl: uploadResult.secureUrl, publicId: uploadResult.publicId };
  },
});
