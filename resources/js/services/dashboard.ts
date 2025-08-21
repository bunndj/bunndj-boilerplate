import apiClient from './api-client';
import type { DashboardStats } from '@/types';

/**
 * API service for dashboard statistics
 */
export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>(
      '/dashboard/stats'
    );
    return response.data.data;
  },
};
