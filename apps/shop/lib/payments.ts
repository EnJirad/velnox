import { apiClient } from './api-client';

export type PromptPayQrResponse = {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  promptPayIdMasked: string;
  bankAccountName: string | null;
  bankName: string | null;
  qrDataUrl: string;
  message: string;
};

export async function fetchPromptPayQr(orderId: string): Promise<PromptPayQrResponse> {
  return apiClient.get<PromptPayQrResponse>(`/payments/orders/${orderId}/promptpay-qr`);
}
