export interface Product {
  id: string;
  sku: string;
  name: string;
  barcode: string | null;
  cost_price: number;
  selling_price: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  price: number;
  transaction_date: string;
  note: string | null;
  created_at: string;
  product?: Product;
}

export interface InventorySummary {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  cost_price: number;
  selling_price: number;
  min_stock: number;
  current_stock: number;
  total_investment: number;
  total_revenue: number;
  inventory_value: number;
  profit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type TransactionFilter = {
  search?: string;
  type?: 'IN' | 'OUT' | '';
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

export type DashboardData = {
  totalInventoryValue: number;
  totalRevenue: number;
  lowStockCount: number;
  revenueTrend: { date: string; revenue: number }[];
};
