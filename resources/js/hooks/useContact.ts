import { useMutation } from '@tanstack/react-query';
import { contactService } from '@/services';
import type { ContactFormData } from '@/types';

export const useSubmitContactForm = () => {
  return useMutation({
    mutationFn: (data: ContactFormData) => contactService.submitContactForm(data),
  });
};
