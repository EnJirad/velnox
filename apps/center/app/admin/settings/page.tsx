'use client';

import { useState } from 'react';

const TABS = [
  { key: 'general', label: 'ทั่วไป' },
  { key: 'payments', label: 'การชำระเงิน' },
  { key: 'roles', label: 'สิทธิ์การเข้าถึง' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('general');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ตั้งค่าระบบ</h1>
        <p className="text-sm text-slate-500">จัดการการตั้งค่าระดับแพลตฟอร์มของ Velnox</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.key ? 'border-teal-700 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6">
          <div className="grid gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">ชื่อแพลตฟอร์ม</label>
              <input defaultValue="Velnox Commerce Platform" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">ค่าคอมมิชชั่นแพลตฟอร์ม (%)</label>
              <input defaultValue="5" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" defaultChecked /> เปิดใช้งานการอนุมัติร้านค้าอัตโนมัติ
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" defaultChecked /> ต้องตรวจสอบสินค้าใหม่ก่อนเผยแพร่
            </label>
          </div>
          <button className="mt-4 rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
            บันทึกการตั้งค่า
          </button>
        </div>
      )}

      {tab === 'payments' && (
        <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6">
          <p className="mb-3 text-sm font-semibold text-slate-900">ช่องทางการชำระเงินที่เปิดใช้งาน</p>
          <div className="flex flex-col gap-2">
            {['บัตรเครดิต/เดบิต', 'พร้อมเพย์', 'โอนผ่านธนาคาร', 'เก็บเงินปลายทาง'].map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" defaultChecked /> {m}
              </label>
            ))}
          </div>
        </div>
      )}

      {tab === 'roles' && (
        <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6">
          <p className="mb-3 text-sm font-semibold text-slate-900">บทบาทผู้ดูแลระบบ</p>
          <div className="flex flex-col divide-y divide-slate-100 text-sm">
            {[
              { role: 'SUPER_ADMIN', desc: 'เข้าถึงและจัดการได้ทุกส่วนของระบบ' },
              { role: 'ADMIN', desc: 'จัดการร้านค้า สินค้า และคำสั่งซื้อ' },
            ].map((r) => (
              <div key={r.role} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-800">{r.role}</p>
                  <p className="text-xs text-slate-500">{r.desc}</p>
                </div>
                <button className="text-xs font-medium text-teal-700 hover:underline">แก้ไขสิทธิ์</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
