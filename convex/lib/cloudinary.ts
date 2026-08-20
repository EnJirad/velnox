/**
 * Server-side Cloudinary image service.
 * Uses the Cloudinary REST API directly — no npm package required.
 * Crypto/HMAC signing is provided by the caller (action file with "use node").
 */

export interface UploadResult {
  secureUrl: string;
  publicId: string;
}

export function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary environment variables");
  }
  return { cloudName, apiKey, apiSecret };
}

/**
 * Upload a buffer to Cloudinary using a pre-generated signature.
 */
export async function uploadImageWithSignature(
  buffer: Buffer,
  formData: Record<string, string>,
): Promise<UploadResult> {
  const { cloudName } = getCloudinaryConfig();

  const boundary = `----Velnox${Date.now()}`;
  const parts: Buffer[] = [];

  function addField(name: string, value: string) {
    parts.push(
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
      ),
    );
  }

  for (const [key, val] of Object.entries(formData)) {
    addField(key, val);
  }

  parts.push(
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="avatar.jpg"\r\nContent-Type: application/octet-stream\r\n\r\n`,
    ),
  );
  parts.push(buffer);
  parts.push(Buffer.from("\r\n"));
  parts.push(Buffer.from(`--${boundary}--\r\n`));

  const body = Buffer.concat(parts);
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[CLOUDINARY] Upload failed:", response.status, errorBody);
    throw new Error(`Cloudinary upload failed: ${response.status}`);
  }

  const result = (await response.json()) as {
    secure_url: string;
    public_id: string;
  };

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Delete an image from Cloudinary using a pre-generated signature.
 */
export async function deleteImageWithSignature(
  publicId: string,
  formData: Record<string, string>,
): Promise<boolean> {
  const { cloudName } = getCloudinaryConfig();
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...formData, public_id: publicId }),
  });

  if (!response.ok) {
    console.error("[CLOUDINARY] Delete failed:", response.status);
    return false;
  }

  const result = (await response.json()) as { result: string };
  return result.result === "ok";
}

export function isValidImageType(mimeType: string): boolean {
  return [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ].includes(mimeType.toLowerCase());
}

export function isValidFileSize(size: number, maxBytes: number): boolean {
  return size > 0 && size <= maxBytes;
}
