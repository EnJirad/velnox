import { apiClient } from '@/lib/api-client';

export const adminService = {
  overview: () => apiClient.get('/admin/overview'),

  users: {
    list: () => apiClient.get('/admin/users'),
    updateStatus: (id: string, status: string) =>
      apiClient.patch(`/admin/users/${id}/status`, { status }),
  },

  merchants: {
    list: () => apiClient.get('/admin/merchants'),
    approve: (id: string) => apiClient.patch(`/admin/merchants/${id}/approve`),
    reject: (id: string) => apiClient.patch(`/admin/merchants/${id}/reject`),
  },

  shops: {
    list: () => apiClient.get('/admin/shops'),
  },

  products: {
    list: () => apiClient.get('/admin/products'),
  },

  orders: {
    list: () => apiClient.get('/admin/orders'),
  },
};
