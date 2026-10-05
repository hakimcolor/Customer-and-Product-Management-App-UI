import apiClient from './client';

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) =>
    apiClient.post('/auth/reset-password', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/auth/change-password', data),
};

// Dashboard
export const dashboardApi = {
  getStats: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/dashboard', { params }),
  getDailySummary: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/daily-summary', { params }),
  // Monthly chart: use dashboard data (no separate endpoint)
  getMonthlyChart: () =>
    apiClient.get('/reports/dashboard', { params: { period: 'month' } }),
  getRecentSales: (params?: Record<string, unknown>) =>
    apiClient.get('/sales', { params }),
  getStockAlerts: () => apiClient.get('/products/stock/alerts'),
};

// Products
export const productsApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/products', { params }),
  getOne: (id: string) => apiClient.get(`/products/${id}`),
  create: (data: unknown) => apiClient.post('/products', data),
  update: (id: string, data: unknown) => apiClient.put(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
  // duplicate not in backend — copy product data instead
  duplicate: (id: string) => apiClient.get(`/products/${id}`),
  getCategories: () => apiClient.get('/products/categories'),
  getBrands: () => apiClient.get('/products/brands'),
  getUnits: () => apiClient.get('/products/units'),
  getStockAlerts: () => apiClient.get('/products/stock/alerts'),
  uploadImage: (id: string, formData: FormData) =>
    apiClient.post(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Customers
export const customersApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/customers', { params }),
  getOne: (id: string) => apiClient.get(`/customers/${id}`),
  create: (data: unknown) => apiClient.post('/customers', data),
  update: (id: string, data: unknown) =>
    apiClient.put(`/customers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/customers/${id}`),
  getLedger: (id: string, params?: Record<string, unknown>) =>
    apiClient.get(`/customers/${id}/ledger`, { params }),
  getSales: (id: string, params?: Record<string, unknown>) =>
    apiClient.get(`/customers/${id}/sales`, { params }),
};

// Suppliers
export const suppliersApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/suppliers', { params }),
  getOne: (id: string) => apiClient.get(`/suppliers/${id}`),
  create: (data: unknown) => apiClient.post('/suppliers', data),
  update: (id: string, data: unknown) =>
    apiClient.put(`/suppliers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/suppliers/${id}`),
};

// Sales
export const salesApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/sales', { params }),
  getOne: (id: string) => apiClient.get(`/sales/${id}`),
  create: (data: unknown) => apiClient.post('/sales', data),
  addPayment: (id: string, data: unknown) =>
    apiClient.post(`/sales/${id}/payment`, data),
  getSummary: (params?: Record<string, unknown>) =>
    apiClient.get('/reports/sales', { params }),
};

// POS
export const posApi = {
  createSale: (data: unknown) => apiClient.post('/pos/sale', data),
  getProducts: (params?: Record<string, unknown>) =>
    apiClient.get('/pos/products', { params }),
};

// Purchases
export const purchasesApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/purchases', { params }),
  getOne: (id: string) => apiClient.get(`/purchases/${id}`),
  create: (data: unknown) => apiClient.post('/purchases', data),
  addPayment: (id: string, data: unknown) =>
    apiClient.post(`/purchases/${id}/payment`, data),
};

// Payments
export const paymentsApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/payments', { params }),
  // Backend has separate endpoints for customer/supplier payments
  create: (data: Record<string, unknown>) => {
    if (data.type === 'customer') {
      const { type: _, ...rest } = data;
      return apiClient.post('/payments/customer', rest);
    } else {
      const { type: _, ...rest } = data;
      return apiClient.post('/payments/supplier', rest);
    }
  },
  createCustomer: (data: unknown) => apiClient.post('/payments/customer', data),
  createSupplier: (data: unknown) => apiClient.post('/payments/supplier', data),
};

// Expenses
export const expensesApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/expenses', { params }),
  create: (data: unknown) => apiClient.post('/expenses', data),
  update: (id: string, data: unknown) => apiClient.put(`/expenses/${id}`, data),
  delete: (id: string) => apiClient.delete(`/expenses/${id}`),
};

// Inventory
export const inventoryApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/products/inventory', { params }),
  getAlerts: () => apiClient.get('/products/alerts'),
  adjustStock: (data: unknown) => apiClient.post('/products/adjust', data),
};

// Accounts
export const accountsApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/accounts', { params }),
  getOne: (id: string) => apiClient.get(`/accounts/${id}`),
  create: (data: unknown) => apiClient.post('/accounts', data),
  update: (id: string, data: unknown) => apiClient.put(`/accounts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/accounts/${id}`),
  getTransactions: (id: string, params?: Record<string, unknown>) =>
    apiClient.get(`/accounts/${id}/transactions`, { params }),
  getAllTransactions: (params?: Record<string, unknown>) =>
    apiClient.get('/accounts/transactions', { params }),
  deposit: (data: unknown) => apiClient.post('/accounts/deposit', data),
  withdraw: (data: unknown) => apiClient.post('/accounts/withdraw', data),
  transfer: (data: unknown) => apiClient.post('/accounts/transfer', data),
  getStatement: (id: string, params?: Record<string, unknown>) =>
    apiClient.get(`/accounts/${id}/statement`, { params }),
};

// Reports
export const reportsApi = {
  sales: (params: Record<string, unknown>) =>
    apiClient.get('/reports/sales', { params }),
  purchases: (params: Record<string, unknown>) =>
    apiClient.get('/reports/purchases', { params }),
  inventory: (params: Record<string, unknown>) =>
    apiClient.get('/reports/inventory', { params }),
  profit: (params: Record<string, unknown>) =>
    apiClient.get('/reports/profit', { params }),
  ledger: (params: Record<string, unknown>) =>
    apiClient.get('/reports/ledger', { params }),
  cashFlow: (params: Record<string, unknown>) =>
    apiClient.get('/reports/cash-flow', { params }),
};

// Users
export const usersApi = {
  getAll: () => apiClient.get('/users'),
  create: (data: unknown) => apiClient.post('/users', data),
  update: (id: string, data: unknown) => apiClient.put(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

// Branches
export const branchesApi = {
  getAll: () => apiClient.get('/branches'),
  create: (data: unknown) => apiClient.post('/branches', data),
  update: (id: string, data: unknown) => apiClient.put(`/branches/${id}`, data),
  delete: (id: string) => apiClient.delete(`/branches/${id}`),
};

// Settings
export const settingsApi = {
  get: () => apiClient.get('/settings'),
  update: (data: unknown) => apiClient.post('/settings/bulk', data),
  upsert: (key: string, value: string) =>
    apiClient.post('/settings', { key, value }),
};

// Notifications
export const notificationsApi = {
  getAll: () => apiClient.get('/notifications'),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
};

// Categories
export const categoriesApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/products/categories', { params }),
  create: (data: unknown) => apiClient.post('/products/categories', data),
  update: (id: string, data: unknown) =>
    apiClient.put(`/products/categories/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/categories/${id}`),
};

// Brands
export const brandsApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/products/brands', { params }),
  create: (data: unknown) => apiClient.post('/products/brands', data),
  update: (id: string, data: unknown) =>
    apiClient.put(`/products/brands/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/brands/${id}`),
};

// Units
export const unitsApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/products/units', { params }),
  create: (data: unknown) => apiClient.post('/products/units', data),
  update: (id: string, data: unknown) =>
    apiClient.put(`/products/units/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/units/${id}`),
};

// Audit
export const auditApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/audit', { params }),
};
