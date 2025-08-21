/**
 * User profile related types and interfaces
 */

import type { ProfileFormData } from '@/schemas';

// Re-export schema type for convenience
export type UpdateProfileData = ProfileFormData;

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user?: any;
}
