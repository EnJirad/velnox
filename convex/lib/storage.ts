/**
 * Velnox Storage — interfaces, config, key generation, and URL helpers.
 *
 * This file does NOT use node:crypto or any Node.js built-ins.
 * R2 AWS Sig V4 signing is done directly in the Convex action files
 * (customer.ts, commerce.ts) which have "use node".
 *
 * StorageProvider / getStorage() live in backend/storage.ts (not bundled
 * by the Convex bundler) so they can use node:crypto freely.
 */

export const ALLOWED_IMAGE_FORMATS = "jpg,jpeg,png,webp,avif,gif";
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── R2 Configuration ───────────────────────────────────────────────────────

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicDomain: string;
}

export function getR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicDomain = process.env.R2_PUBLIC_DOMAIN;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicDomain) {
    throw new Error(
      "Image storage is not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, " +
        "R2_SECRET_ACCESS_KEY, R2_BUCKET and R2_PUBLIC_DOMAIN in the project Keys/API keys UI.",
    );
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicDomain };
}

export function getR2Host(config: R2Config): string {
  return `${config.bucket}.${config.accountId}.r2.cloudflarestorage.com`;
}

// ─── Upload Signature ────────────────────────────────────────────────────────

export interface UploadSignature {
  /** The signed URL the browser should PUT the file to directly. */
  uploadUrl: string;
  /** The CDN URL where the file will be accessible after upload. */
  cdnUrl: string;
  /** The R2 object key (stored in Neon for deletion). */
  objectKey: string;
  /** Expiry timestamp (ms) for the signed URL. */
  expiresAt: number;
  /** Content-Type the browser must use for the PUT request. */
  contentType: string;
}

export interface StoredFileInfo {
  url: string;
  objectKey: string;
  width: number | null;
  height: number | null;
  format: string;
  bytes: number;
}

// ─── URL Helpers ─────────────────────────────────────────────────────────────

export function cdnUrl(objectKey: string): string {
  const config = getR2Config();
  return `${config.publicDomain}/${objectKey}`;
}

export function extractObjectKey(url: string): string | null {
  if (!url) return null;
  const config = getR2Config();
  const domain = config.publicDomain;
  if (url.startsWith(domain + "/")) {
    return decodeURIComponent(url.slice(domain.length + 1));
  }
  if (url.includes("cloudinary.com") || url.includes("res.cloudinary.com")) {
    return null;
  }
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    if (path.startsWith("/")) {
      return decodeURIComponent(path.slice(1));
    }
  } catch {
    // not a valid URL
  }
  return null;
}

// ─── isStorageConfigured ────────────────────────────────────────────────────

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_DOMAIN,
  );
}

// ─── Object Key Generation ──────────────────────────────────────────────────

export interface ObjectKeyParams {
  ownerType: "user" | "product" | "shop" | "order" | "system";
  ownerId: string;
  kind: string;
  filename: string;
}

/**
 * Generate a deterministic R2 object key.
 * Pattern: {ownerType}/{ownerId}/{kind}/{uuid}.{ext}
 * Never uses original filenames as the primary key.
 */
export function generateObjectKey(params: ObjectKeyParams): string {
  const ext = params.filename.split(".").pop()?.toLowerCase() || "bin";
  const uuid = crypto.randomUUID();
  return `${params.ownerType}/${params.ownerId}/${params.kind}/${uuid}.${ext}`;
}
