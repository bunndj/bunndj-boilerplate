import type { CreateEventFormData, AddOnItem } from '@/schemas';

// Re-export schema types for convenience
export type CreateEventData = CreateEventFormData;
export type { AddOnItem };

// Tab type for create event modal
export type CreateEventTab = 'client' | 'details' | 'financials' | 'venue';

// Field to tab mapping for create event modal
export const FIELD_TO_TAB_MAP: Record<string, CreateEventTab> = {
  // Client tab fields
  client_firstname: 'client',
  client_lastname: 'client',
  client_cell_phone: 'client',
  client_email: 'client',
  client_organization: 'client',
  client_home_phone: 'client',
  client_address: 'client',
  client_address_line2: 'client',
  client_city: 'client',
  client_state: 'client',
  client_zipcode: 'client',
  partner_name: 'client',
  partner_email: 'client',
  mob_fog: 'client',
  mob_fog_email: 'client',
  other_contact: 'client',
  poc_email_phone: 'client',
  vibo_link: 'client',

  // Details tab fields
  name: 'details',
  event_date: 'details',
  setup_time: 'details',
  start_time: 'details',
  end_time: 'details',
  service_package: 'details',
  service_description: 'details',
  guest_count: 'details',

  // Financials tab fields
  package: 'financials',
  add_ons: 'financials',
  deposit_value: 'financials',

  // Venue tab fields
  venue_name: 'venue',
  venue_address: 'venue',
  venue_city: 'venue',
  venue_state: 'venue',
  venue_zipcode: 'venue',
  venue_phone: 'venue',
  venue_email: 'venue',
};

// Event data structure from backend
export interface Event {
  id: number;
  name: string;
  event_date: string;
  setup_time: string;
  start_time: string;
  end_time: string;
  service_package: string;
  service_description?: string;
  guest_count: number;
  dj_id: number;

  // Venue fields
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_state: string;
  venue_zipcode: string;
  venue_phone?: string;
  venue_email?: string;

  // Client information fields
  client_firstname?: string;
  client_lastname?: string;
  client_organization?: string;
  client_cell_phone?: string;
  client_home_phone?: string;
  client_email?: string;
  client_address?: string;
  client_address_line2?: string;
  client_city?: string;
  client_state?: string;
  client_zipcode?: string;

  // Custom client fields
  partner_name?: string;
  partner_email?: string;
  mob_fog?: string;
  mob_fog_email?: string;
  other_contact?: string;
  poc_email_phone?: string;
  vibo_link?: string;

  // Financial fields
  package?: string;
  add_ons?: AddOnItem[];
  deposit_value?: number;

  created_at: string;
  updated_at: string;
}

// US states for venue state dropdown
export const usStates = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
] as const;
