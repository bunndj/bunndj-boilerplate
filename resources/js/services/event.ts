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
  async updateEvent(id: number, eventData: Partial<CreateEventData>): Promise<any> {
    const response = await apiClient.put<{
      success: boolean;
      data: Event;
      message: string;
      email_changed?: boolean;
      invitation?: any;
    }>(`/events/${id}`, eventData);
    return response.data;
  },

  /**
   * Delete an event
   */
  async deleteEvent(id: number): Promise<void> {
    await apiClient.delete<{ success: boolean; message: string }>(`/events/${id}`);
  },

  /**
   * Get all events for admin (with DJ and client information)
   */
  async getAdminEvents(params?: any): Promise<{ data: Event[]; pagination: any }> {
    const response = await apiClient.get<{ data: Event[]; pagination: any }>('/admin/events', {
      params,
    });
    return response.data;
  },

  /**
   * Get events for client (only invited events)
   */
  async getClientEvents(): Promise<Event[]> {
    const response = await apiClient.get<{ success: boolean; data: Event[] }>('/client/events');
    return response.data.data;
  },

  /**
   * Get a specific event for client
   */
  async getClientEvent(id: number): Promise<Event> {
    const response = await apiClient.get<{ success: boolean; data: Event }>(`/client/events/${id}`);
    return response.data.data;
  },

  /**
   * Send invitation email for an event
   */
  async sendInvitation(eventId: number): Promise<{ success: boolean; message: string; invitation: any }> {
    const response = await apiClient.post<{ success: boolean; message: string; invitation: any }>(
      `/events/${eventId}/send-invitation`
    );
    return response.data;
  },
};
