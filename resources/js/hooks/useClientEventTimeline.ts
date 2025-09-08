import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timelineService } from '@/services';
import type { TimelineFormData } from '@/types';

export const useClientEventTimeline = (eventId: number) => {
  return useQuery({
    queryKey: ['client-event-timeline', eventId],
    queryFn: () => timelineService.getTimelineForClient(eventId),
    enabled: !!eventId,
  });
};

export const useSaveClientEventTimeline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      data,
      notes,
    }: {
      eventId: number;
      data: TimelineFormData;
      notes?: string;
    }) => timelineService.updateTimelineForClient(eventId, data, notes),
    onSuccess: (_response, variables) => {
      // Invalidate and refetch event timeline data
      queryClient.invalidateQueries({ queryKey: ['client-event-timeline', variables.eventId] });
      // Also invalidate the event data since it might affect the event's status
      queryClient.invalidateQueries({ queryKey: ['client-event', variables.eventId] });
    },
  });
};
