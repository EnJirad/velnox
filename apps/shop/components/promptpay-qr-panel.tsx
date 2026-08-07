'use client';

import { useEffect, useRef, useState } from 'react';
import { formatCurrency } from '@velnox/utils';
import {
  fetchPromptPayQr,
  submitPaymentSlip,
  type PromptPayQrResponse,
} from '@/lib/payments';
import { ApiError, uploadImage } from '@/lib/api-client';

type Props = {
  orderId: string;
  orderNumber?: string;
  onClose?: () => void;
  modal?: boolean;
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function PromptPayQrPanel({ orderId, orderNumber, onClose, modal = false }: Props) {
  const [data, setData] = useState<PromptPayQrResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [slipDone, setSlipDone] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setExpired(false);
    fetchPromptPayQr(orderId)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        if (res.slipUrl) setSlipDone(true);
        if (res.expiresAt) {
          const left = new Date(res.expiresAt).getTime() - Date.now();
          setRemainingMs(Math.max(0, left));
          if (left <= 0) setExpired(true);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof ApiError ? err.message : 'โหลด QR ไม่สำเร็จ';
          setError(msg);
          if (msg.includes('หมดเวลา') || msg.includes('24')) setExpired(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // นับถอยหลังทุก 1 วินาที
  useEffect(() => {
    if (!data?.expiresAt || expired) return;
    const tick = () => {
      const left = new Date(data.expiresAt!).getTime() - Date.now();
      if (left <= 0) {
        setRemainingMs(0);
        setExpired(true);
      } else {
        setRemainingMs(left);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data?.expiresAt, expired]);

  function handleDownloadQr() {
    if (!data?.qrDataUrl || expired) return;
    const a = document.createElement('a');
    a.href = data.qrDataUrl;
    a.download = `promptpay-${data.orderNumber || orderId}.png`;
    a.click();
  }

  async function handleSlipSelected(file: File | undefined) {
    if (!file || expired) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await uploadImage(file, 'slips' as 'products');
      await submitPaymentSlip(orderId, uploaded.url);
      setSlipDone(true);
      setData((d) => (d ? { ...d, slipUrl: uploaded.url } : d));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'อัปโหลดสลิปไม่สำเร็จ');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const body = (
    <div className="flex flex-col items-center gap-3 text-center">
      <h2 className="text-lg font-semibold text-slate-900">ชำระเงินด้วยพร้อมเพย์</h2>
      <p className="text-sm text-slate-500">
        ออเดอร์{' '}
        <span className="font-medium text-teal-700">#{orderNumber ?? data?.orderNumber ?? '—'}</span>
      </p>

      {/* Countdown 24h */}
      {(remainingMs !== null || expired) && (
        <div
          className={`w-full rounded-lg px-3 py-2 text-sm ${
            expired
              ? 'bg-red-50 text-red-700'
              : remainingMs !== null && remainingMs < 60 * 60 * 1000
                ? 'bg-amber-50 text-amber-800'
                : 'bg-slate-50 text-slate-700'
          }`}
        >
          {expired ? (
            <span className="font-semibold">หมดเวลาชำระเงินแล้ว (24 ชม.) — กรุณาสั่งซื้อใหม่</span>
          ) : (
            <>
              <span className="text-xs text-slate-500">เวลาที่เหลือในการชำระเงิน (24 ชม.)</span>
              <p className="font-mono text-xl font-bold tracking-wider">
                {formatCountdown(remainingMs ?? 0)}
              </p>
            </>
          )}
        </div>
      )}

      {loading && <p className="py-8 text-sm text-slate-400">กำลังสร้าง QR...</p>}

      {error && (
        <div className="w-full rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {data && !loading && !expired && (
        <>
          <p className="text-2xl font-bold text-teal-700">{formatCurrency(data.amount)}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.qrDataUrl}
            alt="PromptPay QR"
            className="h-64 w-64 rounded-lg border border-slate-200 bg-white p-2"
          />
          <p className="max-w-xs text-xs text-slate-500">{data.message}</p>
          {data.bankAccountName && (
            <p className="text-xs text-slate-500">
              บัญชี: {data.bankAccountName}
              {data.bankName ? ` · ${data.bankName}` : ''}
            </p>
          )}
          <p className="text-xs text-slate-400">PromptPay: {data.promptPayIdMasked}</p>

          <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ดาวน์โหลด QR Code
            </button>
            <button
              type="button"
              disabled={uploading || slipDone}
              onClick={() => fileRef.current?.click()}
              className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {uploading ? 'กำลังอัปโหลด...' : slipDone ? 'อัปโหลดสลิปแล้ว' : 'อัปโหลดสลิป'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => void handleSlipSelected(e.target.files?.[0])}
            />
          </div>

          {slipDone && (
            <p className="text-sm font-medium text-emerald-600">
              ส่งสลิปแล้ว รอเจ้าหน้าที่ตรวจสอบ
            </p>
          )}
        </>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="mt-2 rounded-md border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ปิด
        </button>
      )}
    </div>
  );

  if (!modal) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6">{body}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {body}
      </div>
    </div>
  );
}
