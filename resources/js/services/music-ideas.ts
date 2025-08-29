import apiClient from './api-client';
import type { MusicIdeasData, MusicIdeasFormData } from '@/types';

export const musicIdeasService = {
  getMusicIdeas: async (eventId: number): Promise<MusicIdeasData> => {
    const response = await apiClient.get(`/events/${eventId}/music-ideas`);
    return response.data;
  },

  saveMusicIdeas: async (
    eventId: number,
    data: MusicIdeasFormData,
    notes?: string
  ): Promise<MusicIdeasData> => {
    const response = await apiClient.post(`/events/${eventId}/music-ideas`, {
      music_ideas: data,
      notes,
    });
    return response.data;
  },

  updateMusicIdeas: async (
    eventId: number,
    data: MusicIdeasFormData,
    notes?: string
  ): Promise<MusicIdeasData> => {
    const response = await apiClient.put(`/events/${eventId}/music-ideas`, {
      music_ideas: data,
      notes,
    });
    return response.data;
  },
};
