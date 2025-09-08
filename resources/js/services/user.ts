import apiClient from './api-client';
import type { User, PaginatedResponse } from '@/types';

export const userService = {
  // Get all users (admin only)
  getUsers: async (params?: any): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  // Get single user
  getUser: async (id: number): Promise<{ data: User }> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<{ data: User }> => {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },

  // Update user (admin only)
  updateUser: async (id: number, data: Partial<User>): Promise<{ data: User }> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  // Search DJs by email (for invitations)
  searchDJs: async (query: string): Promise<{ data: User[] }> => {
    const response = await apiClient.get('/djs/search', { params: { q: query } });
    return response.data;
  },

  // Create user (admin only)
  createUser: async (data: Partial<User>): Promise<{ data: User }> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  // Toggle user status (admin only)
  toggleUserStatus: async (id: number): Promise<{ data: User }> => {
    const response = await apiClient.post(`/users/${id}/toggle-status`);
    return response.data;
  },

  // Bulk user actions (admin only)
  bulkUserAction: async (userIds: number[], action: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/users/bulk-action', {
      user_ids: userIds,
      action: action,
    });
    return response.data;
  },
};
