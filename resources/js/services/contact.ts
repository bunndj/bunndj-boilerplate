import apiClient from './api-client';
import type { ContactFormData, ContactResponse } from '@/types';

export const contactService = {
  async submitContactForm(data: ContactFormData): Promise<ContactResponse> {
    const response = await apiClient.post('/contact', data);
    return response.data;
  },
};
