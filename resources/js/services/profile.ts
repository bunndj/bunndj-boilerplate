import apiClient from './api-client';
import type { UpdateProfileData, UpdateProfileResponse } from '@/types';

export const profileService = {
  async updateProfile(data: UpdateProfileData): Promise<UpdateProfileResponse> {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },
};
