// Common types used across the application
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

// Form validation types
export interface ValidationErrors {
  [key: string]: string[];
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Query keys for React Query
export const QUERY_KEYS = {
  auth: {
    user: ['auth', 'user'] as const,
  },
  events: {
    all: ['events'] as const,
    list: (params?: any) => ['events', 'list', params] as const,
    detail: (id: number) => ['events', 'detail', id] as const,
    planning: (eventId: number) => ['events', 'planning', eventId] as const,
    music: (eventId: number) => ['events', 'music', eventId] as const,
    documents: (eventId: number) => ['events', 'documents', eventId] as const,
  },
  users: {
    all: ['users'] as const,
    list: (params?: any) => ['users', 'list', params] as const,
    detail: (id: number) => ['users', 'detail', id] as const,
  },
} as const;
