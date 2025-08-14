import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '@/services';
import { QUERY_KEYS } from '@/types/common';
import type { UpdateEventData, EventPlanning, EventMusicIdeas } from '@/types/events';

// Hook for getting all events
export const useEvents = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.events.list(params),
    queryFn: () => eventsService.getEvents(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for getting single event
export const useEvent = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.events.detail(id),
    queryFn: () => eventsService.getEvent(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id,
  });
};

// Hook for creating event
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsService.createEvent,
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
    mutationFn: ({ id, data }: { id: number; data: Partial<UpdateEventData> }) =>
      eventsService.updateEvent(id, data),
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
    mutationFn: eventsService.deleteEvent,
    onSuccess: () => {
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.all });
    },
  });
};

// Hook for event planning
export const useEventPlanning = (eventId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.events.planning(eventId),
    queryFn: () => eventsService.getEventPlanning(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for updating event planning
export const useUpdateEventPlanning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: number; data: Partial<EventPlanning> }) =>
      eventsService.updateEventPlanning(eventId, data),
    onSuccess: (_, { eventId }) => {
      // Invalidate event planning
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.planning(eventId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.detail(eventId) });
    },
  });
};

// Hook for event music
export const useEventMusic = (eventId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.events.music(eventId),
    queryFn: () => eventsService.getEventMusic(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for updating event music
export const useUpdateEventMusic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: number; data: Partial<EventMusicIdeas> }) =>
      eventsService.updateEventMusic(eventId, data),
    onSuccess: (_, { eventId }) => {
      // Invalidate event music
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.music(eventId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.detail(eventId) });
    },
  });
};

// Hook for event documents
export const useEventDocuments = (eventId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.events.documents(eventId),
    queryFn: () => eventsService.getEventDocuments(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

// Hook for uploading document
export const useUploadEventDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      file,
      documentType,
    }: {
      eventId: number;
      file: File;
      documentType: 'pdf' | 'email' | 'note';
    }) => eventsService.uploadEventDocument(eventId, file, documentType),
    onSuccess: (_, { eventId }) => {
      // Invalidate event documents
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.documents(eventId) });
    },
  });
};

// Hook for deleting document
export const useDeleteEventDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, documentId }: { eventId: number; documentId: number }) =>
      eventsService.deleteEventDocument(eventId, documentId),
    onSuccess: (_, { eventId }) => {
      // Invalidate event documents
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.documents(eventId) });
    },
  });
};

// Hook for processing document with AI
export const useProcessDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, documentId }: { eventId: number; documentId: number }) =>
      eventsService.processDocument(eventId, documentId),
    onSuccess: (_, { eventId }) => {
      // Invalidate event documents and planning
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.documents(eventId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events.planning(eventId) });
    },
  });
};
