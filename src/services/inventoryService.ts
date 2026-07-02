import API from './api';
import { InventoryItem } from '../types';

export const inventoryService = {
  getInventory: async (business_id: string) => {
    const res = await API.get(`/inventory/${business_id}`);
    return Array.isArray(res.data) ? res.data : [];
  },
  getLowStock: async (business_id: string) => {
    const res = await API.get(`/inventory/low-stock/${business_id}`);
    return Array.isArray(res.data) ? res.data : [];
  },
  addItem: async (data: Partial<InventoryItem>) => {
    const res = await API.post('/inventory/', data);
    return res.data;
  },
};
