import apiClient from './api-client';
import type { PlanningFormData, PlanningData } from '@/types';

export const planningService = {
  // Get planning data for an event
  getPlanning: async (eventId: number): Promise<PlanningData> => {
    const response = await apiClient.get(`/events/${eventId}/planning`);
    return response.data;
  },

  // Save or update planning data for an event
  savePlanning: async (
    eventId: number,
    data: PlanningFormData,
    notes?: string
  ): Promise<{ data: PlanningData }> => {
    const response = await apiClient.post(`/events/${eventId}/planning`, {
      planning_data: data,
      notes: notes || null,
    });
    return response.data;
  },

  // Update planning data for an event
  updatePlanning: async (
    eventId: number,
    data: PlanningFormData,
    notes?: string
  ): Promise<{ data: PlanningData }> => {
    const response = await apiClient.put(`/events/${eventId}/planning`, {
      planning_data: data,
      notes: notes || null,
    });
    return response.data;
  },

  // Client-specific methods
  getPlanningForClient: async (eventId: number): Promise<PlanningData> => {
    const response = await apiClient.get(`/client/events/${eventId}/planning`);
    return response.data;
  },

  updatePlanningForClient: async (
    eventId: number,
    data: PlanningFormData,
    notes?: string
  ): Promise<{ data: PlanningData }> => {
    const response = await apiClient.put(`/client/events/${eventId}/planning`, {
      planning_data: data,
      notes: notes || null,
    });
    return response.data;
  },
};
