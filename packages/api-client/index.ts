import axios, { AxiosInstance, AxiosError } from 'axios';

export class VelnoxApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired - attempt refresh
          if (this.refreshToken) {
            try {
              const response = await this.refresh();
              this.setTokens(response.accessToken, response.refreshToken);
              // Retry original request
              return this.client.request(error.config!);
            } catch (refreshError) {
              this.clearTokens();
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (accessToken && refreshToken) {
        this.setTokens(accessToken, refreshToken);
      }
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    delete this.client.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Auth Endpoints
  async register(email: string, password: string, name: string, role: string = 'CUSTOMER') {
    const response = await this.client.post('/auth/register', { email, password, name, role });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    const { accessToken, refreshToken } = response.data;
    this.setTokens(accessToken, refreshToken);
    return response.data;
  }

  async refresh() {
    const response = await this.client.post('/auth/refresh', { refreshToken: this.refreshToken });
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearTokens();
    }
  }

  // User Endpoints
  async getProfile() {
    const response = await this.client.get('/users/profile');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.patch('/users/profile', data);
    return response.data;
  }

  // Product Endpoints
  async getProducts(query?: any) {
    const response = await this.client.get('/products', { params: query });
    return response.data;
  }

  async getProduct(id: string) {
    const response = await this.client.get(`/products/${id}`);
    return response.data;
  }

  async searchProducts(search: string) {
    const response = await this.client.get('/products', { params: { search } });
    return response.data;
  }

  // Cart Endpoints
  async getCart() {
    const response = await this.client.get('/cart');
    return response.data;
  }

  async addToCart(productId: string, quantity: number) {
    const response = await this.client.post('/cart/items', { productId, quantity });
    return response.data;
  }

  async updateCartItem(itemId: string, quantity: number) {
    const response = await this.client.patch(`/cart/items/${itemId}`, { quantity });
    return response.data;
  }

  async removeFromCart(itemId: string) {
    const response = await this.client.delete(`/cart/items/${itemId}`);
    return response.data;
  }

  // Order Endpoints
  async createOrder(data: any) {
    const response = await this.client.post('/orders', data);
    return response.data;
  }

  async getOrders() {
    const response = await this.client.get('/orders');
    return response.data;
  }

  async getOrder(id: string) {
    const response = await this.client.get(`/orders/${id}`);
    return response.data;
  }

  // VelRepeat Endpoints
  async createSubscription(productId: string, frequency: string, quantity: number) {
    const response = await this.client.post('/velrepeat', { productId, frequency, quantity });
    return response.data;
  }

  async getSubscriptions() {
    const response = await this.client.get('/velrepeat');
    return response.data;
  }

  async updateSubscription(id: string, data: any) {
    const response = await this.client.patch(`/velrepeat/${id}`, data);
    return response.data;
  }

  async cancelSubscription(id: string) {
    const response = await this.client.delete(`/velrepeat/${id}`);
    return response.data;
  }

  // Merchant Endpoints
  async getMerchants() {
    const response = await this.client.get('/merchants');
    return response.data;
  }

  async getMerchant(id: string) {
    const response = await this.client.get(`/merchants/${id}`);
    return response.data;
  }

  // Upload Endpoints
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // Merchant Products (for VelMerchant)
  async getMerchantProducts() {
    const response = await this.client.get('/merchant/products');
    return response.data;
  }

  async createProduct(data: any) {
    const response = await this.client.post('/merchant/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: any) {
    const response = await this.client.patch(`/merchant/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string) {
    const response = await this.client.delete(`/merchant/products/${id}`);
    return response.data;
  }

  // Merchant Orders
  async getMerchantOrders() {
    const response = await this.client.get('/merchant/orders');
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string) {
    const response = await this.client.patch(`/merchant/orders/${orderId}`, { status });
    return response.data;
  }

  // Admin Endpoints (VelCenter)
  async getAdminStats() {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }

  async getAdminUsers() {
    const response = await this.client.get('/admin/users');
    return response.data;
  }

  async getAdminMerchants() {
    const response = await this.client.get('/admin/merchants');
    return response.data;
  }

  async approveMerchant(merchantId: string) {
    const response = await this.client.post(`/admin/merchants/${merchantId}/approve`);
    return response.data;
  }

  async rejectMerchant(merchantId: string) {
    const response = await this.client.post(`/admin/merchants/${merchantId}/reject`);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new VelnoxApiClient();
