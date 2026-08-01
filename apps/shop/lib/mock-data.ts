import type { Category, Order, Product } from '@velnox/types';

export const categories: Category[] = [
  { id: 'cat-1', name: 'อิเล็กทรอนิกส์', slug: 'electronics', imageUrl: null, parentId: null, status: 'ACTIVE' },
  { id: 'cat-2', name: 'แฟชั่น', slug: 'fashion', imageUrl: null, parentId: null, status: 'ACTIVE' },
  { id: 'cat-3', name: 'ความงาม', slug: 'beauty', imageUrl: null, parentId: null, status: 'ACTIVE' },
  { id: 'cat-4', name: 'บ้านและสวน', slug: 'home-garden', imageUrl: null, parentId: null, status: 'ACTIVE' },
  { id: 'cat-5', name: 'อาหารและเครื่องดื่ม', slug: 'food-beverage', imageUrl: null, parentId: null, status: 'ACTIVE' },
  { id: 'cat-6', name: 'กีฬา', slug: 'sports', imageUrl: null, parentId: null, status: 'ACTIVE' },
];

export interface MockProduct extends Product {
  categoryName: string;
  shopName: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  emoji: string;
}

export const products: MockProduct[] = [
  {
    id: 'p-1', shopId: 's-1', categoryId: 'cat-1', name: 'หูฟังไร้สาย Velnox Air Pro',
    slug: 'velnox-air-pro', description: 'หูฟังไร้สายตัดเสียงรบกวน แบตอึด 30 ชม.',
    price: 1490, stock: 82, status: 'ACTIVE', createdAt: '2026-06-01',
    categoryName: 'อิเล็กทรอนิกส์', shopName: 'TechHub Store', rating: 4.8, reviewCount: 342, soldCount: 1200, emoji: '🎧',
  },
  {
    id: 'p-2', shopId: 's-1', categoryId: 'cat-1', name: 'สมาร์ทวอทช์ Velnox Fit 3',
    slug: 'velnox-fit-3', description: 'วัดชีพจร นับก้าว กันน้ำ IP68',
    price: 2290, stock: 45, status: 'ACTIVE', createdAt: '2026-06-05',
    categoryName: 'อิเล็กทรอนิกส์', shopName: 'TechHub Store', rating: 4.6, reviewCount: 210, soldCount: 860, emoji: '⌚',
  },
  {
    id: 'p-3', shopId: 's-2', categoryId: 'cat-2', name: 'เสื้อเชิ้ตลินินทรงหลวม',
    slug: 'linen-shirt', description: 'ผ้าลินินแท้ ระบายอากาศดี ใส่สบาย',
    price: 590, stock: 120, status: 'ACTIVE', createdAt: '2026-06-10',
    categoryName: 'แฟชั่น', shopName: 'Urban Thread', rating: 4.7, reviewCount: 156, soldCount: 640, emoji: '👕',
  },
  {
    id: 'p-4', shopId: 's-2', categoryId: 'cat-2', name: 'กระเป๋าสะพายหนัง Minimal',
    slug: 'minimal-leather-bag', description: 'หนัง PU คุณภาพสูง ทรงมินิมอล',
    price: 1290, stock: 30, status: 'ACTIVE', createdAt: '2026-06-12',
    categoryName: 'แฟชั่น', shopName: 'Urban Thread', rating: 4.9, reviewCount: 98, soldCount: 310, emoji: '👜',
  },
  {
    id: 'p-5', shopId: 's-3', categoryId: 'cat-3', name: 'เซรั่มวิตามินซี Glow Boost',
    slug: 'vitamin-c-serum', description: 'ผิวกระจ่างใส ลดจุดด่างดำ 30 มล.',
    price: 390, stock: 200, status: 'ACTIVE', createdAt: '2026-06-15',
    categoryName: 'ความงาม', shopName: 'Pure Skin Lab', rating: 4.7, reviewCount: 502, soldCount: 2100, emoji: '🧴',
  },
  {
    id: 'p-6', shopId: 's-3', categoryId: 'cat-3', name: 'ชุดแปรงแต่งหน้า 12 ชิ้น',
    slug: 'makeup-brush-set', description: 'ขนแปรงนุ่ม พร้อมกระเป๋าใส่',
    price: 450, stock: 75, status: 'ACTIVE', createdAt: '2026-06-18',
    categoryName: 'ความงาม', shopName: 'Pure Skin Lab', rating: 4.5, reviewCount: 87, soldCount: 420, emoji: '💄',
  },
  {
    id: 'p-7', shopId: 's-4', categoryId: 'cat-4', name: 'โคมไฟตั้งโต๊ะปรับแสง',
    slug: 'adjustable-desk-lamp', description: 'ปรับความสว่างได้ 5 ระดับ ชาร์จ USB-C',
    price: 690, stock: 60, status: 'ACTIVE', createdAt: '2026-06-20',
    categoryName: 'บ้านและสวน', shopName: 'Home & Co', rating: 4.6, reviewCount: 133, soldCount: 500, emoji: '💡',
  },
  {
    id: 'p-8', shopId: 's-4', categoryId: 'cat-4', name: 'ต้นไม้ฟอกอากาศในกระถาง',
    slug: 'air-purifying-plant', description: 'ไม้ฟอกอากาศ ดูแลง่าย พร้อมกระถางเซรามิก',
    price: 320, stock: 90, status: 'ACTIVE', createdAt: '2026-06-22',
    categoryName: 'บ้านและสวน', shopName: 'Home & Co', rating: 4.8, reviewCount: 61, soldCount: 275, emoji: '🪴',
  },
  {
    id: 'p-9', shopId: 's-5', categoryId: 'cat-6', name: 'เสื่อโยคะกันลื่น 6 มม.',
    slug: 'non-slip-yoga-mat', description: 'หนา 6 มม. กันลื่น พร้อมสายรัด',
    price: 490, stock: 110, status: 'ACTIVE', createdAt: '2026-06-25',
    categoryName: 'กีฬา', shopName: 'Active Life', rating: 4.7, reviewCount: 177, soldCount: 690, emoji: '🧘',
  },
  {
    id: 'p-10', shopId: 's-5', categoryId: 'cat-6', name: 'ขวดน้ำสเตนเลสเก็บความเย็น',
    slug: 'stainless-water-bottle', description: 'เก็บความเย็น 24 ชม. ขนาด 750 มล.',
    price: 350, stock: 150, status: 'ACTIVE', createdAt: '2026-06-27',
    categoryName: 'กีฬา', shopName: 'Active Life', rating: 4.9, reviewCount: 244, soldCount: 980, emoji: '🍶',
  },
  {
    id: 'p-11', shopId: 's-6', categoryId: 'cat-5', name: 'กาแฟดริปคั่วกลาง 12 ซอง',
    slug: 'drip-coffee-set', description: 'เมล็ดอาราบิก้า 100% คั่วสด',
    price: 259, stock: 300, status: 'ACTIVE', createdAt: '2026-06-28',
    categoryName: 'อาหารและเครื่องดื่ม', shopName: 'Roast & Brew', rating: 4.8, reviewCount: 390, soldCount: 1560, emoji: '☕',
  },
  {
    id: 'p-12', shopId: 's-1', categoryId: 'cat-1', name: 'ลำโพงบลูทูธกันน้ำ',
    slug: 'bluetooth-speaker', description: 'เสียงรอบทิศทาง กันน้ำ IPX7',
    price: 890, stock: 55, status: 'ACTIVE', createdAt: '2026-06-29',
    categoryName: 'อิเล็กทรอนิกส์', shopName: 'TechHub Store', rating: 4.5, reviewCount: 128, soldCount: 430, emoji: '🔊',
  },
];

export const orders: Order[] = [
  {
    id: 'o-1', userId: 'u-1', orderNumber: 'VLX-A1B2C3', status: 'DELIVERED',
    subtotal: 1490, shippingFee: 40, total: 1530, paymentStatus: 'PAID', createdAt: '2026-07-20',
  },
  {
    id: 'o-2', userId: 'u-1', orderNumber: 'VLX-D4E5F6', status: 'SHIPPED',
    subtotal: 940, shippingFee: 40, total: 980, paymentStatus: 'PAID', createdAt: '2026-07-25',
  },
  {
    id: 'o-3', userId: 'u-1', orderNumber: 'VLX-G7H8I9', status: 'PROCESSING',
    subtotal: 2290, shippingFee: 0, total: 2290, paymentStatus: 'PAID', createdAt: '2026-07-29',
  },
  {
    id: 'o-4', userId: 'u-1', orderNumber: 'VLX-J1K2L3', status: 'CANCELLED',
    subtotal: 390, shippingFee: 40, total: 430, paymentStatus: 'REFUNDED', createdAt: '2026-07-10',
  },
];

export const orderStatusLabel: Record<Order['status'], string> = {
  PENDING: 'รอดำเนินการ',
  CONFIRMED: 'ยืนยันแล้ว',
  PROCESSING: 'กำลังจัดเตรียม',
  SHIPPED: 'จัดส่งแล้ว',
  DELIVERED: 'ส่งสำเร็จ',
  CANCELLED: 'ยกเลิก',
};

export const orderStatusTone: Record<Order['status'], 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'primary',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};
