import apiClient from './api-client';
import type { User, PaginatedResponse } from '@/types';

export const usersService = {
  // Get all users (admin only)
  getUsers: async (params?: any): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get('/api/users', { params });
    return response.data;
  },

  // Get single user
  getUser: async (id: number): Promise<{ data: User }> => {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<{ data: User }> => {
    const response = await apiClient.put('/api/profile', data);
    return response.data;
  },

  // Update user (admin only)
  updateUser: async (id: number, data: Partial<User>): Promise<{ data: User }> => {
    const response = await apiClient.put(`/api/users/${id}`, data);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },

  // Search DJs by email (for invitations)
  searchDJs: async (query: string): Promise<{ data: User[] }> => {
    const response = await apiClient.get('/api/djs/search', { params: { q: query } });
    return response.data;
  },
};
