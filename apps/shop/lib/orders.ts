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
  card: 'บัตรเครดิต/เดบิต',
  cod: 'เก็บเงินปลายทาง',
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
): Promise<Order> {
  if (items.length === 0) {
    throw new Error('ตะกร้าว่าง');
  }

  await apiClient.delete('/cart');
  for (const item of items) {
    await apiClient.post('/cart/items', {
      productId: item.productId,
      quantity: item.quantity,
    });
  }

  return apiClient.post<Order>('/orders/checkout', { paymentMethod });
}
