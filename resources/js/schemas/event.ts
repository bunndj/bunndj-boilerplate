import { z } from 'zod';

// Helper function to validate time format
const timeFormat = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format');

// Helper function to validate date is today or later
const dateInFuture = z.string().refine(date => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate >= today;
}, 'Event date must be today or in the future');

// Add-on item schema
const addOnItemSchema = z.object({
  name: z.string().min(1, 'Add-on name is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  total_price: z.number().min(0, 'Total price must be 0 or greater'),
});

// Create event schema matching backend validation
export const createEventSchema = z
  .object({
    // Event information
    name: z.string().min(1, 'Event name is required').max(255, 'Event name is too long'),
    event_date: dateInFuture,
    setup_time: timeFormat,
    start_time: timeFormat,
    end_time: timeFormat,
    service_package: z
      .string()
      .min(1, 'Service package is required')
      .max(255, 'Service package name is too long'),
    service_description: z.string().optional(),
    guest_count: z.number().min(1, 'Guest count must be at least 1'),

    // Venue fields
    venue_name: z.string().max(255, 'Venue name is too long').optional(),
    venue_address: z.string().max(255, 'Venue address is too long').optional(),
    venue_city: z.string().max(100, 'Venue city is too long').optional(),
    venue_state: z.string().max(2, 'Venue state must be 2 characters').optional(),
    venue_zipcode: z.string().max(10, 'Venue zipcode is too long').optional(),
    venue_phone: z.string().max(20, 'Phone number is too long').optional().or(z.literal('')),
    venue_email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email is too long')
      .optional()
      .or(z.literal('')),

    // Client information fields
    client_firstname: z
      .string()
      .min(1, 'First name is required')
      .max(255, 'First name is too long'),
    client_lastname: z.string().min(1, 'Last name is required').max(255, 'Last name is too long'),
    client_organization: z.string().max(255, 'Organization name is too long').optional(),
    client_cell_phone: z
      .string()
      .min(1, 'Cell phone is required')
      .max(20, 'Phone number is too long'),
    client_home_phone: z.string().max(20, 'Phone number is too long').optional().or(z.literal('')),
    client_email: z
      .string()
      .min(1, 'Email address is required')
      .email('Invalid email address')
      .max(255, 'Email is too long'),
    client_address: z.string().min(1, 'Address is required').max(255, 'Address is too long'),
    client_address_line2: z.string().max(255, 'Address line 2 is too long').optional(),
    client_city: z.string().min(1, 'City is required').max(100, 'City is too long'),
    client_state: z.string().min(1, 'State is required').max(2, 'State must be 2 characters'),
    client_zipcode: z.string().min(1, 'Zipcode is required').max(10, 'Zipcode is too long'),

    // Custom client fields
    partner_name: z.string().max(255, 'Partner name is too long').optional(),
    partner_email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email is too long')
      .optional()
      .or(z.literal('')),
    mob_fog: z.string().max(255, 'MOB/FOG name is too long').optional(),
    mob_fog_email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email is too long')
      .optional()
      .or(z.literal('')),
    other_contact: z.string().max(255, 'Contact name is too long').optional(),
    poc_email_phone: z.string().max(255, 'Contact info is too long').optional(),
    vibo_link: z
      .string()
      .url('Invalid URL')
      .max(255, 'URL is too long')
      .optional()
      .or(z.literal('')),

    // Financial fields
    package: z.number().min(0, 'Package price must be 0 or greater'),
    add_ons: z.array(addOnItemSchema).optional(),
    deposit_value: z.number().min(0, 'Deposit must be 0 or greater'),
  })
  .refine(
    data => {
      // Validate that end_time is after or equal to start_time
      const startTime = data.start_time;
      const endTime = data.end_time;
      return endTime >= startTime;
    },
    {
      message: 'End time must be after or equal to start time',
      path: ['end_time'],
    }
  );

// Export the form data type
export type CreateEventFormData = z.infer<typeof createEventSchema>;
