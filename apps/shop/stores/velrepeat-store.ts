import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VelRepeatFrequency = 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'CUSTOM';
export type VelRepeatStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';

export interface Subscription {
  id: string;
  productId: string;
  productName: string;
  emoji: string;
  price: number;
  frequency: VelRepeatFrequency;
  quantity: number;
  status: VelRepeatStatus;
  nextOrderDate: string;
  createdAt: string;
}

function computeNextOrderDate(frequency: VelRepeatFrequency): string {
  const date = new Date();
  if (frequency === 'WEEKLY') date.setDate(date.getDate() + 7);
  else if (frequency === 'BI_WEEKLY') date.setDate(date.getDate() + 14);
  else if (frequency === 'MONTHLY') date.setMonth(date.getMonth() + 1);
  else date.setDate(date.getDate() + 30);
  return date.toISOString();
}

interface VelRepeatState {
  subscriptions: Subscription[];
  subscribe: (input: {
    productId: string;
    productName: string;
    emoji: string;
    price: number;
    frequency: VelRepeatFrequency;
    quantity: number;
  }) => void;
  pause: (id: string) => void;
  resume: (id: string) => void;
  cancel: (id: string) => void;
}

export const useVelRepeatStore = create<VelRepeatState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      subscribe: (input) => {
        const newSub: Subscription = {
          id: `sub-${Date.now()}`,
          ...input,
          status: 'ACTIVE',
          nextOrderDate: computeNextOrderDate(input.frequency),
          createdAt: new Date().toISOString(),
        };
        set({ subscriptions: [newSub, ...get().subscriptions] });
      },
      pause: (id) =>
        set({
          subscriptions: get().subscriptions.map((s) => (s.id === id ? { ...s, status: 'PAUSED' } : s)),
        }),
      resume: (id) =>
        set({
          subscriptions: get().subscriptions.map((s) =>
            s.id === id ? { ...s, status: 'ACTIVE', nextOrderDate: computeNextOrderDate(s.frequency) } : s,
          ),
        }),
      cancel: (id) =>
        set({
          subscriptions: get().subscriptions.map((s) => (s.id === id ? { ...s, status: 'CANCELLED' } : s)),
        }),
    }),
    { name: 'velnox-shop-velrepeat' },
  ),
);
