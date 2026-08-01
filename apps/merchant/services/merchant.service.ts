import { apiClient } from '@/lib/api-client';

export const shopService = {
  getMine: () => apiClient.get('/shops/mine'),
  updateMine: (payload: { name?: string; description?: string; logoUrl?: string; bannerUrl?: string }) =>
    apiClient.patch('/shops/mine', payload),
};

export interface ProductPayload {
  name: string;
  categoryId: string;
  description?: string;
  price: number;
  stock: number;
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export const productService = {
  listMine: () => apiClient.get('/products/mine'),
  create: (payload: ProductPayload) => apiClient.post('/products', payload),
  update: (id: string, payload: Partial<ProductPayload>) => apiClient.patch(`/products/${id}`, payload),
  remove: (id: string) => apiClient.delete(`/products/${id}`),
};

export const categoryService = {
  list: () => apiClient.get('/categories'),
};

export const merchantOrderService = {
  listMine: () => apiClient.get('/orders/merchant/mine'),
  updateStatus: (orderId: string, status: string) =>
    apiClient.patch(`/orders/${orderId}/status`, { status }),
};
