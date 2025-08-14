import apiClient from './api-client';
import type {
  Event,
  CreateEventData,
  UpdateEventData,
  EventPlanning,
  EventMusicIdeas,
  EventDocument,
  PaginatedResponse,
} from '@/types';

export const eventsService = {
  // Get all events for current DJ
  getEvents: async (params?: any): Promise<PaginatedResponse<Event>> => {
    const response = await apiClient.get('/api/events', { params });
    return response.data;
  },

  // Get single event
  getEvent: async (id: number): Promise<{ data: Event }> => {
    const response = await apiClient.get(`/api/events/${id}`);
    return response.data;
  },

  // Create new event
  createEvent: async (data: CreateEventData): Promise<{ data: Event }> => {
    const response = await apiClient.post('/api/events', data);
    return response.data;
  },

  // Update event
  updateEvent: async (id: number, data: Partial<UpdateEventData>): Promise<{ data: Event }> => {
    const response = await apiClient.put(`/api/events/${id}`, data);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/events/${id}`);
    return response.data;
  },

  // Event Planning
  getEventPlanning: async (eventId: number): Promise<{ data: EventPlanning }> => {
    const response = await apiClient.get(`/api/events/${eventId}/planning`);
    return response.data;
  },

  updateEventPlanning: async (
    eventId: number,
    data: Partial<EventPlanning>
  ): Promise<{ data: EventPlanning }> => {
    const response = await apiClient.put(`/api/events/${eventId}/planning`, data);
    return response.data;
  },

  // Event Music Ideas
  getEventMusic: async (eventId: number): Promise<{ data: EventMusicIdeas }> => {
    const response = await apiClient.get(`/api/events/${eventId}/music`);
    return response.data;
  },

  updateEventMusic: async (
    eventId: number,
    data: Partial<EventMusicIdeas>
  ): Promise<{ data: EventMusicIdeas }> => {
    const response = await apiClient.put(`/api/events/${eventId}/music`, data);
    return response.data;
  },

  // Event Documents
  getEventDocuments: async (eventId: number): Promise<{ data: EventDocument[] }> => {
    const response = await apiClient.get(`/api/events/${eventId}/documents`);
    return response.data;
  },

  uploadEventDocument: async (
    eventId: number,
    file: File,
    documentType: 'pdf' | 'email' | 'note'
  ): Promise<{ data: EventDocument }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const response = await apiClient.post(`/api/events/${eventId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteEventDocument: async (
    eventId: number,
    documentId: number
  ): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/events/${eventId}/documents/${documentId}`);
    return response.data;
  },

  // Process document with AI
  processDocument: async (
    eventId: number,
    documentId: number
  ): Promise<{ data: EventDocument }> => {
    const response = await apiClient.post(`/api/events/${eventId}/documents/${documentId}/process`);
    return response.data;
  },
};
