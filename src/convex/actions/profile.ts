"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Generate HMAC-SHA1 signature for Cloudinary API.
 */
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
 *
 * Flow:
 * 1. Client selects image → converts to base64 → calls this action
 * 2. Server validates file type and size
 * 3. Server uploads to Cloudinary (secret stays server-side)
 * 4. Server updates database with new image URL
 * 5. Server deletes old image from Cloudinary (after successful replacement)
 * 6. Returns new image URL to client
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

    // 1. Validate MIME type
    if (!ALLOWED_TYPES.includes(args.mimeType.toLowerCase())) {
      console.log(
        `[PROFILE_UPLOAD] requestId=${requestId} INVALID_FILE_TYPE: ${args.mimeType}`,
      );
      throw new Error(
        "ไม่สามารถอัปโหลดรูปโปรไฟล์ได้ อนุญาตเฉพาะ JPEG, PNG, WebP และ AVIF เท่านั้น",
      );
    }

    // 2. Validate file size
    if (args.fileSize <= 0 || args.fileSize > MAX_SIZE) {
      console.log(
        `[PROFILE_UPLOAD] requestId=${requestId} FILE_TOO_LARGE: ${args.fileSize}`,
      );
      throw new Error(
        "ไม่สามารถอัปโหลดรูปโปรไฟล์ได้ ไฟล์ต้องมีขนาดไม่เกิน 10 MB",
      );
    }

    // 3. Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log(`[PROFILE_UPLOAD] requestId=${requestId} UNAUTHORIZED`);
      throw new Error("กรุณาเข้าสู่ระบบก่อนอัปโหลดรูปโปรไฟล์");
    }

    const userId = identity.subject;
    console.log(`[PROFILE_UPLOAD] requestId=${requestId} userId=${userId}`);
    console.log(
      `[PROFILE_UPLOAD] requestId=${requestId} fileSize=${args.fileSize} mimeType=${args.mimeType}`,
    );

    // 4. Decode base64 to buffer
    const base64Data = args.fileData.includes(",")
      ? args.fileData.split(",")[1]
      : args.fileData;

    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const buffer = Buffer.from(bytes);

    // 5. Import Cloudinary service
    const {
      getCloudinaryConfig,
      uploadImageWithSignature,
      deleteImageWithSignature,
    } = await import("../lib/cloudinary");

    const config = getCloudinaryConfig();

    // 6. Get current user data (for old avatar cleanup)
    const { api } = await import("../_generated/api");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentUser: any = await ctx.runQuery(api.users.currentUser);
    const oldPublicId: string | undefined = currentUser?.avatarPublicId;

    // 7. Upload to Cloudinary with signature
    console.log(
      `[PROFILE_UPLOAD] requestId=${requestId} Cloudinary upload started`,
    );

    const publicId = `avatar_${userId}`;
    const folder = "velnox/users/avatar";
    const transformation = "c_fill,g_face,w_512,h_512,q_auto,f_auto";
    const timestamp = Math.floor(Date.now() / 1000);

    const sigParams: Record<string, string | number> = {
      folder,
      overwrite: "1",
      public_id: publicId,
      timestamp,
      transformation,
    };
    const signature = generateSignature(sigParams, config.apiSecret);

    const formData: Record<string, string> = {
      folder,
      overwrite: "1",
      public_id: publicId,
      timestamp: String(timestamp),
      transformation,
      api_key: config.apiKey,
      signature,
    };

    let uploadResult;
    try {
      uploadResult = await uploadImageWithSignature(buffer, formData);
    } catch (error) {
      console.error(
        `[PROFILE_UPLOAD] requestId=${requestId} Cloudinary upload failed:`,
        error,
      );
      throw new Error(
        "ไม่สามารถอัปโหลดรูปโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง",
      );
    }

    console.log(
      `[PROFILE_UPLOAD] requestId=${requestId} Cloudinary upload succeeded publicId=${uploadResult.publicId}`,
    );

    // 8. Update database
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (ctx.runMutation as any)(api.mutations.updateProfileImage, {
        image: uploadResult.secureUrl,
        avatarPublicId: uploadResult.publicId,
      });
    } catch (error) {
      console.error(
        `[PROFILE_UPLOAD] requestId=${requestId} Database update failed:`,
        error,
      );
      const delParams = { timestamp: Math.floor(Date.now() / 1000) };
      const delSig = generateSignature(delParams, config.apiSecret);
      await deleteImageWithSignature(uploadResult.publicId, {
        api_key: config.apiKey,
        timestamp: String(delParams.timestamp),
        signature: delSig,
      });
      throw new Error(
        "ไม่สามารถอัปโหลดรูปโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง",
      );
    }

    console.log(
      `[PROFILE_UPLOAD] requestId=${requestId} Database update succeeded`,
    );

    // 9. Delete old image (best-effort, after successful replacement)
    if (oldPublicId && oldPublicId !== uploadResult.publicId) {
      console.log(
        `[PROFILE_UPLOAD] requestId=${requestId} Deleting old image: ${oldPublicId}`,
      );
      const delParams = { timestamp: Math.floor(Date.now() / 1000) };
      const delSig = generateSignature(delParams, config.apiSecret);
      await deleteImageWithSignature(oldPublicId, {
        api_key: config.apiKey,
        timestamp: String(delParams.timestamp),
        signature: delSig,
      });
    }

    console.log(`[PROFILE_UPLOAD] requestId=${requestId} completed`);

    return {
      success: true,
      imageUrl: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
    };
  },
});
