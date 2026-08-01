'use client';

import { useState } from 'react';

const TABS = [
  { key: 'info', label: 'ข้อมูลส่วนตัว' },
  { key: 'address', label: 'ที่อยู่จัดส่ง' },
  { key: 'security', label: 'ความปลอดภัย' },
];

export function ProfileView() {
  const [tab, setTab] = useState('info');

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">บัญชีของฉัน</h1>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <nav className="flex flex-row gap-1 md:flex-col">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-2 text-left text-sm font-medium ${
                tab === t.key ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          {tab === 'info' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-2xl font-semibold text-teal-700">
                  ส
                </div>
                <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50">
                  เปลี่ยนรูปโปรไฟล์
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
                  <input defaultValue="สมชาย ใจดี" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">อีเมล</label>
                  <input defaultValue="somchai@example.com" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">เบอร์โทรศัพท์</label>
                  <input defaultValue="081-234-5678" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">วันเกิด</label>
                  <input type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                </div>
              </div>
              <button className="mt-2 w-fit rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          )}

          {tab === 'address' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">ที่อยู่ของฉัน</h2>
                <button className="rounded-md bg-teal-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-teal-800">
                  + เพิ่มที่อยู่ใหม่
                </button>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 text-sm">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-medium text-slate-900">สมชาย ใจดี</span>
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs text-teal-700">ค่าเริ่มต้น</span>
                </div>
                <p className="text-slate-600">081-234-5678</p>
                <p className="text-slate-600">123/45 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110</p>
                <div className="mt-2 flex gap-3 text-xs">
                  <button className="text-teal-700 hover:underline">แก้ไข</button>
                  <button className="text-red-600 hover:underline">ลบ</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-slate-900">เปลี่ยนรหัสผ่าน</h2>
              <div className="grid gap-4 sm:max-w-sm">
                <input type="password" placeholder="รหัสผ่านปัจจุบัน" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                <input type="password" placeholder="รหัสผ่านใหม่" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
                <input type="password" placeholder="ยืนยันรหัสผ่านใหม่" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
              </div>
              <button className="w-fit rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
                อัปเดตรหัสผ่าน
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
