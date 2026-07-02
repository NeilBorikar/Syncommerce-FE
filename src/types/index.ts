export interface BillItem {
  name: string;
  quantity: number;
  price: number;
  gst_percent?: number;
}

export interface Bill {
  id: string;
  business_id: string;
  branch_id?: string;
  created_by: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  billing_address?: string;
  shipping_address?: string;
  items: BillItem[];
  discount: number;
  tax: number;
  gst_total?: number;
  total: number;
  status: 'final' | 'draft';
  notes?: string;
  created_at: string;
}

export interface Draft {
  id: string;
  business_id: string;
  created_by: string;
  items: BillItem[];
  discount: number;
  tax: number;
  total?: number;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
  updated_at?: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'worker';
  business_id?: string;
  branch_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface Report {
  id?: string;
  business_id: string;
  total_sales: number;
  total_orders: number;
  date: string;
}

export interface InventoryItem {
  id: string;
  business_id: string;
  branch_id?: string;
  sku?: string;
  name: string;
  category?: string;
  quantity: number;
  cost_price?: number;
  selling_price?: number;
  price: number;
  unit?: string;
  description?: string;
  low_stock_threshold?: number;
}

export interface Business {
  id: string;
  name: string;
  email: string;
  owner_id: string;
  address?: string;
  phone?: string;
  created_at: string;
}

export interface AuthState {
  businessToken: string | null;
  business: Business | null;
  userToken: string | null;
  user: User | null;
  usersInBusiness: User[];
}

export interface Customer {
  id: string;
  business_id: string;
  branch_id?: string;
  name: string;
  phone: string;
  billing_address?: string;
  shipping_address?: string;
  email?: string;
  total_spend: number;
  bill_count: number;
  favorite_items: Array<{ name: string; count: number }>;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'owner' | 'manager' | 'worker';
  salary: number;
  date_joined?: string;
  status: 'active' | 'suspended';
  business_id?: string;
  branch_id?: string;
  created_at: string;
}

export interface Branch {
  id: string;
  business_id: string;
  name: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface SalesReport {
  total_sales: number;
  total_orders: number;
  total_profit: number;
  gst_total: number;
  top_products: Array<{ name: string; quantity: number; revenue: number }>;
  employee_performance: Array<{ name: string; bills_created: number; sales_generated: number; avg_bill: number }>;
  date_range: { from: string; to: string };
}

export interface InventoryReport {
  low_stock: InventoryItem[];
  out_of_stock: InventoryItem[];
  fast_moving: Array<{ name: string; sold_quantity: number }>;
  slow_moving: Array<{ name: string; sold_quantity: number }>;
}
