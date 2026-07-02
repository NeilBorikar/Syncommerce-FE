import API from './api';
import { Customer } from '../types';

export const customerService = {
  registerCustomer: async (data: Partial<Customer>) => {
    const res = await API.post('/customers/', data);
    return res.data;
  },
  lookupByPhone: async (phone: string, business_id: string) => {
    const res = await API.get(`/customers/lookup?phone=${phone}&business_id=${business_id}`);
    return res.data;
  },
  listCustomers: async (business_id: string) => {
    const res = await API.get(`/customers/${business_id}`);
    return res.data as Customer[];
  },
  updateCustomer: async (id: string, data: Partial<Customer>) => {
    const res = await API.put(`/customers/${id}`, data);
    return res.data;
  },
  exportExcel: async (business_id: string) => {
    const res = await API.get(`/customers/export/${business_id}`, { responseType: 'blob' });
    return res.data;
  },
};
