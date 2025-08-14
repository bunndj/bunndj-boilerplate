// Event related types
export interface Event {
  id: number;
  name?: string;
  event_type: 'Wedding' | 'Corporate' | 'Birthday' | 'Other';
  event_date: string;
  setup_time?: string;
  start_time?: string;
  end_time?: string;
  booking_status: 'Planning' | 'Booked' | 'Confirmed' | 'Completed';
  service_package?: string;
  service_description?: string;
  guest_count?: number;
  dj_id: number;

  // Venue Information
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_state?: string;
  venue_zipcode?: string;
  venue_phone?: string;
  venue_email?: string;

  created_at: string;
  updated_at: string;

  // Relations
  dj?: import('./auth').User;
  planning?: EventPlanning;
  musicIdeas?: EventMusicIdeas;
  documents?: EventDocument[];
}

export interface EventPlanning {
  id: number;
  event_id: number;
  planning_data: PlanningField[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PlanningField {
  field_name: string;
  field_value: string;
}

export interface EventMusicIdeas {
  id: number;
  event_id: number;
  music_ideas: {
    must_play: MusicItem[];
    play_if_possible: MusicItem[];
  };
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MusicItem {
  music_type: 'individual_song' | 'spotify';
  artist?: string;
  song?: string;
  playlist?: string;
}

export interface EventDocument {
  id: number;
  event_id: number;
  document_type: 'pdf' | 'email' | 'note';
  file_path: string;
  original_filename: string;
  file_size?: string;
  mime_type?: string;
  parsed_data?: any;
  is_processed: boolean;
  uploaded_by: number;
  created_at: string;
}

// Form types
export interface CreateEventData {
  name: string;
  event_type: 'Wedding' | 'Corporate' | 'Birthday' | 'Other';
  event_date: string;
  setup_time?: string;
  start_time?: string;
  end_time?: string;
  booking_status?: 'Planning' | 'Booked' | 'Confirmed' | 'Completed';
  service_package?: string;
  service_description?: string;
  guest_count?: number;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_state?: string;
  venue_zipcode?: string;
  venue_phone?: string;
  venue_email?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: number;
}
