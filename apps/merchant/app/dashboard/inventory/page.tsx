'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Inventory รวมเข้ากับหน้าสินค้าแล้ว — redirect ไว้ให้ลิงก์เก่าไม่พัง */
export default function InventoryPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/products');
  }, [router]);
  return (
    <div className="py-20 text-center text-sm text-slate-400">กำลังไปหน้าสินค้าและคลัง...</div>
  );
}
