import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API = axios.create({
  baseURL: 'https://syncommerce.onrender.com/api/v1',
  timeout: 60000, // Increased timeout for Render free tier cold starts
});

// Attach token to every request
API.interceptors.request.use(async (config) => {
  const userToken = await AsyncStorage.getItem('userToken');
  const businessToken = await AsyncStorage.getItem('businessToken');
  
  const token = userToken || businessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for global error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default API;