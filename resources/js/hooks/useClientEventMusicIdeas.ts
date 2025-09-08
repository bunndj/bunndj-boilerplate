import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { musicIdeasService } from '@/services';
import type { MusicIdeasFormData } from '@/types';

export const useClientEventMusicIdeas = (eventId: number) => {
  return useQuery({
    queryKey: ['client-event-music-ideas', eventId],
    queryFn: () => musicIdeasService.getMusicIdeasForClient(eventId),
    enabled: !!eventId,
  });
};

export const useSaveClientEventMusicIdeas = () => {
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
    }) => musicIdeasService.updateMusicIdeasForClient(eventId, data, notes),
    onSuccess: (_response, variables) => {
      // Invalidate and refetch event music ideas data
      queryClient.invalidateQueries({ queryKey: ['client-event-music-ideas', variables.eventId] });
      // Also invalidate the event data since it might affect the event's status
      queryClient.invalidateQueries({ queryKey: ['client-event', variables.eventId] });
    },
  });
};
