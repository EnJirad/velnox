/**
 * Velnox Storage Adapter — R2 via the official AWS SDK.
 *
 * This file is in backend/ (NOT convex/) so it can freely use Node.js APIs.
 * It re-exports helpers from convex/lib/storage for backward compatibility
 * and adds the StorageProvider interface + getStorage() factory.
 *
 * Presigned URLs and deletions use @aws-sdk/client-s3 + s3-request-presigner —
 * never hand-rolled AWS Signature V4.
 */
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  ALLOWED_IMAGE_FORMATS,
  MAX_IMAGE_BYTES,
  type R2Config,
  type UploadSignature,
  type StoredFileInfo,
  type ObjectKeyParams,
  getR2Config,
  getR2Host,
  isStorageConfigured,
  generateObjectKey,
  cdnUrl,
  extractObjectKey,
} from "../convex/lib/storage";

export {
  ALLOWED_IMAGE_FORMATS,
  MAX_IMAGE_BYTES,
  type R2Config,
  type UploadSignature,
  type StoredFileInfo,
  type ObjectKeyParams,
  getR2Config,
  getR2Host,
  isStorageConfigured,
  generateObjectKey,
  cdnUrl,
  extractObjectKey,
};

// ─── StorageProvider Interface ───────────────────────────────────────────────

export interface StorageProvider {
  readonly name: string;
  getSignedUploadUrl(objectKey: string, contentType: string, expiresIn?: number): Promise<UploadSignature>;
  deleteFile(objectKey: string): Promise<void>;
  originalUrl(objectKey: string): string;
  displayUrl(objectKey: string): string;
  thumbUrl(objectKey: string): string;
  extractObjectKey(url: string): string | null;
}

// ─── R2 Storage Implementation ───────────────────────────────────────────────

class R2StorageProvider implements StorageProvider {
  readonly name = "r2";

  private client(): S3Client {
    const config = getR2Config();
    return new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async getSignedUploadUrl(objectKey: string, contentType: string, expiresIn = 300): Promise<UploadSignature> {
    const config = getR2Config();
    const uploadUrl = await getSignedUrl(
      this.client(),
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: objectKey,
        ContentType: contentType,
      }),
      { expiresIn },
    );
    // Security: never log the full presigned URL or signature.
    console.log(`[R2_PRESIGN] PUT host=${new URL(uploadUrl).hostname} key=${objectKey} expires=${expiresIn}s`);
    return { uploadUrl, cdnUrl: cdnUrl(objectKey), objectKey, expiresAt: Date.now() + expiresIn * 1000, contentType };
  }

  async deleteFile(objectKey: string): Promise<void> {
    const config = getR2Config();
    await this.client().send(new DeleteObjectCommand({ Bucket: config.bucket, Key: objectKey }));
  }

  originalUrl(objectKey: string): string {
    return cdnUrl(objectKey);
  }

  displayUrl(objectKey: string): string {
    return cdnUrl(objectKey);
  }

  thumbUrl(objectKey: string): string {
    return cdnUrl(objectKey);
  }

  extractObjectKey(url: string): string | null {
    return extractObjectKey(url);
  }
}

let cached: StorageProvider | null = null;

/** Get the configured storage provider (server-side only). */
export function getStorage(): StorageProvider {
  if (cached) return cached;
  cached = new R2StorageProvider();
  return cached;
}
