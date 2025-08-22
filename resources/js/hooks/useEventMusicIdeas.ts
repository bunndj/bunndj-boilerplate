import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { musicIdeasService } from '@/services';
import type { MusicIdeasFormData } from '@/types';

export const useEventMusicIdeas = (eventId: number) => {
  return useQuery({
    queryKey: ['event-music-ideas', eventId],
    queryFn: () => musicIdeasService.getMusicIdeas(eventId),
    enabled: !!eventId,
  });
};

export const useSaveEventMusicIdeas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      data,
      notes,
    }: {
      eventId: number;
      data: MusicIdeasFormData;
      notes?: string;
    }) => musicIdeasService.saveMusicIdeas(eventId, data, notes),
    onSuccess: (_response, variables) => {
      // Invalidate and refetch event music ideas data
      queryClient.invalidateQueries({ queryKey: ['event-music-ideas', variables.eventId] });
      // Also invalidate the event data since it might affect the event's status
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
  });
};

export const useUpdateEventMusicIdeas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      data,
      notes,
    }: {
      eventId: number;
      data: MusicIdeasFormData;
      notes?: string;
    }) => musicIdeasService.updateMusicIdeas(eventId, data, notes),
    onSuccess: (_response, variables) => {
      // Invalidate and refetch event music ideas data
      queryClient.invalidateQueries({ queryKey: ['event-music-ideas', variables.eventId] });
      // Also invalidate the event data since it might affect the event's status
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
  });
};
