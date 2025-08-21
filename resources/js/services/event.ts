import apiClient from './api-client';
import type { Event, CreateEventData } from '@/types';

/**
 * API service for event management
 */
export const eventService = {
  /**
   * Get all events for the authenticated user
   */
  async getEvents(): Promise<Event[]> {
    const response = await apiClient.get<{ success: boolean; data: Event[] }>('/events');
    return response.data.data;
  },

  /**
   * Create a new event
   */
  async createEvent(eventData: CreateEventData): Promise<Event> {
    const response = await apiClient.post<{ success: boolean; data: Event; message: string }>(
      '/events',
      eventData
    );
    return response.data.data;
  },

  /**
   * Get a specific event by ID
   */
  async getEvent(id: number): Promise<Event> {
    const response = await apiClient.get<{ success: boolean; data: Event }>(`/events/${id}`);
    return response.data.data;
  },

  /**
   * Update an existing event
   */
  async updateEvent(id: number, eventData: Partial<CreateEventData>): Promise<Event> {
    const response = await apiClient.put<{ success: boolean; data: Event; message: string }>(
      `/events/${id}`,
      eventData
    );
    return response.data.data;
  },

  /**
   * Delete an event
   */
  async deleteEvent(id: number): Promise<void> {
    await apiClient.delete<{ success: boolean; message: string }>(`/events/${id}`);
  },
};
