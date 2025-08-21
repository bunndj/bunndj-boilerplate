import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services';
import type { CreateEventData } from '@/types';
import { QUERY_KEYS } from '@/types';

// Hook for getting all events
export const useEvents = () => {
  return useQuery({
    queryKey: QUERY_KEYS.events.all,
    queryFn: () => eventService.getEvents(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for getting single event
export const useEvent = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.events.detail(id),
    queryFn: () => eventService.getEvent(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
};

// Hook for creating event
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventData) => eventService.createEvent(data),
    onSuccess: () => {
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.all });
    },
  });
};

// Hook for updating event
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateEventData> }) =>
      eventService.updateEvent(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific event and events list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.all });
    },
  });
};

// Hook for deleting event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eventService.deleteEvent(id),
    onSuccess: () => {
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.all });
    },
  });
};
