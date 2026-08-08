'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { logout as logoutRequest } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth-store';
import { AvatarUpload } from '@/components/avatar-upload';
import {
  AddressLocationPicker,
  type GeoPoint,
  withGeoInAddressLine,
} from '@/components/address-location-picker';

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

interface AddressRow {
  id: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const emptyForm = {
  name: '',
  phone: '',
  addressLine: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'TH',
  isDefault: true,
};

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

  const [addresses, setAddresses] = useState<AddressRow[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyForm);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressGeo, setAddressGeo] = useState<GeoPoint | null>(null);

  const loadAddresses = useCallback(async () => {
    try {
      const list = await apiClient.get<AddressRow[]>('/users/addresses');
      setAddresses(Array.isArray(list) ? list : []);
    } catch {
      setAddresses([]);
    }
  }, []);

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

  useEffect(() => {
    if (tab === 'address') {
      void loadAddresses();
    }
  }, [tab, loadAddresses]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await apiClient.patch<ProfileData>('/users/profile', {
        name,
        phone: phone || undefined,
      });
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

  async function handleSaveAddress() {
    setAddressError(null);
    if (
      !addressForm.name.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.addressLine.trim() ||
      !addressForm.city.trim() ||
      !addressForm.province.trim() ||
      !addressForm.postalCode.trim()
    ) {
      setAddressError('กรุณากรอกข้อมูลที่อยู่ให้ครบ');
      return;
    }
    setAddressSaving(true);
    try {
      await apiClient.post('/users/addresses', {
        name: addressForm.name.trim(),
        phone: addressForm.phone.trim(),
        addressLine: withGeoInAddressLine(addressForm.addressLine.trim(), addressGeo),
        city: addressForm.city.trim(),
        province: addressForm.province.trim(),
        postalCode: addressForm.postalCode.trim(),
        country: addressForm.country.trim() || 'TH',
        isDefault: addressForm.isDefault,
      });
      setShowAddressForm(false);
      setAddressForm(emptyForm);
      await loadAddresses();
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'บันทึกที่อยู่ไม่สำเร็จ');
    } finally {
      setAddressSaving(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    try {
      await apiClient.delete(`/users/addresses/${id}`);
      await loadAddresses();
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'ลบที่อยู่ไม่สำเร็จ');
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-slate-400">
        กำลังโหลด...
      </div>
    );
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
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm font-medium text-red-600 hover:underline"
        >
          ออกจากระบบ
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <nav className="flex flex-row gap-1 md:flex-col">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
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
          {error && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          )}

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
                type="button"
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
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900">ที่อยู่ของฉัน</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm((v) => !v);
                    setAddressError(null);
                    setAddressForm({
                      ...emptyForm,
                      name: profile.name,
                      phone: profile.phone ?? '',
                      isDefault: addresses.length === 0,
                    });
                    setAddressGeo(null);
                  }}
                  className="rounded-md bg-teal-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-teal-800"
                >
                  {showAddressForm ? 'ปิดฟอร์ม' : '+ เพิ่มที่อยู่ใหม่'}
                </button>
              </div>

              {addressError && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{addressError}</div>
              )}

              {showAddressForm && (
                <div className="rounded-lg border border-teal-100 bg-teal-50/40 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-800">กรอกที่อยู่จัดส่ง</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="ชื่อ-นามสกุลผู้รับ *"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm((f) => ({ ...f, name: e.target.value }))}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
                    />
                    <input
                      type="tel"
                      placeholder="เบอร์โทร *"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
                    />
                    <input
                      type="text"
                      placeholder="ที่อยู่ (บ้านเลขที่ ถนน) *"
                      value={addressForm.addressLine}
                      onChange={(e) =>
                        setAddressForm((f) => ({ ...f, addressLine: e.target.value }))
                      }
                      className="sm:col-span-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
                    />
                    <input
                      type="text"
                      placeholder="เขต/อำเภอ หรือ ตำบล *"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
                    />
                    <input
                      type="text"
                      placeholder="จังหวัด *"
                      value={addressForm.province}
                      onChange={(e) => setAddressForm((f) => ({ ...f, province: e.target.value }))}
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
                    />
                    <input
                      type="text"
                      placeholder="รหัสไปรษณีย์ *"
                      value={addressForm.postalCode}
                      onChange={(e) =>
                        setAddressForm((f) => ({ ...f, postalCode: e.target.value }))
                      }
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600"
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) =>
                          setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))
                        }
                      />
                      ตั้งเป็นที่อยู่หลัก
                    </label>
                  </div>
                  <div className="mt-3">
                    <AddressLocationPicker
                      value={addressGeo}
                      onChange={setAddressGeo}
                      onAddressHint={(hint) => {
                        setAddressForm((f) => ({
                          ...f,
                          addressLine:
                            f.addressLine.trim() ||
                            [hint.road, hint.suburb].filter(Boolean).join(' ') ||
                            f.addressLine,
                          city: f.city || hint.city || '',
                          province: f.province || hint.province || '',
                          postalCode: f.postalCode || hint.postcode || '',
                        }));
                      }}
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveAddress}
                      disabled={addressSaving}
                      className="rounded-md bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                    >
                      {addressSaving ? 'กำลังบันทึก...' : 'บันทึกที่อยู่'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}

              {addresses.length === 0 && !showAddressForm ? (
                <p className="text-sm text-slate-400">ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {addresses.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900">
                            {a.name}{' '}
                            {a.isDefault && (
                              <span className="ml-1 rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold text-teal-800">
                                หลัก
                              </span>
                            )}
                          </p>
                          <p className="text-slate-500">{a.phone}</p>
                          <p className="mt-1">
                            {a.addressLine} {a.city} {a.province} {a.postalCode}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(a.id)}
                          className="shrink-0 text-xs text-red-600 hover:underline"
                        >
                          ลบ
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'security' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-slate-900">เปลี่ยนรหัสผ่าน</h2>
              <p className="text-sm text-slate-400">ฟีเจอร์นี้จะเปิดใช้เร็วๆ นี้</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
