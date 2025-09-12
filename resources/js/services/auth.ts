import apiClient from './api-client';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types';

export const authService = {
  // Register new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    if (credentials.invitation_id) {
      // Use invitation-based registration endpoint
      const response = await apiClient.post(
        `/register/invitation/${credentials.invitation_id}`,
        credentials
      );
      return response.data;
    } else {
      // Use regular registration endpoint
      const response = await apiClient.post('/register', credentials);
      return response.data;
    }
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await apiClient.get('/user');
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/refresh');
    return response.data;
  },
};
