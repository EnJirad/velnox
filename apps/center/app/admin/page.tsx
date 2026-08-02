import DashboardView from './dashboard-view';

export default function AdminOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ภาพรวมแพลตฟอร์ม</h1>
        <p className="text-sm text-slate-500">สรุปสถานะการดำเนินงานของ Velnox ทั้งหมด (ข้อมูลจริงจากระบบ)</p>
      </div>

      <DashboardView />
    </div>
  );
}
