import apiClient from './client';
import type { ApiResponse, PaginatedResponse } from '@/types';

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<{ token: string; user: unknown }>>(
      '/auth/login',
      data
    ),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) =>
    apiClient.post('/auth/reset-password', data),
};

// Dashboard
export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getChartData: (period: string) =>
    apiClient.get(`/dashboard/chart?period=${period}`),
  getRecentSales: () => apiClient.get('/dashboard/recent-sales'),
};

// Products
export const productsApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<unknown>>('/products', { params }),
  getOne: (id: string) => apiClient.get(`/products/${id}`),
  create: (data: unknown) => apiClient.post('/products', data),
  update: (id: string, data: unknown) => apiClient.put(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
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
  getLedger: (id: string) => apiClient.get(`/customers/${id}/ledger`),
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

// Inventory
export const inventoryApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/inventory', { params }),
  getAlerts: () => apiClient.get('/inventory/alerts'),
  adjustStock: (data: unknown) => apiClient.post('/inventory/adjust', data),
  transfer: (data: unknown) => apiClient.post('/inventory/transfer', data),
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
};
