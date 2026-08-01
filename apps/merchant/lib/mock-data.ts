import type { Order, OrderStatus } from '@velnox/types';

export interface MerchantProduct {
  id: string;
  name: string;
  emoji: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE';
}

export const merchantProducts: MerchantProduct[] = [
  { id: 'p-1', name: 'หูฟังไร้สาย Velnox Air Pro', emoji: '🎧', category: 'อิเล็กทรอนิกส์', price: 1490, stock: 82, sold: 1200, status: 'ACTIVE' },
  { id: 'p-2', name: 'สมาร์ทวอทช์ Velnox Fit 3', emoji: '⌚', category: 'อิเล็กทรอนิกส์', price: 2290, stock: 45, sold: 860, status: 'ACTIVE' },
  { id: 'p-12', name: 'ลำโพงบลูทูธกันน้ำ', emoji: '🔊', category: 'อิเล็กทรอนิกส์', price: 890, stock: 6, sold: 430, status: 'ACTIVE' },
  { id: 'p-13', name: 'สายชาร์จ USB-C ถัก 2 เมตร', emoji: '🔌', category: 'อิเล็กทรอนิกส์', price: 190, stock: 0, sold: 980, status: 'INACTIVE' },
  { id: 'p-14', name: 'พาวเวอร์แบงค์ 20000mAh', emoji: '🔋', category: 'อิเล็กทรอนิกส์', price: 690, stock: 15, sold: 512, status: 'ACTIVE' },
  { id: 'p-15', name: 'เคสกันกระแทกรุ่นใหม่', emoji: '📱', category: 'อิเล็กทรอนิกส์', price: 259, stock: 3, sold: 210, status: 'DRAFT' },
];

export const merchantOrders: Order[] = [
  { id: 'mo-1', userId: 'u-9', orderNumber: 'VLX-M1A2B3', status: 'PENDING', subtotal: 1490, shippingFee: 40, total: 1530, paymentStatus: 'PAID', createdAt: '2026-07-31' },
  { id: 'mo-2', userId: 'u-8', orderNumber: 'VLX-M4C5D6', status: 'CONFIRMED', subtotal: 890, shippingFee: 40, total: 930, paymentStatus: 'PAID', createdAt: '2026-07-30' },
  { id: 'mo-3', userId: 'u-7', orderNumber: 'VLX-M7E8F9', status: 'PROCESSING', subtotal: 2290, shippingFee: 0, total: 2290, paymentStatus: 'PAID', createdAt: '2026-07-29' },
  { id: 'mo-4', userId: 'u-6', orderNumber: 'VLX-MG1H2I', status: 'SHIPPED', subtotal: 690, shippingFee: 40, total: 730, paymentStatus: 'PAID', createdAt: '2026-07-28' },
  { id: 'mo-5', userId: 'u-5', orderNumber: 'VLX-MJ3K4L', status: 'DELIVERED', subtotal: 1490, shippingFee: 40, total: 1530, paymentStatus: 'PAID', createdAt: '2026-07-24' },
  { id: 'mo-6', userId: 'u-4', orderNumber: 'VLX-MM5N6O', status: 'CANCELLED', subtotal: 259, shippingFee: 40, total: 299, paymentStatus: 'REFUNDED', createdAt: '2026-07-20' },
];

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: 'รอยืนยัน',
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

export const salesByDay = [
  { day: 'จ.', amount: 8200 },
  { day: 'อ.', amount: 6400 },
  { day: 'พ.', amount: 9100 },
  { day: 'พฤ.', amount: 7300 },
  { day: 'ศ.', amount: 11200 },
  { day: 'ส.', amount: 15800 },
  { day: 'อา.', amount: 12600 },
];

export const dashboardStats = {
  revenueToday: 12600,
  revenueGrowth: 18.4,
  ordersToday: 24,
  ordersGrowth: 6.2,
  pendingOrders: merchantOrders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length,
  lowStockCount: merchantProducts.filter((p) => p.stock > 0 && p.stock <= 10).length,
};
