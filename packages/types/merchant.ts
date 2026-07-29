export type MerchantStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type ShopStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Merchant {
  id: string;
  userId: string;
  status: MerchantStatus;
  approvedAt: string | null;
  createdAt: string;
}

export interface Shop {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: ShopStatus;
  createdAt: string;
}
