import { apiClient, uploadImage } from './api-client';

export type PromptPayQrResponse = {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  promptPayIdMasked: string;
  bankAccountName: string | null;
  bankName: string | null;
  qrDataUrl: string;
  slipUrl?: string | null;
  createdAt?: string;
  expiresAt?: string;
  paymentWindowHours?: number;
  message: string;
};

export async function fetchPromptPayQr(orderId: string): Promise<PromptPayQrResponse> {
  return apiClient.get<PromptPayQrResponse>(`/payments/orders/${orderId}/promptpay-qr`);
}

export async function submitPaymentSlip(orderId: string, slipUrl: string) {
  return apiClient.post<{
    success: boolean;
    orderId: string;
    orderNumber: string;
    slipUrl: string;
    message: string;
  }>(`/payments/orders/${orderId}/slip`, { slipUrl });
}

export async function uploadAndSubmitSlip(orderId: string, file: File) {
  const uploaded = await uploadImage(file, 'slips' as 'products');
  return submitPaymentSlip(orderId, uploaded.url);
}
