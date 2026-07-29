export type VelRepeatFrequency = 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'CUSTOM';
export type VelRepeatStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface VelRepeatSubscription {
  id: string;
  userId: string;
  productId: string;
  frequency: VelRepeatFrequency;
  quantity: number;
  status: VelRepeatStatus;
  nextOrderDate: string;
  createdAt: string;
}
