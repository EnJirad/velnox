'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { logout } from '@/lib/auth';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clearUser);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      clearUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 transition-colors"
        disabled={isLoading}
      >
        ↩️ ออกจากระบบ
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">ยืนยันการออกจากระบบ</h3>
            <p className="mt-2 text-sm text-slate-600">คุณแน่ใจว่าต้องการออกจากระบบหรือไม่?</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isLoading ? 'กำลังออก...' : 'ออกจากระบบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
