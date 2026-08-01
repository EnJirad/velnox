import { formatDate } from '@velnox/utils';
import { Badge } from '@velnox/ui';
import { adminUsers } from '@/lib/mock-data';

const roleLabel = { CUSTOMER: 'ลูกค้า', MERCHANT: 'ร้านค้า', ADMIN: 'แอดมิน', SUPER_ADMIN: 'ผู้ดูแลระบบ' } as const;
const statusTone = { ACTIVE: 'success', INACTIVE: 'neutral', BANNED: 'danger' } as const;
const statusLabel = { ACTIVE: 'ใช้งานอยู่', INACTIVE: 'ไม่ได้ใช้งาน', BANNED: 'ถูกระงับ' } as const;

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">ผู้ใช้งานทั้งหมด</h1>
          <p className="text-sm text-slate-500">{adminUsers.length.toLocaleString('th-TH')} บัญชีในระบบ</p>
        </div>
        <input placeholder="ค้นหาผู้ใช้..." className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">ชื่อผู้ใช้</th>
              <th className="px-4 py-3 font-medium">อีเมล</th>
              <th className="px-4 py-3 font-medium">บทบาท</th>
              <th className="px-4 py-3 font-medium">วันที่สมัคร</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                      {u.name.slice(0, 1)}
                    </span>
                    <span className="font-medium text-slate-800">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3 text-slate-600">{roleLabel[u.role]}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(u.joinedAt)}</td>
                <td className="px-4 py-3"><Badge tone={statusTone[u.status]}>{statusLabel[u.status]}</Badge></td>
                <td className="px-4 py-3 text-right">
                  {u.status === 'BANNED' ? (
                    <button className="text-xs font-medium text-teal-700 hover:underline">ปลดระงับ</button>
                  ) : (
                    <button className="text-xs font-medium text-red-600 hover:underline">ระงับบัญชี</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
