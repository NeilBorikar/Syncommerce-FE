import API from './api';
import { Report } from '../types';

export const reportService = {
  generateReport: async (business_id: string): Promise<Report> => {
    const res = await API.post(`/reports/${business_id}`);
    return res.data;
  },
};
