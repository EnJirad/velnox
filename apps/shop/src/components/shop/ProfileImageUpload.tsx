import { useLanguage } from "@/lib/i18n";
import { Loader2 } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Derive the Convex HTTP site URL from VITE_CONVEX_URL.
 * VITE_CONVEX_URL = "https://<name>.convex.cloud"
 * HTTP actions   = "https://<name>.convex.site"
 */
function getConvexHttpBase(): string {
  const raw = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_CONVEX_URL;
  if (!raw) return "";
  return raw.replace(".convex.cloud", ".convex.site");
}

// ── Trace ID generation ─────────────────────────────────────────────────────
function generateTraceId(): string {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PA-${date}-${rand}`;
}

// ── Safe platform detection ──────────────────────────────────────────────────
function detectPlatform(): string {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Macintosh|Mac OS X/.test(ua)) return "macOS";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

function detectBrowser(): string {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "unknown";
  if (/CriOS/.test(ua)) return "Chrome-iOS";
  if (/FxiOS/.test(ua)) return "Firefox-iOS";
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari";
  if (/Chrome/.test(ua) && !/Edge/.test(ua)) return "Chrome";
  if (/Firefox/.test(ua)) return "Firefox";
  if (/Edge/.test(ua)) return "Edge";
  return "Unknown";
}

// ── Debug trace state ────────────────────────────────────────────────────────
export interface TraceStep {
  step: string;
  label: string;
  ok: boolean;
  detail?: string;
  ts: number;
}

// ── Upload result exposed to parent for debug panel ──────────────────────────
interface UploadTraceResult {
  traceId: string;
  steps: TraceStep[];
  lastOk: boolean;
  error?: string;
}

interface ProfileImageUploadProps {
  kind: "avatar" | "cover";
  onPreview: (url: string | null) => void;
  onUploaded: (url: string) => void;
  children: ReactNode;
  /** Optional debug callback — receives trace after every upload attempt. */
  onTrace?: (trace: UploadTraceResult) => void;
}

const TAG = "[PROFILE_AVATAR_UPLOAD]";

/**
 * VelShop profile image uploader — Backend-controlled upload with full tracing.
 *
 * Flow:
 * 1. User selects image via native file input
 * 2. Client validates type + size
 * 3. Instant preview via objectURL
 * 4. POST FormData to /api/profile/avatar (Convex HTTP endpoint)
 * 5. Server validates → uploads to Cloudinary → updates DB → deletes old
 * 6. Returns permanent avatarUrl
 *
 * Every upload attempt produces a unique TRACE_ID logged at each step.
 */
export function ProfileImageUpload({ kind, onPreview, onUploaded, children, onTrace }: ProfileImageUploadProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const resetInput = useCallback(() => {
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      const traceId = generateTraceId();
      const steps: TraceStep[] = [];
      const platform = detectPlatform();
      const browser = detectBrowser();
      const now = () => Date.now();

      const log = (step: string, label: string, ok: boolean, detail?: string) => {
        const entry: TraceStep = { step, label, ok, detail, ts: now() };
        steps.push(entry);
        const icon = ok ? "✓" : "✗";
        console.log(`${TAG} [${traceId}] ${step} ${icon} ${label}${detail ? " — " + detail : ""}`);
      };

      console.log(`${TAG} [${traceId}] STEP 01: upload flow started (kind=${kind} platform=${platform} browser=${browser})`);

      // ── STEP 02: File selected ──────────────────────────────────────────
      console.log(
        `${TAG} [${traceId}] STEP 02: file selected name=${file.name} size=${file.size} type=${file.type} lastModified=${file.lastModified}`,
      );
      log("02", "File selected", true, `name=${file.name} size=${file.size} type=${file.type}`);

      // ── STEP 03: Validation ─────────────────────────────────────────────
      console.log(`${TAG} [${traceId}] STEP 03: validating file`);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        log("03", "Validation", false, `invalid type: ${file.type}`);
        toast.error(t("profile.imageTypeError"));
        resetInput();
        onTrace?.({ traceId, steps, lastOk: false, error: `Invalid file type: ${file.type}` });
        return;
      }
      if (file.size <= 0) {
        log("03", "Validation", false, "file is empty (0 bytes)");
        toast.error(t("profile.imageTypeError"));
        resetInput();
        onTrace?.({ traceId, steps, lastOk: false, error: "File is empty" });
        return;
      }
      if (file.size > MAX_BYTES) {
        log("03", "Validation", false, `file too large: ${file.size} bytes (max ${MAX_BYTES})`);
        toast.error(t("profile.imageSizeError"));
        resetInput();
        onTrace?.({ traceId, steps, lastOk: false, error: `File too large: ${file.size}` });
        return;
      }
      log("03", "Validation", true, "passed");

      const preview = URL.createObjectURL(file);
      onPreview(preview);
      setUploading(true);

      try {
        // ── STEP 04: FormData creation ────────────────────────────────────
        console.log(`${TAG} [${traceId}] STEP 04: creating FormData`);
        const formData = new FormData();
        formData.append("file", file);
        const hasFile = formData.has("file");
        console.log(`${TAG} [${traceId}] STEP 04: file appended to FormData, has("file")=${hasFile}`);
        log("04", "FormData created", hasFile, `has("file")=${hasFile}`);

        // ── STEP 05: Request preparation ──────────────────────────────────
        const path = kind === "cover" ? "/api/profile/cover" : "/api/profile/avatar";
        const convexBase = getConvexHttpBase();
        const endpoint = convexBase ? `${convexBase}${path}` : path;
        const online = typeof navigator !== "undefined" ? navigator.onLine : "unknown";
        console.log(
          `${TAG} [${traceId}] STEP 05: preparing upload request endpoint=${endpoint} method=POST credentials=include online=${online} fileSize=${file.size}`,
        );
        log("05", "Request prepared", true, `endpoint=${endpoint} online=${online}`);

        // ── STEP 06: FETCH START ──────────────────────────────────────────
        console.log(`${TAG} [${traceId}] STEP 06: FETCH START → ${endpoint}`);
        log("06", "Fetch started", true, `→ ${endpoint}`);

        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        // ── STEP 07: Response received ────────────────────────────────────
        console.log(
          `${TAG} [${traceId}] STEP 07: FETCH RESPONSE RECEIVED status=${res.status} statusText=${res.statusText} ok=${res.ok} url=${new URL(res.url).pathname}`,
        );
        log("07", "Response received", res.ok, `status=${res.status} ok=${res.ok}`);

        // ── STEP 08: Parse response ───────────────────────────────────────
        console.log(`${TAG} [${traceId}] STEP 08: parsing response`);
        let data: {
          success?: boolean;
          avatarUrl?: string;
          coverUrl?: string;
          error?: { code?: string; message?: string };
        };
        try {
          data = await res.json();
        } catch (parseErr) {
          console.log(`${TAG} [${traceId}] STEP 08: RESPONSE PARSE ERROR`, parseErr);
          log("08", "Parse response", false, "failed to parse JSON");
          toast.error(t("profile.imageUploadFailed"));
          onPreview(null);
          onTrace?.({ traceId, steps, lastOk: false, error: "Failed to parse response JSON" });
          return;
        }

        if (res.ok && data.success) {
          console.log(`${TAG} [${traceId}] STEP 08: response parsed success=true`);
          log("08", "Parse response", true, "success=true");

          // ── STEP 09: success path ──────────────────────────────────────
          const url = kind === "cover" ? data.coverUrl : data.avatarUrl;
          if (url) {
            console.log(`${TAG} [${traceId}] STEP 10: upload successful, url hostname=${new URL(url).hostname}`);
            log("10", "Upload successful", true, `hostname=${new URL(url).hostname}`);

            console.log(`${TAG} [${traceId}] STEP 11: refreshing profile data`);
            log("11", "Profile refresh", true);

            console.log(`${TAG} [${traceId}] STEP 12: avatar URL received, rendering`);
            log("12", "Avatar rendered", true);

            onUploaded(url);
            console.log(`${TAG} [${traceId}] COMPLETE SUCCESS`);
          } else {
            console.log(`${TAG} [${traceId}] STEP 10: success but no URL returned`);
            log("10", "Upload result", false, "success=true but no URL");
            toast.error(t("profile.imageUploadFailed"));
            onPreview(null);
            console.log(`${TAG} [${traceId}] COMPLETE FAILURE`);
          }
        } else {
          const errMsg = data.error?.message || t("profile.imageUploadFailed");
          const errCode = data.error?.code || "UNKNOWN";
          console.log(`${TAG} [${traceId}] STEP 08: backend returned error code=${errCode} message=${errMsg}`);
          log("08", "Backend error", false, `code=${errCode} msg=${errMsg}`);
          toast.error(errMsg);
          onPreview(null);
          console.log(`${TAG} [${traceId}] COMPLETE FAILURE`);
        }
      } catch (err: unknown) {
        // ── STEP 09: FETCH EXCEPTION ──────────────────────────────────────
        const e = err instanceof Error ? err : new Error(String(err));
        const online = typeof navigator !== "undefined" ? navigator.onLine : "unknown";
        console.log(
          `${TAG} [${traceId}] STEP 09: FETCH EXCEPTION name=${e.name} message=${e.message} online=${online} platform=${platform} browser=${browser}`,
        );
        console.log(`${TAG} [${traceId}] STEP 09: FETCH EXCEPTION stack:`, e.stack);
        log("09", "Fetch exception", false, `${e.name}: ${e.message} (online=${online})`);
        toast.error(t("profile.imageUploadFailed"));
        onPreview(null);
        console.log(`${TAG} [${traceId}] COMPLETE FAILURE`);
      } finally {
        setUploading(false);
        resetInput();
        onTrace?.({ traceId, steps, lastOk: steps[steps.length - 1]?.ok ?? false });
      }
    },
    [kind, onPreview, onUploaded, resetInput, t, onTrace],
  );

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-slate-900/80 disabled:opacity-70"
        aria-label={t(kind === "cover" ? "profile.changeCover" : "profile.changeAvatar")}
      >
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : children}
      </button>
    </>
  );
}

// ── Debug Panel (shown in dev/preview only) ──────────────────────────────────
export function UploadDebugPanel({ trace }: { trace: UploadTraceResult | null }) {
  const [open, setOpen] = useState(false);

  if (!trace) return null;

  return (
    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 text-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 font-mono text-amber-800"
      >
        <span>
          🔍 Profile Upload Debug — <span className="font-bold">{trace.traceId}</span>
        </span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-amber-200 px-3 pb-2 pt-1">
          <div className="mb-1 font-mono text-amber-600">
            Last status: {trace.lastOk ? "✅ SUCCESS" : "❌ FAILED"}
            {trace.error && <span className="ml-2 text-red-600">— {trace.error}</span>}
          </div>
          <div className="space-y-0.5">
            {trace.steps.map((s) => (
              <div key={s.step + s.label} className="flex items-start gap-2 font-mono">
                <span className={s.ok ? "text-green-600" : "text-red-600"}>{s.ok ? "✓" : "✗"}</span>
                <span className="w-6 shrink-0">{s.step}</span>
                <span className="flex-1">{s.label}</span>
                {s.detail && <span className="text-amber-600">{s.detail}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
