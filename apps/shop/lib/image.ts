/**
 * ย่อรูป Cloudinary ให้โหลดเร็วขึ้น (thumbnail / card)
 * ถ้าไม่ใช่ Cloudinary URL คืนค่าเดิม
 */
export function optimizeImageUrl(
  url: string | null | undefined,
  opts: { width?: number; height?: number; quality?: number } = {},
): string | undefined {
  if (!url) return undefined;
  const width = opts.width ?? 400;
  const quality = opts.quality ?? 70;

  // https://res.cloudinary.com/<cloud>/image/upload/v123/folder/file.jpg
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // แทรก transform หลัง /upload/
    return url.replace(
      '/upload/',
      `/upload/f_auto,q_${quality},w_${width},c_fill,g_auto/`,
    );
  }

  return url;
}
