import { create } from 'zustand';
import { cartApi } from '@/services/catalog.service';

interface CartProductImage {
  url: string;
}

interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  images: CartProductImage[];
  shop?: { name: string };
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number | string;
  product: CartProduct;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await cartApi.get<{ items: CartItem[] }>();
      set({ items: cart.items ?? [], isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ error: null });
    try {
      const cart = await cartApi.addItem(productId, quantity) as { items: CartItem[] };
      set({ items: cart.items ?? [] });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  updateItem: async (itemId, quantity) => {
    const previous = get().items;
    set({
      items: previous.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    });
    try {
      await cartApi.updateItem(itemId, quantity);
    } catch (err) {
      set({ items: previous, error: (err as Error).message });
    }
  },

  removeItem: async (itemId) => {
    const previous = get().items;
    set({ items: previous.filter((item) => item.id !== itemId) });
    try {
      await cartApi.removeItem(itemId);
    } catch (err) {
      set({ items: previous, error: (err as Error).message });
    }
  },

  clear: () => set({ items: [] }),
}));
