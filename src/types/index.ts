export interface BillItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Bill {
  id: string;
  business_id: string;
  created_by: string;
  items: BillItem[];
  discount: number;
  tax: number;
  total: number;
  status: 'final' | 'draft';
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  notes?: string;
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
  name: string;
  quantity: number;
  price: number;
  business_id: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  business_id: string | null;
}
