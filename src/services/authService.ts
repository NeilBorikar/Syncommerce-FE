import API from './api';
import { User } from '../types';

export interface LoginResponse {
  access_token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Backend uses query params for login
    const res = await API.post(
      `/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    );
    return res.data;
  },

  register: async (name: string, email: string, password: string, role = 'worker') => {
    const res = await API.post('/auth/register', { name, email, password, role });
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await API.get('/users/me');
    return res.data;
  },
};