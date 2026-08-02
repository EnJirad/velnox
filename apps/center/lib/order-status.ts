import type {
  MerchantStatus,
  OrderStatus,
  ProductStatus,
  ShopStatus,
  UserRole,
  UserStatus,
} from '@velnox/types';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: 'รอดำเนินการ',
  CONFIRMED: 'ยืนยันแล้ว',
  PROCESSING: 'กำลังจัดเตรียม',
  SHIPPED: 'จัดส่งแล้ว',
  DELIVERED: 'ส่งสำเร็จ',
  CANCELLED: 'ยกเลิก',
};

export const orderStatusTone: Record<OrderStatus, BadgeTone> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'primary',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

export const paymentStatusLabel: Record<string, string> = {
  PENDING: 'รอชำระ',
  PAID: 'ชำระแล้ว',
  FAILED: 'ล้มเหลว',
  REFUNDED: 'คืนเงินแล้ว',
};

export const paymentStatusTone: Record<string, BadgeTone> = {
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'danger',
  REFUNDED: 'neutral',
};

export const merchantStatusLabel: Record<MerchantStatus, string> = {
  PENDING: 'รออนุมัติ',
  APPROVED: 'อนุมัติแล้ว',
  REJECTED: 'ปฏิเสธ',
  SUSPENDED: 'ระงับ',
};

export const merchantStatusTone: Record<MerchantStatus, BadgeTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  SUSPENDED: 'danger',
};

export const shopStatusLabel: Record<ShopStatus, string> = {
  ACTIVE: 'เปิดใช้งาน',
  INACTIVE: 'ปิดชั่วคราว',
  SUSPENDED: 'ระงับ',
};

export const shopStatusTone: Record<ShopStatus, BadgeTone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  SUSPENDED: 'danger',
};

export const productStatusLabel: Record<ProductStatus, string> = {
  DRAFT: 'รอตรวจ / แบบร่าง',
  ACTIVE: 'เปิดขาย',
  INACTIVE: 'ปิดขาย',
  ARCHIVED: 'เก็บถาวร',
};

export const productStatusTone: Record<ProductStatus, BadgeTone> = {
  DRAFT: 'warning',
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  ARCHIVED: 'neutral',
};

export const userRoleLabel: Record<UserRole, string> = {
  CUSTOMER: 'ลูกค้า',
  MERCHANT: 'ร้านค้า',
  ADMIN: 'แอดมิน',
  SUPER_ADMIN: 'ผู้ดูแลระบบ',
};

export const userStatusLabel: Record<UserStatus, string> = {
  ACTIVE: 'ใช้งานอยู่',
  INACTIVE: 'ไม่ได้ใช้งาน',
  BANNED: 'ถูกระงับ',
};

export const userStatusTone: Record<UserStatus, BadgeTone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  BANNED: 'danger',
};