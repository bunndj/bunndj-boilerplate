/**
 * Dashboard related types and interfaces
 */

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  profileCompletion: number;
  totalClients?: number;
  totalUsers?: number;
  totalDjs?: number;
  planningCompletion?: number;
}
