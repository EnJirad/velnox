import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";

const http = httpRouter();

auth.addHttpRoutes(http);

/**
 * Health check endpoint.
 */
http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ status: "ok", timestamp: Date.now() }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// Profile Avatar Upload — server-side only (browser never contacts Cloudinary)
//
// Flow: Browser → FormData → This endpoint → Cloudinary → Neon DB → Response
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_AVATAR_BYTES = 10 * 1024 * 1024; // 10 MB
const TAG = "[PROFILE_AVATAR_UPLOAD]";

/** CORS helper — Convex HTTP actions need explicit CORS for cross-origin browser requests. */
function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && origin.startsWith("http") ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Profile-Upload-Trace",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

/** Handle CORS preflight for the avatar upload route. */
http.route({
  path: "/api/profile/avatar",
  method: "OPTIONS",
  handler: httpAction(async (_ctx, request) => {
    const origin = request.headers.get("origin") || null;
    console.log(`${TAG} CORS PREFLIGHT RECEIVED origin=${origin}`);
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }),
});

http.route({
  path: "/api/profile/avatar",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const traceId = request.headers.get("x-profile-upload-trace") || "NO-TRACE";
    const serverTs = Date.now();
    const reqOrigin = request.headers.get("origin") || null;

    /** Helper: build a JSON Response with CORS headers. */
    const jsonResponse = (status: number, body: unknown) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders(reqOrigin) },
      });

    // ── SERVER STEP 01: request received ─────────────────────────────────
    const contentType = request.headers.get("content-type") || "none";
    const contentLength = request.headers.get("content-length") || "unknown";
    const origin = request.headers.get("origin") || "none";
    const userAgent = request.headers.get("user-agent") || "unknown";
    console.log(
      `${TAG} [${traceId}] SERVER STEP 01: request received`,
      `method=${request.method}`,
      `path=${new URL(request.url).pathname}`,
      `origin=${origin}`,
      `content-type=${contentType}`,
      `content-length=${contentLength}`,
      `user-agent=${userAgent.slice(0, 80)}`,
    );

    // ── SERVER STEP 02: authentication ───────────────────────────────────
    console.log(`${TAG} [${traceId}] SERVER STEP 02: authentication started`);
    let identity;
    try {
      identity = await ctx.auth.getUserIdentity();
    } catch (authErr) {
      console.log(`${TAG} [${traceId}] SERVER STEP 02: authentication EXCEPTION`, authErr);
      return jsonResponse(401, { success: false, error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนอัปโหลดรูปโปรไฟล์" } });
    }
    if (!identity) {
      console.log(`${TAG} [${traceId}] SERVER STEP 02: authentication failed — no identity`);
      return jsonResponse(401, { success: false, error: { code: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนอัปโหลดรูปโปรไฟล์" } });
    }
    const userId = identity.subject;
    console.log(`${TAG} [${traceId}] SERVER STEP 02: authentication successful userId=${userId}`);

    // ── SERVER STEP 03: multipart parsing ────────────────────────────────
    console.log(`${TAG} [${traceId}] SERVER STEP 03: parsing multipart request`);
    if (!contentType.includes("multipart/form-data")) {
      console.log(`${TAG} [${traceId}] SERVER STEP 03: INVALID content-type=${contentType}`);
      return jsonResponse(400, { success: false, error: { code: "INVALID_CONTENT_TYPE", message: "ต้องส่งไฟล์ในรูปแบบ multipart/form-data" } });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (formErr) {
      console.log(`${TAG} [${traceId}] SERVER STEP 03: FORMDATA PARSE ERROR`, formErr);
      return jsonResponse(400, { success: false, error: { code: "MISSING_FILE", message: "ไม่สามารถอ่านไฟล์รูปภาพได้ กรุณาลองใหม่อีกครั้ง" } });
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      console.log(`${TAG} [${traceId}] SERVER STEP 03: no file found in form data`);
      return jsonResponse(400, { success: false, error: { code: "MISSING_FILE", message: "กรุณาเลือกรูปภาพก่อนอัปโหลด" } });
    }
    console.log(
      `${TAG} [${traceId}] SERVER STEP 03: multipart parsed`,
      `filename=${file.name}`,
      `size=${file.size}`,
      `mime=${file.type}`,
    );

    // ── SERVER STEP 04: validation ───────────────────────────────────────
    console.log(`${TAG} [${traceId}] SERVER STEP 04: validating file`);
    if (!ALLOWED_AVATAR_TYPES.includes(file.type.toLowerCase())) {
      console.log(`${TAG} [${traceId}] SERVER STEP 04: validation FAILED — invalid type: ${file.type}`);
      return jsonResponse(400, { success: false, error: { code: "INVALID_FILE_TYPE", message: "รองรับเฉพาะ JPG, PNG และ WebP เท่านั้น" } });
    }
    if (file.size <= 0 || file.size > MAX_AVATAR_BYTES) {
      console.log(`${TAG} [${traceId}] SERVER STEP 04: validation FAILED — size: ${file.size}`);
      return jsonResponse(400, { success: false, error: { code: "FILE_TOO_LARGE", message: "รูปภาพต้องมีขนาดไม่เกิน 10 MB" } });
    }
    console.log(`${TAG} [${traceId}] SERVER STEP 04: validation passed`);

    // ── Read file bytes ──────────────────────────────────────────────────
    let bytes: Uint8Array;
    try {
      const ab = await file.arrayBuffer();
      bytes = new Uint8Array(ab);
      console.log(`${TAG} [${traceId}] SERVER STEP 04b: file read complete bytes=${bytes.byteLength}`);
    } catch (readErr) {
      console.log(`${TAG} [${traceId}] SERVER STEP 04: file read ERROR`, readErr);
      return jsonResponse(400, { success: false, error: { code: "INVALID_IMAGE", message: "ไม่สามารถอ่านไฟล์รูปภาพได้" } });
    }

    // ── SERVER STEP 05: storage upload ───────────────────────────────────
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      console.log(`${TAG} [${traceId}] SERVER STEP 05: CLOUDINARY NOT CONFIGURED`);
      return jsonResponse(500, { success: false, error: { code: "UPLOAD_FAILED", message: "ระบบอัปโหลดรูปภาพยังไม่พร้อมใช้งาน" } });
    }
    console.log(`${TAG} [${traceId}] SERVER STEP 05: cloud name=${cloudName} (key and secret redacted)`);

    // Generate signed upload params
    const folder = `velnox/profiles/${userId}`;
    const publicId = `avatar-${userId.slice(0, 8)}-${serverTs}-${Math.random().toString(36).slice(2, 8)}`;
    const timestamp = Math.floor(serverTs / 1000);
    const allowedFormats = "jpg,jpeg,png,webp";
    const maxBytes = String(MAX_AVATAR_BYTES);

    const signParams: Record<string, string> = {
      timestamp: String(timestamp),
      folder,
      public_id: publicId,
      allowed_formats: allowedFormats,
      max_bytes: maxBytes,
    };
    const sorted = Object.keys(signParams)
      .sort()
      .map((k) => `${k}=${signParams[k]}`)
      .join("&");

    // HMAC-SHA1 via Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(apiSecret),
      { name: "HMAC", hash: "SHA-1" },
      false,
      ["sign"],
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(sorted));
    const signature = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    console.log(`${TAG} [${traceId}] SERVER STEP 05: storage upload started folder=${folder} publicId=${publicId}`);

    // Build multipart body for Cloudinary
    const boundary = `----Velnox${serverTs}`;
    const parts: Uint8Array[] = [];

    function addField(name: string, value: string) {
      parts.push(
        new TextEncoder().encode(
          `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
        ),
      );
    }

    addField("folder", folder);
    addField("public_id", publicId);
    addField("timestamp", String(timestamp));
    addField("api_key", apiKey);
    addField("signature", signature);
    addField("allowed_formats", allowedFormats);
    addField("max_bytes", maxBytes);

    parts.push(
      new TextEncoder().encode(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="avatar.jpg"\r\nContent-Type: ${file.type}\r\n\r\n`,
      ),
    );
    parts.push(bytes);
    parts.push(new TextEncoder().encode("\r\n"));
    parts.push(new TextEncoder().encode(`--${boundary}--\r\n`));

    let totalLength = 0;
    for (const part of parts) totalLength += part.byteLength;
    const body = new Uint8Array(totalLength);
    let bodyOffset = 0;
    for (const part of parts) {
      body.set(part, bodyOffset);
      bodyOffset += part.byteLength;
    }
    console.log(`${TAG} [${traceId}] SERVER STEP 05: multipart body assembled totalBytes=${totalLength}`);

    // ── SERVER STEP 06: storage upload response ──────────────────────────
    let cloudinaryResult: { secure_url: string; public_id: string };
    try {
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
        },
        body: body,
      });

      console.log(`${TAG} [${traceId}] SERVER STEP 06: storage response received status=${cloudRes.status} ok=${cloudRes.ok}`);

      if (!cloudRes.ok) {
        const errBody = await cloudRes.text();
        console.log(`${TAG} [${traceId}] SERVER STEP 06: storage upload FAILED status=${cloudRes.status} body=${errBody.slice(0, 300)}`);
        return jsonResponse(502, { success: false, error: { code: "UPLOAD_FAILED", message: "ไม่สามารถอัปโหลดรูปโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง" } });
      }
      cloudinaryResult = await cloudRes.json() as { secure_url: string; public_id: string };
    } catch (netErr) {
      console.log(`${TAG} [${traceId}] SERVER STEP 06: storage NETWORK ERROR`, netErr);
      return jsonResponse(502, { success: false, error: { code: "UPLOAD_FAILED", message: "ไม่สามารถเชื่อมต่อกับระบบจัดเก็บรูปภาพได้ กรุณาลองใหม่อีกครั้ง" } });
    }
    console.log(
      `${TAG} [${traceId}] SERVER STEP 06: storage upload succeeded`,
      `public_id=${cloudinaryResult.public_id}`,
      `url_hostname=${new URL(cloudinaryResult.secure_url).hostname}`,
    );

    // ── SERVER STEP 07: database update ──────────────────────────────────
    console.log(`${TAG} [${traceId}] SERVER STEP 07: database update started`);
    const { neon } = await import("@neondatabase/serverless");
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log(`${TAG} [${traceId}] SERVER STEP 07: DATABASE NOT CONFIGURED`);
      return jsonResponse(500, { success: false, error: { code: "DATABASE_UPDATE_FAILED", message: "ไม่สามารถบันทึกรูปโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง" } });
    }
    const sql = neon(dbUrl);

    // Get old avatar for cleanup
    let oldUrl: string | null = null;
    try {
      const oldRows = await sql`SELECT avatar_url FROM users WHERE auth_id = ${userId} LIMIT 1`;
      oldUrl = (oldRows as Array<{ avatar_url: string | null }>)[0]?.avatar_url ?? null;
      console.log(`${TAG} [${traceId}] SERVER STEP 07: old avatar URL ${oldUrl ? "exists" : "none"}`);
    } catch (oldErr) {
      console.log(`${TAG} [${traceId}] SERVER STEP 07: old avatar query failed (non-fatal)`, oldErr);
    }

    // Update
    const newUrl = cloudinaryResult.secure_url;
    try {
      await sql`UPDATE users SET avatar_url = ${newUrl} WHERE auth_id = ${userId}`;
      console.log(`${TAG} [${traceId}] SERVER STEP 07: database update completed`);
    } catch (dbErr) {
      console.log(`${TAG} [${traceId}] SERVER STEP 07: database update FAILED`, dbErr);
      return jsonResponse(500, { success: false, error: { code: "DATABASE_UPDATE_FAILED", message: "ไม่สามารถบันทึกรูปโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง" } });
    }

    // ── SERVER STEP 08: old avatar cleanup ───────────────────────────────
    console.log(`${TAG} [${traceId}] SERVER STEP 08: old avatar cleanup started`);
    if (oldUrl && oldUrl !== newUrl) {
      try {
        const oldPublicId = oldUrl.includes("/upload/")
          ? oldUrl.split("/upload/")[1]?.replace(/\.[^.]+$/, "")
          : null;
        if (oldPublicId) {
          const delTs = Math.floor(Date.now() / 1000);
          const delSignParams: Record<string, string> = { timestamp: String(delTs) };
          const delSorted = Object.keys(delSignParams)
            .sort()
            .map((k) => `${k}=${delSignParams[k]}`)
            .join("&");
          const delEncoder = new TextEncoder();
          const delKey = await crypto.subtle.importKey(
            "raw",
            delEncoder.encode(apiSecret),
            { name: "HMAC", hash: "SHA-1" },
            false,
            ["sign"],
          );
          const delSigBuf = await crypto.subtle.sign("HMAC", delKey, delEncoder.encode(delSorted));
          const delSignature = Array.from(new Uint8Array(delSigBuf))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

          await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_id: oldPublicId, timestamp: delTs, api_key: apiKey, signature: delSignature }),
          });
          console.log(`${TAG} [${traceId}] SERVER STEP 08: old avatar deleted publicId=${oldPublicId}`);
        } else {
          console.log(`${TAG} [${traceId}] SERVER STEP 08: could not extract old publicId from URL (skipping)`);
        }
      } catch (delErr) {
        console.log(`${TAG} [${traceId}] SERVER STEP 08: old avatar delete FAILED (non-fatal)`, delErr);
      }
    } else {
      console.log(`${TAG} [${traceId}] SERVER STEP 08: no old avatar to clean up`);
    }
    console.log(`${TAG} [${traceId}] SERVER STEP 08: old avatar cleanup completed`);

    // ── SERVER STEP 09: sending response ─────────────────────────────────
    console.log(`${TAG} [${traceId}] SERVER STEP 09: sending success response url_hostname=${new URL(newUrl).hostname}`);
    return jsonResponse(200, { success: true, avatarUrl: newUrl });
  }),
});

export default http;
