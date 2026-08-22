"use node";

/**
 * Velnox R2 Presigner — official AWS SDK implementation.
 *
 * Replaces the previous hand-rolled AWS Signature V4 construction with
 * @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner (getSignedUrl), which
 * guarantees spec-correct X-Amz-Date formatting, header canonicalization,
 * and signed-header consistency.
 *
 * Signed headers produced by the SDK presigner for a PutObjectCommand with
 * ContentType set: `content-type;host` — the browser PUT must therefore send
 * EXACTLY `Content-Type: <file.type>` and nothing else.
 *
 * Security: never log uploadUrl / X-Amz-Signature / credentials. Only log
 * hostname + objectKey + method + type/size + response status.
 */

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Config } from "./storage";

let cachedClient: S3Client | null = null;

function getS3Client(): S3Client {
  if (cachedClient) return cachedClient;
  const config = getR2Config();
  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  return cachedClient;
}

/** Safe diagnostic info — never includes the full URL or signature. */
export function describeUploadUrl(uploadUrl: string): string {
  try {
    const parsed = new URL(uploadUrl);
    return `${parsed.protocol}//${parsed.hostname}/…`;
  } catch {
    return "<unparseable-url>";
  }
}

/**
 * Generate a presigned PUT URL for direct browser-to-R2 upload using the
 * official AWS SDK (PutObjectCommand + getSignedUrl).
 */
export async function createSignedUploadUrl(
  objectKey: string,
  contentType: string,
  expiresIn = 300,
): Promise<{
  uploadUrl: string;
  cdnUrl: string;
  objectKey: string;
  expiresAt: number;
  contentType: string;
}> {
  const config = getR2Config();
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn });
  console.log(
    `[R2_PRESIGN] PUT host=${new URL(uploadUrl).hostname} key=${objectKey} contentType=${contentType} expires=${expiresIn}s`,
  );
  return {
    uploadUrl,
    cdnUrl: `${config.publicDomain}/${objectKey}`,
    objectKey,
    expiresAt: Date.now() + expiresIn * 1000,
    contentType,
  };
}

/** Delete an object from R2 via the official SDK. Treats 404/no-op as success. */
export async function deleteR2File(objectKey: string): Promise<void> {
  try {
    const config = getR2Config();
    await getS3Client().send(
      new DeleteObjectCommand({ Bucket: config.bucket, Key: objectKey }),
    );
  } catch (err: unknown) {
    // NoSuchKey-style failures are non-fatal for cleanup paths.
    const msg = err instanceof Error ? err.message : String(err);
    if (/NoSuchKey|NotFound|404/i.test(msg)) return;
    console.error(`[R2_DELETE] failed key=${objectKey}: ${msg}`);
    throw new Error(`R2 delete failed: ${msg}`);
  }
}
