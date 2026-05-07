import API from './api';
import { Bill } from '../types';

export const billService = {
  createBill: async (data: {
    business_id: string;
    created_by: string;
    items: { name: string; quantity: number; price: number }[];
    discount?: number;
    tax?: number;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
  }): Promise<Bill> => {
    const res = await API.post('/bills/', data);
    return res.data;
  },

  getBills: async (business_id: string): Promise<Bill[]> => {
    const res = await API.get(`/bills/${business_id}`);
    return Array.isArray(res.data) ? res.data : [];
  },
};
