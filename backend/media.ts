/**
 * Velnox Media Service
 *
 * Manages media metadata in Neon. Binary files live in R2.
 * Supports avatars, covers, product images, store images, banners.
 *
 * Architecture:
 *   1. Request signed upload URL → R2
 *   2. Browser uploads directly to R2
 *   3. Confirm upload → create media record in Neon
 *   4. Update owner's media_id (avatar_media_id, cover_media_id, etc.)
 *   5. CDN URL is the canonical reference
 *
 * Never store binary data in Neon or Convex.
 */
import type { Db } from "./db";
import { generateObjectKey, getSignedUploadUrl, deleteR2Object, getCdnUrl, isR2Configured } from "./r2";

// ─── Types ──────────────────────────────────────────────────────────────────

export type MediaOwnerType = "user" | "product" | "shop" | "order" | "system";
export type MediaKind = "avatar" | "cover" | "product_image" | "store_image" | "banner" | "document" | "other";

export interface MediaRecord {
  id: string;
  ownerType: MediaOwnerType;
  ownerId: string;
  kind: MediaKind;
  objectKey: string;
  cdnUrl: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  status: string;
  createdAt: Date;
}

export interface UploadUrlResult {
  uploadUrl: string;
  objectKey: string;
  cdnUrl: string;
  mediaId: string;
}

// ─── Upload URL Generation ──────────────────────────────────────────────────

/**
 * Generate a signed upload URL for direct browser-to-R2 upload.
 * The browser uploads directly — no binary through the server.
 */
export async function requestUploadUrl(
  db: Db,
  params: {
    ownerType: MediaOwnerType;
    ownerId: string;
    kind: MediaKind;
    filename: string;
    mimeType: string;
  },
): Promise<UploadUrlResult> {
  if (!isR2Configured()) {
    throw new Error("R2 is not configured — cannot generate upload URL");
  }

  // Generate object key
  const objectKey = generateObjectKey({
    ownerType: params.ownerType,
    ownerId: params.ownerId,
    kind: params.kind,
    filename: params.filename,
  });

  // Get signed upload URL (5 min expiry)
  const signed = await getSignedUploadUrl(objectKey, params.mimeType, 300);

  // Create pending media record
  const rows = await db(
    `INSERT INTO media (owner_type, owner_id, kind, object_key, cdn_url, mime_type, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'processing')
     RETURNING id`,
    [params.ownerType, params.ownerId, params.kind, objectKey, signed.cdnUrl, params.mimeType],
  );

  const mediaId = rows[0].id;
  console.log(`[MEDIA_UPLOAD] requestUpload ownerType=${params.ownerType} ownerId=${params.ownerId} kind=${params.kind} mediaId=${mediaId}`);

  return {
    uploadUrl: signed.uploadUrl,
    objectKey,
    cdnUrl: signed.cdnUrl,
    mediaId,
  };
}

// ─── Upload Confirmation ────────────────────────────────────────────────────

/**
 * Confirm that a file was successfully uploaded to R2.
 * Updates the media record with file metadata and sets status to 'active'.
 */
export async function confirmUpload(
  db: Db,
  mediaId: string,
  metadata: {
    fileSize: number;
    width?: number;
    height?: number;
  },
): Promise<MediaRecord> {
  const rows = await db(
    `UPDATE media
     SET status = 'active', file_size = $2, width = $3, height = $4
     WHERE id = $1 AND status = 'processing'
     RETURNING *`,
    [mediaId, metadata.fileSize, metadata.width ?? null, metadata.height ?? null],
  );

  if (!rows[0]) {
    throw new Error(`Media record ${mediaId} not found or already confirmed`);
  }

  console.log(`[MEDIA_UPLOAD] confirmed mediaId=${mediaId} size=${metadata.fileSize}`);
  return mapMediaRow(rows[0]);
}

// ─── Owner Media Update ─────────────────────────────────────────────────────

/**
 * Update an owner's media reference (e.g., user's avatar_media_id).
 * Also cleans up the old media record if replacing.
 */
export async function setOwnerMedia(
  db: Db,
  params: {
    ownerType: MediaOwnerType;
    ownerId: string;
    kind: MediaKind;
    mediaId: string;
  },
): Promise<void> {
  const columnMap: Record<string, string> = {
    "user:avatar": "avatar_media_id",
    "user:cover": "cover_media_id",
  };

  const key = `${params.ownerType}:${params.kind}`;
  const column = columnMap[key];

  if (column && params.ownerType === "user") {
    // Get old media ID for cleanup
    const old = await db(
      `SELECT ${column} AS old_media_id FROM users WHERE id = $1`,
      [params.ownerId],
    );

    // Update user's media reference
    await db(
      `UPDATE users SET ${column} = $2 WHERE id = $1`,
      [params.ownerId, params.mediaId],
    );

    // Delete old media if replacing
    if (old[0]?.old_media_id && String(old[0].old_media_id) !== params.mediaId) {
      const oldMedia = await db(
        "SELECT object_key, status FROM media WHERE id = $1",
        [old[0].old_media_id],
      );
      if (oldMedia[0]?.object_key && oldMedia[0].status === "active") {
        // Best-effort R2 delete — don't fail if it errors
        try {
          await deleteR2Object(oldMedia[0].object_key);
          await db("UPDATE media SET status = 'deleted', deleted_at = now() WHERE id = $1", [old[0].old_media_id]);
          console.log(`[MEDIA_UPLOAD] old media deleted mediaId=${old[0].old_media_id}`);
        } catch (err) {
          console.error(`[MEDIA_UPLOAD] old media delete failed (non-fatal):`, err);
        }
      }
    }

    console.log(`[MEDIA_UPLOAD] owner updated ownerType=${params.ownerType} ownerId=${params.ownerId} kind=${params.kind} mediaId=${params.mediaId}`);
  }
}

// ─── Media Deletion ─────────────────────────────────────────────────────────

/**
 * Soft-delete a media record and remove the R2 object.
 */
export async function deleteMedia(db: Db, mediaId: string): Promise<void> {
  const rows = await db(
    "SELECT object_key, status FROM media WHERE id = $1",
    [mediaId],
  );

  if (!rows[0]) return;

  if (rows[0].status === "active" && rows[0].object_key) {
    try {
      await deleteR2Object(rows[0].object_key);
    } catch (err) {
      console.error(`[MEDIA_DELETE] R2 delete failed (non-fatal):`, err);
    }
  }

  await db("UPDATE media SET status = 'deleted', deleted_at = now() WHERE id = $1", [mediaId]);
  console.log(`[MEDIA_DELETE] mediaId=${mediaId}`);
}

// ─── Media Query ────────────────────────────────────────────────────────────

/**
 * Get all active media for an owner.
 */
export async function getMediaForOwner(
  db: Db,
  ownerType: MediaOwnerType,
  ownerId: string,
  kind?: MediaKind,
): Promise<MediaRecord[]> {
  let query = "SELECT * FROM media WHERE owner_type = $1 AND owner_id = $2 AND status = 'active'";
  const params: unknown[] = [ownerType, ownerId];

  if (kind) {
    query += " AND kind = $3";
    params.push(kind);
  }

  query += " ORDER BY created_at DESC";

  const rows = await db(query, params);
  return rows.map(mapMediaRow);
}

/**
 * Get a single media record by ID.
 */
export async function getMedia(db: Db, mediaId: string): Promise<MediaRecord | null> {
  const rows = await db("SELECT * FROM media WHERE id = $1", [mediaId]);
  return rows[0] ? mapMediaRow(rows[0]) : null;
}

// ─── CDN URL Helpers ────────────────────────────────────────────────────────

/**
 * Get the CDN URL for a media record.
 * Returns the stored CDN URL, falling back to construction from the object key.
 */
export function getMediaCdnUrl(media: MediaRecord): string {
  if (media.cdnUrl) return media.cdnUrl;
  return getCdnUrl(media.objectKey);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function mapMediaRow(row: Record<string, unknown>): MediaRecord {
  return {
    id: String(row.id),
    ownerType: row.owner_type as MediaOwnerType,
    ownerId: String(row.owner_id),
    kind: row.kind as MediaKind,
    objectKey: String(row.object_key),
    cdnUrl: String(row.cdn_url),
    mimeType: String(row.mime_type),
    fileSize: Number(row.file_size || 0),
    width: row.width ? Number(row.width) : null,
    height: row.height ? Number(row.height) : null,
    status: String(row.status),
    createdAt: new Date(row.created_at as string),
  };
}
