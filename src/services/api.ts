import {
  Product,
  Category,
  Order,
  Review,
  Coupon,
  StoreSettings,
  User,
  SupportTicket,
  Notification,
  HeroBanner,
  SalesReport
} from '../types';

const TOKEN_KEY = 'lgc_auth_token';

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    const res = await apiFetch<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    setAuthToken(res.token);
    return res;
  },

  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const res = await apiFetch<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe() {
    return apiFetch<{ user: User }>('/api/auth/me');
  },

  async updateProfile(data: { name?: string; phone?: string; avatar?: string }) {
    return apiFetch<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return apiFetch<{ success: boolean; message: string }>('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async addAddress(address: any) {
    return apiFetch<{ addresses: any[] }>('/api/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(address)
    });
  },

  async deleteAddress(id: string) {
    return apiFetch<{ addresses: any[] }>(`/api/auth/addresses/${id}`, {
      method: 'DELETE'
    });
  },

  logout() {
    setAuthToken(null);
  },

  // Products
  async getProducts(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<Product[]>(`/api/products${qs}`);
  },

  async getProductById(idOrSlug: string) {
    return apiFetch<Product & { reviews: Review[] }>(`/api/products/${idOrSlug}`);
  },

  async createProduct(data: any) {
    return apiFetch<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateProduct(id: string, data: any) {
    return apiFetch<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteProduct(id: string) {
    return apiFetch<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE'
    });
  },

  async duplicateProduct(id: string) {
    return apiFetch<Product>(`/api/products/${id}/duplicate`, {
      method: 'POST'
    });
  },

  // Categories
  async getCategories() {
    return apiFetch<Category[]>('/api/categories');
  },

  async createCategory(data: Partial<Category>) {
    return apiFetch<Category>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateCategory(id: string, data: Partial<Category>) {
    return apiFetch<Category>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteCategory(id: string) {
    return apiFetch<{ success: boolean }>(`/api/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // Orders
  async createOrder(orderPayload: any) {
    return apiFetch<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
  },

  async getOrders(params: { status?: string; search?: string; userId?: string } = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.userId) query.append('userId', params.userId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<Order[]>(`/api/orders${qs}`);
  },

  async getOrderById(idOrNumber: string) {
    return apiFetch<Order>(`/api/orders/${idOrNumber}`);
  },

  async updateOrderStatus(id: string, data: any) {
    return apiFetch<Order>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Reviews
  async getReviews(params: { productId?: string; status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.productId) query.append('productId', params.productId);
    if (params.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<Review[]>(`/api/reviews${qs}`);
  },

  async createReview(data: { productId: string; rating: number; title: string; comment: string; images?: string[] }) {
    return apiFetch<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateReviewStatus(id: string, status: 'approved' | 'rejected') {
    return apiFetch<Review>(`/api/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Coupons
  async getCoupons() {
    return apiFetch<Coupon[]>('/api/coupons');
  },

  async validateCoupon(code: string, subtotal: number) {
    return apiFetch<{ valid: boolean; coupon: Coupon; discountAmount: number }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal })
    });
  },

  async createCoupon(data: any) {
    return apiFetch<Coupon>('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteCoupon(id: string) {
    return apiFetch<{ success: boolean }>(`/api/coupons/${id}`, {
      method: 'DELETE'
    });
  },

  // Inventory
  async getInventory() {
    return apiFetch<{ items: any[]; totalValuation: number; transactions: any[] }>('/api/inventory');
  },

  async adjustInventory(data: {
    productId: string;
    variantId?: string;
    type: 'stock_in' | 'stock_out' | 'adjustment';
    quantity: number;
    reason: string;
  }) {
    return apiFetch<{ success: boolean; newStock: number; totalStock: number }>('/api/inventory/adjustment', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Customers
  async getCustomers() {
    return apiFetch<User[]>('/api/customers');
  },

  // Support
  async getTickets() {
    return apiFetch<SupportTicket[]>('/api/support/tickets');
  },

  async createTicket(data: any) {
    return apiFetch<SupportTicket>('/api/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async replyTicket(id: string, data: { message: string; senderName?: string; sender?: 'customer' | 'staff' }) {
    return apiFetch<SupportTicket>(`/api/support/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateTicketStatus(id: string, status: string) {
    return apiFetch<SupportTicket>(`/api/support/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Store Settings
  async getSettings() {
    return apiFetch<StoreSettings>('/api/settings');
  },

  async updateSettings(data: Partial<StoreSettings>) {
    return apiFetch<StoreSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Analytics
  async getReports(range: 'today' | '7days' | '30days' | 'month' | 'all' = '30days') {
    return apiFetch<SalesReport & { totalCustomers: number; totalProducts: number; lowStockCount: number; outOfStockCount: number }>(
      `/api/analytics/reports?range=${range}`
    );
  },

  // Newsletter
  async subscribeNewsletter(email: string) {
    return apiFetch<{ message: string }>('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async getNewsletterSubscribers() {
    return apiFetch<{ id: string; email: string; subscribedAt: string }[]>('/api/newsletter/subscribers');
  },

  // CMS
  async getBanners() {
    return apiFetch<HeroBanner[]>('/api/cms/banners');
  },

  async updateBanners(banners: HeroBanner[]) {
    return apiFetch<HeroBanner[]>('/api/cms/banners', {
      method: 'PUT',
      body: JSON.stringify(banners)
    });
  },

  // Notifications
  async getNotifications() {
    return apiFetch<Notification[]>('/api/notifications');
  },

  async markNotificationRead(id: string) {
    return apiFetch<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT'
    });
  }
};
