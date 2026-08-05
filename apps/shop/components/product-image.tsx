'use client';

import { useState } from 'react';
import { IconImage } from '@/components/icons';
import { optimizeImageUrl } from '@/lib/image';

type Props = {
  src?: string | null;
  alt: string;
  /** ความกว้างเป้าหมายสำหรับ Cloudinary transform */
  width?: number;
  className?: string;
  /** true = รูปด้านบนหน้า (โหลดก่อน) */
  priority?: boolean;
};

export function ProductImage({
  src,
  alt,
  width = 400,
  className = 'h-full w-full object-cover',
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const optimized = optimizeImageUrl(src, { width, quality: 70 });

  if (!optimized || failed) {
    return (
      <span className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
        <IconImage size={width > 200 ? 40 : 28} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={optimized}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
