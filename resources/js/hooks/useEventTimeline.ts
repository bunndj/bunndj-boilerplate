import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timelineService } from '@/services';
import type { TimelineFormData } from '@/types';

export const useEventTimeline = (eventId: number) => {
  return useQuery({
    queryKey: ['event-timeline', eventId],
    queryFn: () => timelineService.getTimeline(eventId),
    enabled: !!eventId,
  });
};

export const useSaveEventTimeline = () => {
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
    }) => timelineService.saveTimeline(eventId, data, notes),
    onSuccess: (_response, variables) => {
      // Invalidate and refetch event timeline data
      queryClient.invalidateQueries({ queryKey: ['event-timeline', variables.eventId] });
      // Also invalidate the event data since it might affect the event's status
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
  });
};

export const useUpdateEventTimeline = () => {
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
    }) => timelineService.updateTimeline(eventId, data, notes),
    onSuccess: (_response, variables) => {
      // Invalidate and refetch event timeline data
      queryClient.invalidateQueries({ queryKey: ['event-timeline', variables.eventId] });
      // Also invalidate the event data since it might affect the event's status
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
  });
};
