import API from './api';
import { Employee } from '../types';

export const employeeService = {
  addEmployee: async (data: Partial<Employee> & { password?: string }) => {
    const res = await API.post('/employees/', data);
    return res.data;
  },
  listEmployees: async (business_id: string) => {
    const res = await API.get(`/employees/${business_id}`);
    return res.data as Employee[];
  },
  updateEmployee: async (id: string, data: Partial<Employee>) => {
    const res = await API.put(`/employees/${id}`, data);
    return res.data;
  },
  deleteEmployee: async (id: string, confirmed: boolean) => {
    const res = await API.delete(`/employees/${id}?confirmed=${confirmed}`);
    return res.data;
  },
  suspendEmployee: async (id: string, status: 'active' | 'suspended') => {
    const res = await API.put(`/employees/${id}/suspend?status=${status}`);
    return res.data;
  },
};
