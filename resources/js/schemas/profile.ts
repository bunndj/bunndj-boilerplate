import { z } from 'zod';

// Profile validation schema
export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  organization: z.string().optional(),
  website: z.string().optional(),
  cell_phone: z.string().optional(),
  home_phone: z.string().optional(),
  work_phone: z.string().optional(),
  fax_phone: z.string().optional(),
  address: z.string().optional(),
  address_line_2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipcode: z
    .string()
    .regex(/^[0-9]{5}$/, 'Zipcode must be exactly 5 digits')
    .optional()
    .or(z.literal('')),
  calendar_link: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Default profile form values
export const defaultProfileFormValues: ProfileFormData = {
  name: '',
  organization: '',
  website: '',
  cell_phone: '',
  home_phone: '',
  work_phone: '',
  fax_phone: '',
  address: '',
  address_line_2: '',
  city: '',
  state: '',
  zipcode: '',
  calendar_link: '',
};
