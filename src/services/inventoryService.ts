import API from './api';
import { InventoryItem } from '../types';

export const inventoryService = {
  createItem: async (data: {
    name: string;
    quantity: number;
    price: number;
    business_id: string;
  }): Promise<InventoryItem> => {
    const res = await API.post('/inventory/', data);
    return res.data;
  },

  getLowStock: async (business_id: string): Promise<InventoryItem[]> => {
    const res = await API.get(`/inventory/low-stock/${business_id}`);
    return Array.isArray(res.data) ? res.data : [];
  },
};
