'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { logout as logoutRequest } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth-store';
import { AvatarUpload } from '@/components/avatar-upload';

const TABS = [
  { key: 'info', label: 'ข้อมูลส่วนตัว' },
  { key: 'address', label: 'ที่อยู่จัดส่ง' },
  { key: 'security', label: 'ความปลอดภัย' },
];

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profile: { avatarUrl: string | null } | null;
}

export function ProfileView() {
  const router = useRouter();
  const clearUser = useAuthStore((s) => s.clearUser);
  const [tab, setTab] = useState('info');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<ProfileData>('/users/profile')
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setName(data.name);
        setPhone(data.phone ?? '');
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await apiClient.patch<ProfileData>('/users/profile', { name, phone: phone || undefined });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUploaded(url: string) {
    try {
      const updated = await apiClient.patch<ProfileData>('/users/profile', { avatarUrl: url });
      setProfile(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกรูปโปรไฟล์ไม่สำเร็จ');
    }
  }

  async function handleLogout() {
    await logoutRequest();
    clearUser();
    router.push('/');
  }

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-slate-400">กำลังโหลด...</div>;
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-sm text-slate-500">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลบัญชีของคุณ</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">บัญชีของฉัน</h1>
        <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:underline">
          ออกจากระบบ
        </button>
      </div>

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
          {error && <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          {tab === 'info' && (
            <div className="flex flex-col gap-4">
              <AvatarUpload
                currentUrl={profile.profile?.avatarUrl ?? null}
                fallbackLetter={profile.name.slice(0, 1)}
                onUploaded={handleAvatarUploaded}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">อีเมล</label>
                  <input
                    disabled
                    value={profile.email}
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">เบอร์โทรศัพท์</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                  />
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-2 w-fit rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกแล้ว' : 'บันทึกการเปลี่ยนแปลง'}
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
              <p className="text-sm text-slate-400">ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้</p>
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
