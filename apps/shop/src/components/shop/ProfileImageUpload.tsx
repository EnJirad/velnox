import { useLanguage } from "@/lib/i18n";
import { api } from "@convex/_generated/api";
import { useAction } from "convex/react";
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
 * VelShop profile image uploader — Backend-controlled Cloudinary upload.
 *
 * Flow:
 * 1. User selects image
 * 2. Client validates type + size
 * 3. Instant preview via objectURL
 * 4. Convert file to base64
 * 5. Call Convex action (server uploads to Cloudinary)
 * 6. Server updates DB + returns permanent URL
 * 7. Old avatar is deleted AFTER successful replacement
 *
 * The browser NEVER contacts Cloudinary directly.
 * The browser NEVER uploads to Convex File Storage directly.
 */
export function ProfileImageUpload({ kind, onPreview, onUploaded, children }: ProfileImageUploadProps) {
  const { t } = useLanguage();
  const uploadAvatar = useAction(api.actions.profile.uploadAvatar);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  /** Convert a File to a base64 data URL string. */
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

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
      // Convert to base64 for the server-side action
      const fileData = await fileToBase64(file);

      // Call backend action — server uploads to Cloudinary, updates DB, deletes old avatar
      const result = await uploadAvatar({
        fileData,
        mimeType: file.type,
        fileSize: file.size,
      });

      if (result.success && result.imageUrl) {
        onUploaded(result.imageUrl);
      } else {
        toast.error(t("profile.imageUploadFailed"));
        onPreview(null);
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
