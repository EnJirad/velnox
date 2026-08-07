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

export function PromptPayQrPanel({ orderId, orderNumber, onClose, modal = false }: Props) {
  const [data, setData] = useState<PromptPayQrResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [slipDone, setSlipDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPromptPayQr(orderId)
      .then((res) => {
        if (!cancelled) {
          setData(res);
          if (res.slipUrl) setSlipDone(true);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'โหลด QR ไม่สำเร็จ');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  function handleDownloadQr() {
    if (!data?.qrDataUrl) return;
    const a = document.createElement('a');
    a.href = data.qrDataUrl;
    a.download = `promptpay-${data.orderNumber || orderId}.png`;
    a.click();
  }

  async function handleSlipSelected(file: File | undefined) {
    if (!file) return;
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

      {loading && <p className="py-8 text-sm text-slate-400">กำลังสร้าง QR...</p>}

      {error && (
        <div className="w-full rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {data && !loading && (
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

          <p className="mt-2 max-w-sm text-xs text-amber-700">
            โอนแล้วให้อัปโหลดสลิป — หรือกลับมาเปิด QR ได้จาก「คำสั่งซื้อของฉัน」
          </p>
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
