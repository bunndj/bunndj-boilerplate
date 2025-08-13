import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Registration schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(255, 'Name must be less than 255 characters'),
    username: z
      .string()
      .min(1, 'Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(255, 'Username must be less than 255 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .max(255, 'Email must be less than 255 characters'),
    organization: z
      .string()
      .min(1, 'DJ Company/Business is required')
      .max(255, 'Organization name must be less than 255 characters'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^[+]?[\d\s\-()]+$/, 'Please enter a valid phone number'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(255, 'Password must be less than 255 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine(
    (data: { password: string; password_confirmation: string }) =>
      data.password === data.password_confirmation,
    {
      message: 'Passwords do not match',
      path: ['password_confirmation'],
    }
  );

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
