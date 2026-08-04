import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';

export type VelRepeatFrequency = 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
export type VelRepeatPackStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface VelRepeatPack {
  id: string;
  productId: string;
  planCode: string;
  frequency: VelRepeatFrequency;
  totalUnits: number;
  remainingUnits: number;
  unitsPerDelivery: number;
  unitPrice: number;
  packPrice: number;
  freeShipping: boolean;
  status: VelRepeatPackStatus;
  nextDeliveryDate: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    images?: { url: string }[];
    shop?: { name: string };
  };
}

interface PurchasePackInput {
  productId: string;
  planCode: string;
  frequency: VelRepeatFrequency;
  totalUnits: number;
  unitsPerDelivery?: number;
  unitPrice: number;
  packPrice: number;
  freeShipping?: boolean;
}

interface VelRepeatState {
  packs: VelRepeatPack[];
  loading: boolean;
  error: string | null;
  fetchMine: () => Promise<void>;
  purchasePack: (input: PurchasePackInput) => Promise<VelRepeatPack>;
  pause: (id: string) => Promise<void>;
  resume: (id: string) => Promise<void>;
  cancel: (id: string) => Promise<void>;
}

function normalizePack(raw: any): VelRepeatPack {
  return {
    id: raw.id,
    productId: raw.productId,
    planCode: raw.planCode,
    frequency: raw.frequency,
    totalUnits: raw.totalUnits,
    remainingUnits: raw.remainingUnits,
    unitsPerDelivery: raw.unitsPerDelivery ?? 1,
    unitPrice: Number(raw.unitPrice),
    packPrice: Number(raw.packPrice),
    freeShipping: raw.freeShipping ?? true,
    status: raw.status,
    nextDeliveryDate: raw.nextDeliveryDate,
    createdAt: raw.createdAt,
    product: raw.product,
  };
}

export const useVelRepeatStore = create<VelRepeatState>((set, get) => ({
  packs: [],
  loading: false,
  error: null,

  fetchMine: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiClient.get<any[]>('/velrepeat/packs');
      set({ packs: (data ?? []).map(normalizePack), loading: false });
    } catch (e: any) {
      set({ error: e?.message ?? 'โหลดแพ็กไม่สำเร็จ', loading: false });
    }
  },

  purchasePack: async (input) => {
    const created = await apiClient.post<any>('/velrepeat/packs', input);
    const pack = normalizePack(created);
    set({ packs: [pack, ...get().packs] });
    return pack;
  },

  pause: async (id) => {
    const updated = await apiClient.patch<any>(`/velrepeat/packs/${id}/pause`);
    set({
      packs: get().packs.map((p) => (p.id === id ? normalizePack(updated) : p)),
    });
  },

  resume: async (id) => {
    const updated = await apiClient.patch<any>(`/velrepeat/packs/${id}/resume`);
    set({
      packs: get().packs.map((p) => (p.id === id ? normalizePack(updated) : p)),
    });
  },

  cancel: async (id) => {
    const updated = await apiClient.patch<any>(`/velrepeat/packs/${id}/cancel`);
    set({
      packs: get().packs.map((p) => (p.id === id ? normalizePack(updated) : p)),
    });
  },
}));