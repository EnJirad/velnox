export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItemProduct {
  id: string;
  name: string;
  slug?: string;
  images?: { url: string }[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  merchantId: string;
  quantity: number;
  price: number;
  product?: OrderItemProduct;
}

export interface OrderPayment {
  id: string;
  method: string;
  amount: number;
  status: PaymentStatus;
  transactionId?: string | null;
  paidAt?: string | null;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentStatus: PaymentStatus;
  items?: OrderItem[];
  payment?: OrderPayment | null;
  createdAt: string;
}
