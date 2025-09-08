import apiClient from './api-client';
import type { TimelineData, TimelineFormData } from '@/types';

export const timelineService = {
  getTimeline: async (eventId: number): Promise<TimelineData> => {
    const response = await apiClient.get(`/events/${eventId}/timeline`);
    return response.data;
  },

  saveTimeline: async (
    eventId: number,
    data: TimelineFormData,
    notes?: string
  ): Promise<TimelineData> => {
    const response = await apiClient.post(`/events/${eventId}/timeline`, {
      ...data,
      notes,
    });
    return response.data;
  },

  updateTimeline: async (
    eventId: number,
    data: TimelineFormData,
    notes?: string
  ): Promise<TimelineData> => {
    const response = await apiClient.put(`/events/${eventId}/timeline`, {
      ...data,
      notes,
    });
    return response.data;
  },

  // Client-specific methods
  getTimelineForClient: async (eventId: number): Promise<TimelineData> => {
    const response = await apiClient.get(`/client/events/${eventId}/timeline`);
    return response.data;
  },

  updateTimelineForClient: async (
    eventId: number,
    data: TimelineFormData,
    notes?: string
  ): Promise<TimelineData> => {
    const response = await apiClient.put(`/client/events/${eventId}/timeline`, {
      ...data,
      notes,
    });
    return response.data;
  },
};
