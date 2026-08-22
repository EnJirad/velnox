"use node";

/**
 * Velnox Profile Avatar Upload — Server-side via Convex action.
 *
 * Primary path: Browser → R2 direct (presigned URL from getProfileImageUploadIntent)
 * Fallback: Browser → Convex action → R2 server-side (this action)
 *
 * Uses @aws-sdk/client-s3 for proper R2 S3-compatible uploads.
 * R2 credentials are NEVER exposed to the browser.
 */
import { action } from "../_generated/server";
import { v } from "convex/values";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 10 * 1024 * 1024;

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getDb() {
  const { Pool } = require("@neondatabase/serverless") as typeof import("@neondatabase/serverless");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  return async (sql: string, params?: unknown[]) => {
    const res = await pool.query(sql, params as any[]);
    return res.rows;
  };
}

/**
 * Server-side profile avatar upload (fallback when browser direct fails).
 * Converts base64 → buffer → S3 PutObject → R2.
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

    // Validate file type
    if (!ALLOWED_TYPES.includes(args.mimeType.toLowerCase())) {
      console.log(`[PROFILE_UPLOAD] requestId=${requestId} INVALID_FILE_TYPE: ${args.mimeType}`);
      throw new Error("อนุญาตเฉพาะ JPEG, PNG, WebP และ AVIF เท่านั้น");
    }

    // Validate file size
    if (args.fileSize <= 0 || args.fileSize > MAX_SIZE) {
      console.log(`[PROFILE_UPLOAD] requestId=${requestId} FILE_TOO_LARGE: ${args.fileSize}`);
      throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 10 MB");
    }

    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log(`[PROFILE_UPLOAD] requestId=${requestId} UNAUTHORIZED`);
      throw new Error("กรุณาเข้าสู่ระบบก่อนอัปโหลดรูปโปรไฟล์");
    }
    const userId = identity.subject;
    console.log(`[PROFILE_UPLOAD] requestId=${requestId} userId=${userId}`);

    // Check R2 config
    const r2Bucket = process.env.R2_BUCKET;
    const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN;
    if (!r2Bucket || !r2PublicDomain) {
      throw new Error("R2 not configured — set R2_BUCKET and R2_PUBLIC_DOMAIN");
    }

    // Decode base64 to buffer
    const base64Data = args.fileData.includes(",") ? args.fileData.split(",")[1] : args.fileData;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const buffer = Buffer.from(bytes);

    // Generate R2 object key
    const ext = args.mimeType.includes("png") ? "png" : args.mimeType.includes("webp") ? "webp" : "jpg";
    const objectKey = `user/${userId}/avatar/${crypto.randomUUID()}.${ext}`;
    const cdnUrl = `https://${r2PublicDomain}/${objectKey}`;

    console.log(`[PROFILE_UPLOAD] requestId=${requestId} R2 upload started key=${objectKey} bucket=${r2Bucket}`);

    // Upload to R2 using AWS SDK S3 client
    const s3 = getR2Client();
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: r2Bucket,
          Key: objectKey,
          Body: buffer,
          ContentType: args.mimeType,
        }),
      );
      console.log(`[PROFILE_UPLOAD] requestId=${requestId} R2 upload succeeded`);
    } catch (r2Err: any) {
      console.error(`[PROFILE_UPLOAD] requestId=${requestId} R2 upload FAILED:`, r2Err);
      const msg = r2Err?.message || String(r2Err);
      throw new Error(`R2 upload failed: ${msg}`);
    }

    // Database: create media record + update user
    const db = getDb();

    // Get current user for old avatar cleanup
    let oldAvatarMediaId: string | undefined;
    try {
      const currentUser = await ctx.runQuery(require("../users").currentUser);
      oldAvatarMediaId = (currentUser as Record<string, unknown> | null)?.avatarMediaId as string | undefined;
    } catch {
      // users query may not exist — skip cleanup
    }

    // Create media record
    let mediaId: string;
    try {
      const insertResult = await db(
        "INSERT INTO media (owner_type, owner_id, kind, object_key, cdn_url, mime_type, file_size, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
        ["user", userId, "avatar", objectKey, cdnUrl, args.mimeType, args.fileSize, "active"],
      );
      mediaId = insertResult[0].id;
    } catch (mediaErr) {
      console.error(`[PROFILE_UPLOAD] requestId=${requestId} media record FAILED:`, mediaErr);
      throw new Error("ไม่สามารถบันทึกรูปโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง");
    }

    // Update user avatar
    try {
      await db("UPDATE users SET avatar_url = $2, avatar_media_id = $3 WHERE id = $1", [userId, cdnUrl, mediaId]);
    } catch (dbErr) {
      console.error(`[PROFILE_UPLOAD] requestId=${requestId} user update FAILED:`, dbErr);
      throw new Error("ไม่สามารถบันทึกรูปโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง");
    }

    // Best-effort: clean up old avatar media record
    if (oldAvatarMediaId && oldAvatarMediaId !== mediaId) {
      try {
        await db("UPDATE media SET status = 'deleted', deleted_at = now() WHERE id = $1", [oldAvatarMediaId]);
        console.log(`[PROFILE_UPLOAD] requestId=${requestId} old media cleaned up mediaId=${oldAvatarMediaId}`);
      } catch (delErr) {
        console.error(`[PROFILE_UPLOAD] requestId=${requestId} old avatar cleanup FAILED (non-fatal):`, delErr);
      }
    }

    console.log(`[PROFILE_UPLOAD] requestId=${requestId} completed`);
    return { success: true, imageUrl: cdnUrl, objectKey };
  },
});
