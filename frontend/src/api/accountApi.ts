import api from './axiosConfig';
import type { Account } from '../types/models';

export const accountApi = {
  signIn: async (username: string, password: string) => {
    try {
      const response = await api.post('/accounts/signin', { username, password });
      return response.data; // { status: true, accessToken, isAdmin }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signUp: async (username: string, password: string, name: string, YOB: number) => {
    try {
      const response = await api.post('/accounts/register', { username, password, name, YOB });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  getMemberDetail: async (userId: string, token: string) => {
    try {
      const response = await api.get(`/accounts/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching member detail for ${userId}:`, error);
      throw error;
    }
  },

  updateMember: async (id: string, data: Partial<Account>, token: string) => {
    try {
      const response = await api.put(`/accounts/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating member ${id}:`, error);
      throw error;
    }
  },

  changePassword: async (id: string, oldPassword: string, newPassword: string, token: string) => {
    try {
      const response = await api.put(`/accounts/${id}/password`, { oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error changing password for ${id}:`, error);
      throw error;
    }
  },

  // Admin functions
  getAllMembersAPI: async (search?: string, page: number = 1) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await api.get('/accounts/api', {
        params: { search, page },
        headers: {
          'Accept': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all members (admin):', error);
      throw error;
    }
  },

  getAdminAccountJsonData: async (id: string) => {
    try {
      const response = await api.get(`/accounts/admin/api/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching admin account data ${id}:`, error);
      throw error;
    }
  },

  updateAccountByAdmin: async (id: string, data: Partial<Account>) => {
    try {
      const response = await api.put(`/accounts/admin/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating account by admin ${id}:`, error);
      throw error;
    }
  },

  deleteAccountByAdmin: async (id: string) => {
    try {
      const response = await api.delete(`/accounts/admin/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting account by admin ${id}:`, error);
      throw error;
    }
  },
};

export default accountApi;
