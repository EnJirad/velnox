'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { apiClient } from '@/lib/api-client';
import type { ApiProduct } from '@/lib/api-types';

const statusTone = {
  ACTIVE: 'success',
  DRAFT: 'neutral',
  INACTIVE: 'danger',
  ARCHIVED: 'neutral',
} as const;

const statusLabel = {
  ACTIVE: 'เผยแพร่แล้ว',
  DRAFT: 'ฉบับร่าง',
  INACTIVE: 'ปิดการขาย',
  ARCHIVED: 'เก็บถาวร',
} as const;

type StockFilter = 'all' | 'low' | 'out';

export function ProductsView() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [stockDraft, setStockDraft] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<ApiProduct[]>('/products/me');
      const list = Array.isArray(data) ? data : [];
      setProducts(list);
      const draft: Record<string, string> = {};
      list.forEach((p) => {
        draft[p.id] = String(p.stock);
      });
      setStockDraft(draft);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    let list = products.filter((p) => p.status !== 'ARCHIVED');
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku ?? '').toLowerCase().includes(q) ||
          (p.sellerSku ?? '').toLowerCase().includes(q),
      );
    }
    if (stockFilter === 'low') list = list.filter((p) => p.stock > 0 && p.stock <= 10);
    if (stockFilter === 'out') list = list.filter((p) => p.stock === 0);
    return list;
  }, [products, search, stockFilter]);

  const stats = useMemo(() => {
    const active = products.filter((p) => p.status !== 'ARCHIVED');
    return {
      total: active.length,
      low: active.filter((p) => p.stock > 0 && p.stock <= 10).length,
      out: active.filter((p) => p.stock === 0).length,
      units: active.reduce((s, p) => s + p.stock, 0),
    };
  }, [products]);

  async function saveStock(p: ApiProduct) {
    const raw = stockDraft[p.id];
    const next = Number(raw);
    if (!Number.isFinite(next) || next < 0 || !Number.isInteger(next)) {
      setMsg('สต็อกต้องเป็นจำนวนเต็ม ≥ 0');
      return;
    }
    if (next === p.stock) return;
    setBusyId(p.id);
    setMsg(null);
    try {
      const updated = await apiClient.patch<ApiProduct>(`/products/${p.id}`, { stock: next });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock: updated.stock ?? next } : x)));
      setStockDraft((d) => ({ ...d, [p.id]: String(updated.stock ?? next) }));
      setMsg(`อัปเดตสต็อก «${p.name}» เป็น ${updated.stock ?? next}`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'บันทึกสต็อกไม่สำเร็จ');
      setStockDraft((d) => ({ ...d, [p.id]: String(p.stock) }));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">กำลังโหลดสินค้า...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">สินค้าและคลัง</h1>
          <p className="text-sm text-slate-500">
            ค้นหา · แก้สต็อกทันที · คลิกชื่อ/รูปเพื่อแก้ไขรายละเอียด
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
        >
          + เพิ่มสินค้า
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'สินค้าทั้งหมด', value: stats.total },
          { label: 'หน่วยในคลัง', value: stats.units },
          { label: 'สต็อกใกล้หมด', value: stats.low },
          { label: 'หมดสต็อก', value: stats.out },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อ / SKU / รหัสร้าน..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['all', 'ทั้งหมด'],
              ['low', 'ใกล้หมด'],
              ['out', 'หมดสต็อก'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setStockFilter(k)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                stockFilter === k
                  ? 'bg-teal-700 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 text-sm text-teal-800">{msg}</div>
      )}
      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-500">
          {search || stockFilter !== 'all' ? 'ไม่พบสินค้าตามเงื่อนไข' : 'ยังไม่มีสินค้า — กดเพิ่มสินค้าเพื่อเริ่มขาย'}
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {visible.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex gap-3">
                  <Link href={`/dashboard/products/${p.id}/edit`} className="shrink-0">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-50 text-slate-300">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M21 8l-9-5-9 5 9 5 9-5z" />
                          <path d="M3 8v8l9 5 9-5V8" />
                        </svg>
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/dashboard/products/${p.id}/edit`} className="font-medium text-slate-900 hover:text-teal-700">
                      {p.name}
                    </Link>
                    <p className="font-mono text-[10px] text-slate-400">{p.sku}</p>
                    <p className="mt-0.5 text-sm font-semibold text-teal-700">{formatCurrency(Number(p.price))}</p>
                    <Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-slate-50 pt-2">
                  <label className="text-xs text-slate-500">สต็อก</label>
                  <input
                    inputMode="numeric"
                    value={stockDraft[p.id] ?? String(p.stock)}
                    onChange={(e) => setStockDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-teal-600"
                  />
                  <button
                    type="button"
                    disabled={busyId === p.id || stockDraft[p.id] === String(p.stock)}
                    onClick={() => void saveStock(p)}
                    className="rounded-lg bg-teal-700 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-40"
                  >
                    {busyId === p.id ? '...' : 'บันทึก'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-medium">สินค้า</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">ราคา</th>
                  <th className="px-4 py-3 font-medium">สต็อก</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/products/${p.id}/edit`} className="flex items-center gap-3 hover:opacity-90">
                        {p.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0].url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-300">
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M21 8l-9-5-9 5 9 5 9-5z" />
                              <path d="M3 8v8l9 5 9-5V8" />
                            </svg>
                          </span>
                        )}
                        <span className="font-medium text-slate-800 hover:text-teal-700">{p.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs text-slate-600">{p.sku ?? '—'}</span>
                        {p.sellerSku && <span className="text-[10px] text-slate-400">ร้าน: {p.sellerSku}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-800">{formatCurrency(Number(p.price))}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          inputMode="numeric"
                          value={stockDraft[p.id] ?? String(p.stock)}
                          onChange={(e) => setStockDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                          className={`w-16 rounded-lg border px-2 py-1 text-sm outline-none focus:border-teal-600 ${
                            p.stock === 0
                              ? 'border-red-200 text-red-700'
                              : p.stock <= 10
                                ? 'border-amber-200 text-amber-700'
                                : 'border-slate-200 text-slate-700'
                          }`}
                        />
                        <button
                          type="button"
                          disabled={busyId === p.id || stockDraft[p.id] === String(p.stock)}
                          onClick={() => void saveStock(p)}
                          className="rounded-md bg-teal-700 px-2 py-1 text-[11px] font-semibold text-white hover:bg-teal-800 disabled:opacity-40"
                        >
                          {busyId === p.id ? '...' : 'บันทึก'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/products/${p.id}/edit`}
                        className="text-xs font-medium text-teal-700 hover:underline"
                      >
                        แก้ไข
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
