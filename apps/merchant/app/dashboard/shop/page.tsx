export default function ShopPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">ร้านค้าของฉัน</h1>
        <p className="text-sm text-slate-500">จัดการข้อมูลและการตั้งค่าของร้านค้า</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">ข้อมูลร้านค้า</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">ชื่อร้านค้า</label>
                <input defaultValue="Urban Thread Shop" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">หมวดหมู่หลัก</label>
                <input defaultValue="แฟชั่น" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">คำอธิบายร้านค้า</label>
              <textarea
                defaultValue="ร้านเสื้อผ้าสไตล์มินิมอล เน้นผ้าคุณภาพดี ดีไซน์เรียบง่ายแต่ทันสมัย"
                rows={3}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">ข้อมูลติดต่อ</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">อีเมลติดต่อ</label>
                <input defaultValue="contact@urbanthread.shop" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">เบอร์โทรศัพท์</label>
                <input defaultValue="02-123-4567" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">การจัดส่ง</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">ค่าจัดส่งมาตรฐาน (บาท)</label>
                <input defaultValue="40" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">ส่งฟรีเมื่อซื้อครบ (บาท)</label>
                <input defaultValue="990" className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600" />
              </div>
            </div>
          </div>

          <button className="w-fit rounded-md bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800">
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-sm font-semibold text-slate-900">โลโก้ร้านค้า</p>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-teal-100 text-3xl font-bold text-teal-700">UT</div>
              <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50">
                เปลี่ยนโลโก้
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
            ✅ ร้านค้าของคุณผ่านการอนุมัติแล้ว และเปิดขายอยู่บน VelShop
          </div>
        </div>
      </div>
    </div>
  );
}
