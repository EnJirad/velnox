'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  function validateAddressFields(): Record<string, string> {
    const err: Record<string, string> = {};
    if (!addressForm.name.trim()) err.name = 'กรุณากรอกชื่อผู้รับ';
    if (!addressForm.phone.trim() || addressForm.phone.trim().length < 8)
      err.phone = 'กรุณากรอกเบอร์โทรให้ถูกต้อง';
    if (!addressForm.addressLine.trim()) err.addressLine = 'กรุณากรอกที่อยู่';
    if (!addressForm.city.trim()) err.city = 'กรุณากรอกอำเภอ/เขต';
    if (!addressForm.province.trim()) err.province = 'กรุณากรอกจังหวัด';
    if (!addressForm.postalCode.trim() || addressForm.postalCode.trim().length < 4)
      err.postalCode = 'กรุณากรอกรหัสไปรษณีย์';
    return err;
  }

  function focusFirstError(errs: Record<string, string>) {
    const order = ['name', 'phone', 'addressLine', 'city', 'province', 'postalCode'];
    const first = order.find((k) => errs[k]);
    if (!first) return;
    const el = fieldRefs.current[first];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  }

  function inputClass(key: string) {
    const base =
      'rounded-md border bg-white px-3 py-2 text-sm outline-none focus:ring-1 ';
    return fieldErrors[key]
      ? base + 'border-red-500 focus:border-red-500 focus:ring-red-400'
      : base + 'border-slate-300 focus:border-teal-600 focus:ring-teal-600';
  }

  function startEditAddress(a: AddressRow) {
    setEditingAddressId(a.id);
    setShowAddressForm(true);
    setAddressError(null);
    setFieldErrors({});
    setAddressForm({
      name: a.name,
      phone: a.phone,
      addressLine: a.addressLine.replace(/\s*\|\s*GPS:[-\d.]+,[-\d.]+\s*$/i, '').trim(),
      city: a.city,
      province: a.province,
      postalCode: a.postalCode,
      country: a.country || 'TH',
      isDefault: a.isDefault,
    });
    const m = a.addressLine.match(/\|\s*GPS:([-\d.]+),([-\d.]+)\s*$/i);
    if (m) {
      setAddressGeo({ lat: Number(m[1]), lng: Number(m[2]) });
    } else {
      setAddressGeo(null);
    }
  }

  async function handleSaveAddress() {
    setAddressError(null);
    const errs = validateAddressFields();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setAddressError('กรุณากรอกช่องที่มีกรอบสีแดงให้ครบ');
      // รอ state paint แล้วโฟกัส
      setTimeout(() => focusFirstError(errs), 50);
      return;
    }
    setAddressSaving(true);
    try {
      const payload = {
        name: addressForm.name.trim(),
        phone: addressForm.phone.trim(),
        addressLine: withGeoInAddressLine(addressForm.addressLine.trim(), addressGeo),
        city: addressForm.city.trim(),
        province: addressForm.province.trim(),
        postalCode: addressForm.postalCode.trim(),
        country: addressForm.country.trim() || 'TH',
        isDefault: addressForm.isDefault,
      };
      if (editingAddressId) {
        await apiClient.patch(`/users/addresses/${editingAddressId}`, payload);
      } else {
        await apiClient.post('/users/addresses', payload);
      }
      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm(emptyForm);
      setAddressGeo(null);
      setFieldErrors({});
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
                    const next = !showAddressForm;
                    setShowAddressForm(next);
                    setAddressError(null);
                    setFieldErrors({});
                    setEditingAddressId(null);
                    if (next) {
                      setAddressForm({
                        ...emptyForm,
                        name: profile.name,
                        phone: profile.phone ?? '',
                        isDefault: addresses.length === 0,
                      });
                      setAddressGeo(null);
                    }
                  }}
                  className="rounded-md bg-teal-700 px-4 py-1.5 text-xs font-medium text-white hover:bg-teal-800"
                >
                  {showAddressForm && !editingAddressId
                    ? 'ปิดฟอร์ม'
                    : showAddressForm && editingAddressId
                      ? 'ยกเลิกแก้ไข'
                      : '+ เพิ่มที่อยู่ใหม่'}
                </button>
              </div>

              {addressError && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{addressError}</div>
              )}

              {showAddressForm && (
                <div className="rounded-lg border border-teal-100 bg-teal-50/40 p-4">
                  <p className="mb-3 text-sm font-medium text-slate-800">
                    {editingAddressId ? 'แก้ไขที่อยู่จัดส่ง' : 'กรอกที่อยู่จัดส่งใหม่'}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-0.5">
                      <input
                        ref={(el) => { fieldRefs.current.name = el; }}
                        type="text"
                        placeholder="ชื่อ-นามสกุลผู้รับ *"
                        value={addressForm.name}
                        onChange={(e) => {
                          setAddressForm((f) => ({ ...f, name: e.target.value }));
                          setFieldErrors((er) => ({ ...er, name: '' }));
                        }}
                        className={inputClass('name')}
                      />
                      {fieldErrors.name && <p className="text-[11px] text-red-600">{fieldErrors.name}</p>}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <input
                        ref={(el) => { fieldRefs.current.phone = el; }}
                        type="tel"
                        placeholder="เบอร์โทร *"
                        value={addressForm.phone}
                        onChange={(e) => {
                          setAddressForm((f) => ({ ...f, phone: e.target.value }));
                          setFieldErrors((er) => ({ ...er, phone: '' }));
                        }}
                        className={inputClass('phone')}
                      />
                      {fieldErrors.phone && <p className="text-[11px] text-red-600">{fieldErrors.phone}</p>}
                    </div>
                    <div className="flex flex-col gap-0.5 sm:col-span-2">
                      <input
                        ref={(el) => { fieldRefs.current.addressLine = el; }}
                        type="text"
                        placeholder="ที่อยู่ (บ้านเลขที่ ถนน) *"
                        value={addressForm.addressLine}
                        onChange={(e) => {
                          setAddressForm((f) => ({ ...f, addressLine: e.target.value }));
                          setFieldErrors((er) => ({ ...er, addressLine: '' }));
                        }}
                        className={inputClass('addressLine')}
                      />
                      {fieldErrors.addressLine && (
                        <p className="text-[11px] text-red-600">{fieldErrors.addressLine}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <input
                        ref={(el) => { fieldRefs.current.city = el; }}
                        type="text"
                        placeholder="เขต/อำเภอ หรือ ตำบล *"
                        value={addressForm.city}
                        onChange={(e) => {
                          setAddressForm((f) => ({ ...f, city: e.target.value }));
                          setFieldErrors((er) => ({ ...er, city: '' }));
                        }}
                        className={inputClass('city')}
                      />
                      {fieldErrors.city && <p className="text-[11px] text-red-600">{fieldErrors.city}</p>}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <input
                        ref={(el) => { fieldRefs.current.province = el; }}
                        type="text"
                        placeholder="จังหวัด *"
                        value={addressForm.province}
                        onChange={(e) => {
                          setAddressForm((f) => ({ ...f, province: e.target.value }));
                          setFieldErrors((er) => ({ ...er, province: '' }));
                        }}
                        className={inputClass('province')}
                      />
                      {fieldErrors.province && (
                        <p className="text-[11px] text-red-600">{fieldErrors.province}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <input
                        ref={(el) => { fieldRefs.current.postalCode = el; }}
                        type="text"
                        placeholder="รหัสไปรษณีย์ *"
                        value={addressForm.postalCode}
                        onChange={(e) => {
                          setAddressForm((f) => ({ ...f, postalCode: e.target.value }));
                          setFieldErrors((er) => ({ ...er, postalCode: '' }));
                        }}
                        className={inputClass('postalCode')}
                      />
                      {fieldErrors.postalCode && (
                        <p className="text-[11px] text-red-600">{fieldErrors.postalCode}</p>
                      )}
                    </div>
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
                      {addressSaving ? 'กำลังบันทึก...' : editingAddressId ? 'บันทึกการแก้ไข' : 'บันทึกที่อยู่'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddressId(null);
                        setFieldErrors({});
                        setAddressError(null);
                      }}
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
                        <div className="flex shrink-0 flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => startEditAddress(a)}
                            className="text-xs font-medium text-teal-700 hover:underline"
                          >
                            แก้ไข
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(a.id)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            ลบ
                          </button>
                        </div>
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
