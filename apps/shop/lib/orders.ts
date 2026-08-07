import { apiClient } from './api-client';
import type { Order } from '@velnox/types';
import type { CartItem } from '@/stores/cart-store';

export const orderStatusLabel: Record<Order['status'], string> = {
  PENDING: 'รอดำเนินการ',
  CONFIRMED: 'ยืนยันแล้ว',
  PROCESSING: 'กำลังจัดเตรียม',
  SHIPPED: 'จัดส่งแล้ว',
  DELIVERED: 'ส่งสำเร็จ',
  CANCELLED: 'ยกเลิก',
};

export const orderStatusTone: Record<
  Order['status'],
  'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'primary',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

export const paymentMethodLabel: Record<string, string> = {
  promptpay: 'พร้อมเพย์',
  PROMPTPAY: 'พร้อมเพย์',
  PROMPTPAY_QR: 'พร้อมเพย์ (QR)',
  card: 'บัตรเครดิต/เดบิต',
  CARD: 'บัตรเครดิต/เดบิต',
  cod: 'เก็บเงินปลายทาง',
  COD: 'เก็บเงินปลายทาง',
  bank_transfer: 'โอนธนาคาร',
  BANK_TRANSFER: 'โอนธนาคาร',
};

export function formatPaymentMethod(method?: string | null): string {
  if (!method) return '—';
  return paymentMethodLabel[method] ?? paymentMethodLabel[method.toLowerCase()] ?? method;
}

/** ขั้นตอนสถานะออเดอร์สำหรับ timeline */
export const ORDER_STEPS = [
  { key: 'PENDING', label: 'รอชำระ/รอดำเนินการ' },
  { key: 'PROCESSING', label: 'กำลังจัดเตรียม' },
  { key: 'SHIPPED', label: 'กำลังจัดส่ง' },
  { key: 'DELIVERED', label: 'ส่งสำเร็จ' },
] as const;


export type ShippingAddressInput = {
  name: string;
  phone: string;
  addressLine: string;
  province: string;
  postalCode: string;
  country?: string;
};

export async function fetchMyOrders(): Promise<Order[]> {
  return apiClient.get<Order[]>('/orders/me');
}

/**
 * Sync client-side cart → backend cart, then create order from server cart.
 * Backend checkout reads the authenticated user's server cart only.
 */
export async function checkoutFromClientCart(
  items: CartItem[],
  paymentMethod: 'promptpay' | 'card' | 'cod' = 'promptpay',
  shippingAddress: ShippingAddressInput,
): Promise<Order> {
  if (items.length === 0) {
    throw new Error('ตะกร้าว่าง');
  }
  if (
    !shippingAddress?.name?.trim() ||
    !shippingAddress?.phone?.trim() ||
    !shippingAddress?.addressLine?.trim() ||
    !shippingAddress?.province?.trim() ||
    !shippingAddress?.postalCode?.trim()
  ) {
    throw new Error('กรุณากรอกที่อยู่จัดส่งให้ครบ');
  }

  await apiClient.delete('/cart');
  for (const item of items) {
    await apiClient.post('/cart/items', {
      productId: item.productId,
      quantity: item.quantity,
    });
  }

  return apiClient.post<Order>('/orders/checkout', {
    paymentMethod,
    shippingAddress: {
      name: shippingAddress.name.trim(),
      phone: shippingAddress.phone.trim(),
      addressLine: shippingAddress.addressLine.trim(),
      province: shippingAddress.province.trim(),
      postalCode: shippingAddress.postalCode.trim(),
      country: shippingAddress.country ?? 'TH',
    },
  });
}
