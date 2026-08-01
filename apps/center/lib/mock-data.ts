import type { MerchantStatus, Order, OrderStatus, ShopStatus, UserRole, UserStatus } from '@velnox/types';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
}

export const adminUsers: AdminUser[] = [
  { id: 'u-1', name: 'สมชาย ใจดี', email: 'somchai@example.com', role: 'CUSTOMER', status: 'ACTIVE', joinedAt: '2026-01-14' },
  { id: 'u-2', name: 'วิภา สายทอง', email: 'wipa@example.com', role: 'CUSTOMER', status: 'ACTIVE', joinedAt: '2026-02-02' },
  { id: 'u-3', name: 'ธนกร ศรีสุข', email: 'thanakorn@urbanthread.shop', role: 'MERCHANT', status: 'ACTIVE', joinedAt: '2026-01-20' },
  { id: 'u-4', name: 'ปิยะดา แสงจันทร์', email: 'piyada@example.com', role: 'CUSTOMER', status: 'BANNED', joinedAt: '2025-11-05' },
  { id: 'u-5', name: 'กิตติพงษ์ รุ่งเรือง', email: 'kittipong@techhub.store', role: 'MERCHANT', status: 'ACTIVE', joinedAt: '2025-12-11' },
  { id: 'u-6', name: 'ผู้ดูแลระบบ', email: 'admin@velnox.com', role: 'SUPER_ADMIN', status: 'ACTIVE', joinedAt: '2025-09-01' },
];

export interface AdminMerchant {
  id: string;
  shopName: string;
  ownerName: string;
  status: MerchantStatus;
  productsCount: number;
  totalSales: number;
  appliedAt: string;
}

export const adminMerchants: AdminMerchant[] = [
  { id: 'm-1', shopName: 'TechHub Store', ownerName: 'กิตติพงษ์ รุ่งเรือง', status: 'APPROVED', productsCount: 48, totalSales: 892000, appliedAt: '2025-12-11' },
  { id: 'm-2', shopName: 'Urban Thread', ownerName: 'ธนกร ศรีสุข', status: 'APPROVED', productsCount: 32, totalSales: 456000, appliedAt: '2026-01-20' },
  { id: 'm-3', shopName: 'Pure Skin Lab', ownerName: 'อรวรรณ พงษ์ไพร', status: 'APPROVED', productsCount: 21, totalSales: 610000, appliedAt: '2026-02-03' },
  { id: 'm-4', shopName: 'Wonder Toys', ownerName: 'ณัฐพล ทองดี', status: 'PENDING', productsCount: 0, totalSales: 0, appliedAt: '2026-07-28' },
  { id: 'm-5', shopName: 'Greenery Home', ownerName: 'สุพัตรา วงศ์คำ', status: 'PENDING', productsCount: 0, totalSales: 0, appliedAt: '2026-07-30' },
  { id: 'm-6', shopName: 'FastFix Gadgets', ownerName: 'อนุชา ศรีทอง', status: 'SUSPENDED', productsCount: 12, totalSales: 88000, appliedAt: '2025-10-15' },
];

export interface AdminShop {
  id: string;
  name: string;
  category: string;
  status: ShopStatus;
  rating: number;
  productsCount: number;
}

export const adminShops: AdminShop[] = [
  { id: 's-1', name: 'TechHub Store', category: 'อิเล็กทรอนิกส์', status: 'ACTIVE', rating: 4.7, productsCount: 48 },
  { id: 's-2', name: 'Urban Thread', category: 'แฟชั่น', status: 'ACTIVE', rating: 4.8, productsCount: 32 },
  { id: 's-3', name: 'Pure Skin Lab', category: 'ความงาม', status: 'ACTIVE', rating: 4.6, productsCount: 21 },
  { id: 's-4', name: 'Home & Co', category: 'บ้านและสวน', status: 'ACTIVE', rating: 4.7, productsCount: 18 },
  { id: 's-5', name: 'Active Life', category: 'กีฬา', status: 'INACTIVE', rating: 4.5, productsCount: 14 },
  { id: 's-6', name: 'Roast & Brew', category: 'อาหารและเครื่องดื่ม', status: 'ACTIVE', rating: 4.9, productsCount: 9 },
];

export interface AdminProduct {
  id: string;
  name: string;
  emoji: string;
  shopName: string;
  price: number;
  status: 'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED';
}

export const adminProducts: AdminProduct[] = [
  { id: 'p-1', name: 'หูฟังไร้สาย Velnox Air Pro', emoji: '🎧', shopName: 'TechHub Store', price: 1490, status: 'ACTIVE' },
  { id: 'p-3', name: 'เสื้อเชิ้ตลินินทรงหลวม', emoji: '👕', shopName: 'Urban Thread', price: 590, status: 'ACTIVE' },
  { id: 'p-16', name: 'ของเล่นตุ๊กตาผ้าไม่มีฉลาก CE', emoji: '🧸', shopName: 'Wonder Toys', price: 299, status: 'PENDING_REVIEW' },
  { id: 'p-17', name: 'อาหารเสริมลดน้ำหนัก 7 วันเห็นผล', emoji: '💊', shopName: 'FastFix Gadgets', price: 890, status: 'REJECTED' },
  { id: 'p-18', name: 'กระถางต้นไม้เซรามิกมินิมอล', emoji: '🪴', shopName: 'Greenery Home', price: 220, status: 'PENDING_REVIEW' },
];

export const platformOrders: Order[] = [
  { id: 'ao-1', userId: 'u-1', orderNumber: 'VLX-A1B2C3', status: 'DELIVERED', subtotal: 1490, shippingFee: 40, total: 1530, paymentStatus: 'PAID', createdAt: '2026-07-20' },
  { id: 'ao-2', userId: 'u-2', orderNumber: 'VLX-D4E5F6', status: 'SHIPPED', subtotal: 940, shippingFee: 40, total: 980, paymentStatus: 'PAID', createdAt: '2026-07-25' },
  { id: 'ao-3', userId: 'u-1', orderNumber: 'VLX-G7H8I9', status: 'PROCESSING', subtotal: 2290, shippingFee: 0, total: 2290, paymentStatus: 'PAID', createdAt: '2026-07-29' },
  { id: 'ao-4', userId: 'u-4', orderNumber: 'VLX-J1K2L3', status: 'CANCELLED', subtotal: 390, shippingFee: 40, total: 430, paymentStatus: 'REFUNDED', createdAt: '2026-07-10' },
  { id: 'ao-5', userId: 'u-2', orderNumber: 'VLX-N5O6P7', status: 'PENDING', subtotal: 690, shippingFee: 40, total: 730, paymentStatus: 'PENDING', createdAt: '2026-07-31' },
];

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: 'รอดำเนินการ',
  CONFIRMED: 'ยืนยันแล้ว',
  PROCESSING: 'กำลังจัดเตรียม',
  SHIPPED: 'จัดส่งแล้ว',
  DELIVERED: 'ส่งสำเร็จ',
  CANCELLED: 'ยกเลิก',
};

export const orderStatusTone: Record<OrderStatus, 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'primary',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

export const revenueByMonth = [
  { month: 'ก.พ.', amount: 1.8 },
  { month: 'มี.ค.', amount: 2.1 },
  { month: 'เม.ย.', amount: 2.4 },
  { month: 'พ.ค.', amount: 2.9 },
  { month: 'มิ.ย.', amount: 3.3 },
  { month: 'ก.ค.', amount: 3.8 },
];

export const platformStats = {
  gmv: 3_820_000,
  gmvGrowth: 15.2,
  activeUsers: 128_400,
  activeUsersGrowth: 8.6,
  activeMerchants: adminMerchants.filter((m) => m.status === 'APPROVED').length,
  pendingMerchants: adminMerchants.filter((m) => m.status === 'PENDING').length,
  pendingProducts: adminProducts.filter((p) => p.status === 'PENDING_REVIEW').length,
  openOrders: platformOrders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length,
  velrepeatActive: 512,
  velrepeatPaused: 48,
};
