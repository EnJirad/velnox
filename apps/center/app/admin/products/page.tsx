'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import { productStatusLabel, productStatusTone } from '@/lib/order-status';
import type { ProductStatus } from '@velnox/types';

type ApiProduct = {
  id: string;
  name: string;
  sku?: string;
  sellerSku?: string | null;
  price: number | string;
  status: ProductStatus;
  shop?: { name: string };
  images?: { url: string }[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient
      .get<ApiProduct[]>('/products/admin/all')
      .then((list) => setProducts(Array.isArray(list) ? list : []))
      .catch((err) => setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  async function setStatus(id: string, status: ProductStatus) {
    setBusyId(id);
    setError(null);
    try {
      await apiClient.patch(`/products/${id}/status`, { status });
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setBusyId(null);
    }
  }

  const q = search.toLowerCase().trim();
  const filtered = products.filter(
    (p) =>
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.sku ?? '').toLowerCase().includes(q) ||
      (p.sellerSku ?? '').toLowerCase().includes(q) ||
      (p.shop?.name ?? '').toLowerCase().includes(q),
  );
  const draftCount = products.filter((p) => p.status === 'DRAFT').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">ตรวจสอบสินค้า</h1>
          <p className="text-sm text-slate-500">
            มีสินค้า {draftCount} รายการรอการตรวจสอบก่อนเผยแพร่
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อ / SKU / ร้าน..."
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">กำลังโหลด...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">สินค้า</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">ร้านค้า</th>
                <th className="px-4 py-3 font-medium">ราคา</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    ยังไม่มีสินค้าในระบบ
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0].url}
                            alt=""
                            className="h-9 w-9 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                            —
                          </span>
                        )}
                        <span className="font-medium text-slate-800">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs text-slate-600">{p.sku ?? '—'}</span>
                        {p.sellerSku && (
                          <span className="text-[10px] text-slate-400">ร้าน: {p.sellerSku}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.shop?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatCurrency(Number(p.price))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={productStatusTone[p.status] ?? 'neutral'}>
                        {productStatusLabel[p.status] ?? p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.status === 'DRAFT' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setStatus(p.id, 'ACTIVE')}
                            disabled={busyId === p.id}
                            className="rounded-md bg-teal-700 px-3 py-1 text-xs font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                          >
                            อนุมัติ
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatus(p.id, 'INACTIVE')}
                            disabled={busyId === p.id}
                            className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}