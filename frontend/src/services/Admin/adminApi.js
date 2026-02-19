import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin Dashboard API calls
export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get users list
  getUsers: async (skip = 0, limit = 10) => {
    try {
      const response = await apiClient.get('/admin/users', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get doctors (médecins)
  getDoctors: async (skip = 0, limit = 10) => {
    try {
      const response = await apiClient.get('/admin/medecins', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  // Get technicians (techniciens)
  getTechnicians: async (skip = 0, limit = 10) => {
    try {
      const response = await apiClient.get('/admin/techniciens', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }
  },

  // Get reports
  getReports: async (skip = 0, limit = 10) => {
    try {
      const response = await apiClient.get('/admin/reports', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  // Get monthly account creation data for charts
  getMonthlyAccountData: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/monthly-accounts');
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly account data:', error);
      throw error;
    }
  },

  // Get account status distribution
  getAccountStatusDistribution: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/account-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching account status:', error);
      throw error;
    }
  },
};

export default adminApi;
