import { useCallback, useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Upload } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
  className?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-6 w-6",
};

/**
 * Server-side profile avatar upload component.
 *
 * Upload flow:
 * 1. User selects file
 * 2. Client validates file type and size
 * 3. Client converts to base64
 * 4. Client calls Convex action (server-side upload to Cloudinary)
 * 5. Server updates database
 * 6. Client shows new avatar on success
 *
 * The browser NEVER uploads directly to Cloudinary.
 */
export function ProfileAvatar({
  size = "lg",
  editable = false,
  className,
}: ProfileAvatarProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const uploadAvatar = useAction(api.actions.profile.uploadAvatar);

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "V";

  const currentImage = previewUrl || user?.image || undefined;

  /**
   * Convert a File to base64 data URL.
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Handle file selection.
   */
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadError(null);

      // Validate MIME type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError(
          "Unsupported file type. Please use JPEG, PNG, WebP, or AVIF.",
        );
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setUploadError("File is too large. Maximum size is 10 MB.");
        return;
      }

      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      setIsUploading(true);

      try {
        // Convert to base64
        const base64Data = await fileToBase64(file);

        // Upload via server-side Convex action
        const result = await uploadAvatar({
          fileData: base64Data,
          mimeType: file.type,
          fileSize: file.size,
        });

        // Update preview with server URL
        setPreviewUrl(result.imageUrl);
        setUploadError(null);

        // Clean up local preview
        URL.revokeObjectURL(localPreview);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadError(
          error instanceof Error
            ? error.message
            : "Upload failed. Please try again.",
        );
        // Keep the local preview as fallback
      } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [uploadAvatar],
  );

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      {/* Avatar */}
      <div className="relative group">
        <Avatar
          className={cn(
            sizeClasses[size],
            "ring-2 ring-background shadow-md",
          )}
        >
          <AvatarImage
            src={currentImage}
            alt={user?.name || "User avatar"}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {userInitials}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay */}
        {editable && (
          <button
            type="button"
            onClick={triggerFileSelect}
            disabled={isUploading}
            className={cn(
              "absolute inset-0 rounded-full flex items-center justify-center",
              "bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isUploading && "opacity-100",
            )}
            aria-label="Change profile photo"
          >
            {isUploading ? (
              <Loader2
                className={cn(iconSizes[size], "text-white animate-spin")}
              />
            ) : (
              <Camera className={cn(iconSizes[size], "text-white")} />
            )}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Upload profile photo"
        />
      )}

      {/* Upload button (mobile-friendly) */}
      {editable && !isUploading && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 h-7 text-xs text-muted-foreground hover:text-primary"
          onClick={triggerFileSelect}
        >
          <Upload className="h-3 w-3 mr-1" />
          {currentImage ? "Change photo" : "Upload photo"}
        </Button>
      )}

      {/* Uploading indicator */}
      {isUploading && (
        <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Uploading...
        </p>
      )}

      {/* Error message */}
      {uploadError && (
        <p className="mt-1 text-xs text-destructive max-w-[200px] text-center">
          {uploadError}
        </p>
      )}
    </div>
  );
}
