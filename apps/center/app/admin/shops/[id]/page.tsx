'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency, formatDate } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import {
  orderStatusLabel,
  orderStatusTone,
  productStatusLabel,
  productStatusTone,
  shopStatusLabel,
  shopStatusTone,
} from '@/lib/order-status';
import { useLanguage } from '@/components/providers/language-provider';
import type { ProductStatus, ShopStatus } from '@velnox/types';

type ShopProduct = {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  status: ProductStatus;
  description?: string | null;
  images?: { url: string }[];
  category?: { name: string } | null;
};

type ShopDetail = {
  id: string;
  name: string;
  description?: string | null;
  status: ShopStatus;
  createdAt: string;
  merchant?: {
    status: string;
    user?: { name: string; email: string };
  };
  products: ShopProduct[];
  _count?: { products: number };
};

type ShopStats = {
  shopId: string;
  totalRevenue: number;
  totalOrders: number;
  totalItemsSold: number;
  productsByStatus: Record<string, number>;
  topProducts: {
    productId: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    createdAt: string;
    itemTotal: number;
  }[];
};

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? '');
  const { t } = useLanguage();

  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      apiClient.get<ShopDetail>(`/shops/${id}`),
      apiClient.get<ShopStats>(`/shops/${id}/stats`).catch(() => null),
    ])
      .then(([shopData, statsData]) => {
        setShop(shopData);
        setStats(statsData);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : t('admin.shopNotFound')),
      )
      .finally(() => setLoading(false));
  }, [id, t]);

  async function setStatus(status: ShopStatus) {
    if (!shop) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await apiClient.patch<{ status: ShopStatus }>(`/shops/${shop.id}/status`, {
        status,
      });
      setShop((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปเดตสถานะไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }

  async function removeShop() {
    if (!shop) return;
    if (
      !confirm(
        `ลบร้าน "${shop.name}" ออกจากระบบถาวร? สินค้าในร้านจะถูกลบตาม (cascade) และย้อนกลับไม่ได้`,
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      await apiClient.delete(`/shops/${shop.id}`);
      router.push('/admin/shops');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ลบร้านไม่สำเร็จ');
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-400">{t('common.loading')}</div>
    );
  }

  if (error && !shop) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/admin/shops" className="text-sm font-medium text-teal-700 hover:underline">
          ← {t('admin.backToShops')}
        </Link>
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
          {error || t('admin.shopNotFound')}
        </div>
      </div>
    );
  }

  if (!shop) return null;

  const products = shop.products ?? [];
  const totalProducts = shop._count?.products ?? products.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/shops" className="text-xs font-medium text-teal-700 hover:underline">
            ← {t('admin.backToShops')}
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">{shop.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{shop.description || '—'}</p>
          <p className="mt-1 text-xs text-slate-400">
            สร้างเมื่อ {formatDate(shop.createdAt)}
          </p>
        </div>
        <Badge tone={shopStatusTone[shop.status] ?? 'neutral'}>
          {shopStatusLabel[shop.status] ?? shop.status}
        </Badge>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4">
        {shop.status !== 'ACTIVE' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setStatus('ACTIVE')}
            className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
          >
            เปิดใช้งาน
          </button>
        )}
        {shop.status !== 'INACTIVE' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setStatus('INACTIVE')}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            ปิดชั่วคราว
          </button>
        )}
        {shop.status !== 'SUSPENDED' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setStatus('SUSPENDED')}
            className="rounded-md border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
          >
            ระงับร้าน
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={removeShop}
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          ลบร้าน
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">รายได้รวม (จากออเดอร์)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatCurrency(stats?.totalRevenue ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">จำนวนคำสั่งซื้อ</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {(stats?.totalOrders ?? 0).toLocaleString('th-TH')}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">ชิ้นที่ขายได้</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {(stats?.totalItemsSold ?? 0).toLocaleString('th-TH')}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">{t('admin.productCount')}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalProducts.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">{t('admin.owner')}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {shop.merchant?.user?.name ?? '—'}
          </p>
          <p className="text-xs text-slate-400">{shop.merchant?.user?.email}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">{t('admin.merchantStatus')}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {shop.merchant?.status ?? '—'}
          </p>
        </div>
      </div>

      {stats && stats.topProducts.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">สินค้าขายดี</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="px-4 py-2 font-medium">สินค้า</th>
                  <th className="px-4 py-2 font-medium">จำนวนขาย</th>
                  <th className="px-4 py-2 font-medium">รายได้</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p) => (
                  <tr key={p.productId} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-4 py-3 text-slate-600">{p.quantitySold}</td>
                    <td className="px-4 py-3">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats && stats.recentOrders.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">ออเดอร์ล่าสุดของร้าน</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="px-4 py-2 font-medium">คำสั่งซื้อ</th>
                  <th className="px-4 py-2 font-medium">วันที่</th>
                  <th className="px-4 py-2 font-medium">ยอด (รายการร้านนี้)</th>
                  <th className="px-4 py-2 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">#{o.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3">{formatCurrency(o.itemTotal)}</td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          orderStatusTone[o.status as keyof typeof orderStatusTone] ?? 'neutral'
                        }
                      >
                        {orderStatusLabel[o.status as keyof typeof orderStatusLabel] ?? o.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          {t('admin.productsInShop')} ({products.length})
        </h2>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            {t('admin.noProductsInShop')}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">{t('admin.products')}</th>
                  <th className="px-4 py-3 font-medium">หมวดหมู่</th>
                  <th className="px-4 py-3 font-medium">ราคา</th>
                  <th className="px-4 py-3 font-medium">สต็อก</th>
                  <th className="px-4 py-3 font-medium">{t('admin.colStatus')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0].url}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                            —
                          </span>
                        )}
                        <div>
                          <p className="font-medium text-slate-800">{p.name}</p>
                          {p.description && (
                            <p className="line-clamp-1 text-xs text-slate-400">{p.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-800">
                      {formatCurrency(Number(p.price))}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.stock}</td>
                    <td className="px-4 py-3">
                      <Badge tone={productStatusTone[p.status] ?? 'neutral'}>
                        {productStatusLabel[p.status] ?? p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}