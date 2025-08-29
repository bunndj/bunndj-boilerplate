// Timeline Types
export interface TimelineItem {
  id: string;
  name: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  time_offset?: number; // in minutes
  order: number;
}

export interface TimelineFormData {
  timeline_items: TimelineItem[];
}

export interface TimelineData {
  timeline_data: TimelineFormData | null;
  notes: string | null;
  total_items: number;
}

// Default timeline sections from the image
export const DEFAULT_TIMELINE_SECTIONS: Omit<TimelineItem, 'id' | 'order'>[] = [
  {
    name: 'Music On (Ceremony Prelude) (DJ Start Time)',
    start_time: '',
    end_time: '',
    notes: '',
    time_offset: 0,
  },
  {
    name: 'Ceremony',
    start_time: '',
    end_time: '',
    notes: '',
    time_offset: 0,
  },
  {
    name: 'Cocktail Hour',
    start_time: '',
    end_time: '',
    notes: '',
    time_offset: 0,
  },
  {
    name: 'Introductions',
    start_time: '',
    end_time: '',
    notes: '',
    time_offset: 0,
  },
  {
    name: 'Special Dances',
    start_time: '',
    end_time: '',
    notes: '',
    time_offset: 0,
  },
  {
    name: 'Dinner',
    start_time: '',
    end_time: '',
    notes: '',
    time_offset: 0,
  },
  {
    name: 'Party Time',
    start_time: '',
    end_time: '',
    notes: '',
    time_offset: 0,
  },
  {
    name: 'Cake Cutting',
    start_time: '',
    end_time: '',
    notes: '',
    time_offset: 0,
  },
  {
    name: 'Bouquet/Garter Toss',
    start_time: '',
    end_time: '',
    notes: '',
    time_offset: 0,
  },
  {
    name: 'Anniversary Dance',
    start_time: '',
    end_time: '',
    notes: '',
    time_offset: 0,
  },
  {
    name: 'Last Song (Music Off) (DJ End Time)',
    start_time: '',
    end_time: '',
    notes: '',
    time_offset: 0,
  },
];
