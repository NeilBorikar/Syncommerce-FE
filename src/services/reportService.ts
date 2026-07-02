import API from './api';
import { Report } from '../types';

export const reportService = {
  generateReport: async (business_id: string) => {
    const res = await API.post(`/reports/${business_id}`);
    return res.data as Report;
  },
  getSalesReport: async (business_id: string, from_date: string, to_date: string) => {
    const res = await API.get(`/reports/sales?business_id=${business_id}&from_date=${from_date}&to_date=${to_date}`);
    return res.data;
  },
  getInventoryReport: async (business_id: string) => {
    const res = await API.get(`/reports/inventory?business_id=${business_id}`);
    return res.data;
  },
  getEmployeePerformance: async (business_id: string, from_date: string, to_date: string) => {
    const res = await API.get(`/reports/employees?business_id=${business_id}&from_date=${from_date}&to_date=${to_date}`);
    return res.data;
  },
  getGstReport: async (business_id: string, month: number, year: number) => {
    const res = await API.get(`/reports/gst?business_id=${business_id}&month=${month}&year=${year}`);
    return res.data;
  },
};
