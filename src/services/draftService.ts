import API from './api';
import { Draft } from '../types';

export const draftService = {
  createDraft: async (data: {
    business_id: string;
    created_by: string;
    items: { name: string; quantity: number; price: number }[];
    discount?: number;
    tax?: number;
    customer_name?: string;
    customer_phone?: string;
    notes?: string;
  }): Promise<Draft> => {
    const res = await API.post('/drafts/', data);
    return res.data;
  },

  updateDraft: async (draft_id: string, data: Partial<Draft> & { user_id?: string }): Promise<Draft> => {
    const res = await API.put(`/drafts/${draft_id}`, data);
    return res.data;
  },

  getDrafts: async (business_id: string): Promise<Draft[]> => {
    const res = await API.get(`/drafts/${business_id}`);
    return Array.isArray(res.data) ? res.data : [];
  },
};
