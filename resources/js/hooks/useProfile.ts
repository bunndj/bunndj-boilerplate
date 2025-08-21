import { useMutation } from '@tanstack/react-query';
import { profileService } from '@/services';
import type { UpdateProfileData } from '@/types';

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: (data: UpdateProfileData) => profileService.updateProfile(data),
  });
};
