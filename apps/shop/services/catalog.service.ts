import { apiClient, serverFetch } from '@/lib/api-client';
import type { Category, PaginatedResult, Product } from '@velnox/types';

export const catalogService = {
  listProducts(params: { search?: string; categoryId?: string; page?: number } = {}) {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.categoryId) qs.set('categoryId', params.categoryId);
    if (params.page) qs.set('page', String(params.page));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return serverFetch<PaginatedResult<Product>>(`/products${suffix}`, 15);
  },

  getProduct(slug: string) {
    return serverFetch<Product>(`/products/${slug}`, 15);
  },

  listCategories() {
    return serverFetch<Category[]>('/categories', 300);
  },
};

export const cartApi = {
  get: () => apiClient.get('/cart'),
  addItem: (productId: string, quantity: number) =>
    apiClient.post('/cart/items', { productId, quantity }),
  updateItem: (itemId: string, quantity: number) =>
    apiClient.patch(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => apiClient.delete(`/cart/items/${itemId}`),
};

export const orderApi = {
  checkout: (payload: {
    recipientName: string;
    phone: string;
    addressLine: string;
    city: string;
    province: string;
    postalCode: string;
  }) => apiClient.post('/orders', payload),
  listMine: () => apiClient.get('/orders'),
  getOne: (id: string) => apiClient.get(`/orders/${id}`),
};
