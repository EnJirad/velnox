import { useLanguage } from "@/lib/i18n";
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

interface ProfileImageUploadProps {
  kind: "avatar" | "cover";
  onPreview: (url: string | null) => void;
  onUploaded: (url: string) => void;
  children: ReactNode;
}

/**
 * VelShop profile image uploader — Convex File Storage version.
 *
 * Flow:
 * 1. User selects image
 * 2. Client validates type + size
 * 3. Instant preview via objectURL
 * 4. Ask backend for upload URL (authenticated mutation)
 * 5. POST file directly to Convex Storage (no Cloudinary)
 * 6. Tell backend to save storageId + update user profile
 * 7. Old avatar is deleted AFTER successful replacement
 *
 * The browser NEVER contacts Cloudinary for profile images.
 */
export function ProfileImageUpload({ kind, onPreview, onUploaded, children }: ProfileImageUploadProps) {
  const { t } = useLanguage();
  const generateUploadUrl = useMutation(api.media.generateAvatarUploadUrl);
  const saveAvatar = useMutation(api.media.saveAvatar);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = async (file: File) => {
    // Client-side validation
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t("profile.imageTypeError"));
      resetInput();
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t("profile.imageSizeError"));
      resetInput();
      return;
    }

    const preview = URL.createObjectURL(file);
    onPreview(preview);
    setUploading(true);

    try {
      // Step 1: Get authenticated upload URL from Convex
      const { uploadUrl, oldMediaId } = await generateUploadUrl();

      // Step 2: POST file directly to Convex File Storage
      // Do NOT manually set Content-Type — let the browser generate the multipart boundary
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Convex Storage upload failed (${response.status})`);
      }

      const { storageId } = (await response.json()) as { storageId: string };

      // Step 3: Tell backend to save the media record + update profile
      const result = await saveAvatar({
        storageId: storageId as any,
        mimeType: file.type,
        fileSize: file.size,
        oldMediaId: oldMediaId ?? undefined,
      });

      // Step 4: Update UI with the permanent URL from Convex Storage
      const permanentUrl = result.url;
      if (permanentUrl) {
        onUploaded(permanentUrl);
      }
    } catch (err) {
      console.error("Profile image upload error:", err);
      toast.error(t("profile.imageUploadFailed"));
      onPreview(null);
    } finally {
      setUploading(false);
      resetInput();
    }
  };

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
