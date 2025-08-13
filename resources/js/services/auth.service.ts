import apiClient from './api-client';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth';

export const authService = {
  // Register new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/register', credentials);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await apiClient.get('/api/user');
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/refresh');
    return response.data;
  },
};
