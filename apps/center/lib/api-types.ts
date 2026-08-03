export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: string;
}

export interface ApiMerchant {
  id: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  approvedAt: string | null;
  user?: { id: string; name: string; email: string };
  shops?: { id: string; name: string }[];
}

export interface PlatformSettings {
  id: string;
  platformName: string;
  commissionPercent: number;
  autoApproveMerchants: boolean;
  requireProductReview: boolean;
  paymentCreditCard: boolean;
  paymentPromptPay: boolean;
  paymentBankTransfer: boolean;
  paymentCod: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpdatePlatformSettingsPayload = Partial<
  Omit<PlatformSettings, 'id' | 'createdAt' | 'updatedAt'>
>;
