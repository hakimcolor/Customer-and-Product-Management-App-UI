// Auth
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branch?: string;
  avatar?: string;
  permissions?: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Branch
export interface Branch {
  id: string;
  name: string;
  address?: string;
}

// Product
export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  brand?: string;
  unit: string;
  purchasePrice: number;
  wholesalePrice?: number;
  retailPrice: number;
  minSellingPrice?: number;
  alertQty: number;
  currentStock: number;
  status: 'active' | 'inactive';
  image?: string;
  vat?: number;
  description?: string;
}

// Customer
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSales: number;
  totalPaid: number;
  totalDue: number;
  totalOrders: number;
  createdAt: string;
}

// Supplier
export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  totalPaid: number;
  outstanding: number;
  createdAt: string;
}

// Sale
export interface SaleItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
  discount?: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paid: number;
  due: number;
  status: 'paid' | 'partial' | 'unpaid';
  createdAt: string;
}

// Purchase
export interface Purchase {
  id: string;
  reference: string;
  supplierId: string;
  supplierName: string;
  total: number;
  paid: number;
  due: number;
  status: 'paid' | 'partial' | 'unpaid';
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  netProfit: number;
  cashBalance: number;
  totalReceivable: number;
  totalPayable: number;
  stockValue: number;
  todayExpenses: number;
  lowStock: number;
  outOfStock: number;
  expiringSoon: number;
  slowMoving: number;
  salesGrowth: number;
  purchaseGrowth: number;
  profitGrowth: number;
}

export interface ChartData {
  name: string;
  sales: number;
  profit: number;
  purchases?: number;
}

// API Response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Table
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

// Ledger
export interface LedgerEntry {
  id: number;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  balance: number;
  description: string | null;
  refType: string | null;
  refId: number | null;
  date: string;
  createdAt: string;
  runningBalance: number;
  customer?: { id: number; name: string } | null;
  supplier?: { id: number; name: string } | null;
}

// Account
export interface Account {
  id: number;
  name: string;
  accountType: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  accountNumber?: string | null;
  bankName?: string | null;
  balance: number;
  openingBalance: number;
  status: boolean;
}

// AccountTransaction
export interface AccountTransaction {
  id: number;
  accountId: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  balance: number;
  description: string | null;
  refType: string | null;
  refId: number | null;
  date: string;
  account?: Account;
}
