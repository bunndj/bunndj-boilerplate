import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planningService } from '@/services';
import type { PlanningFormData } from '@/types';

export const useEventPlanning = (eventId: number) => {
  return useQuery({
    queryKey: ['event-planning', eventId],
    queryFn: () => planningService.getPlanning(eventId),
    enabled: !!eventId,
  });
};

export const useSaveEventPlanning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      data,
      notes,
    }: {
      eventId: number;
      data: PlanningFormData;
      notes?: string;
    }) => planningService.savePlanning(eventId, data, notes),
    onSuccess: (_response, variables) => {
      // Invalidate and refetch event planning data
      queryClient.invalidateQueries({ queryKey: ['event-planning', variables.eventId] });
      // Also invalidate the event data since it might affect the event's status
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
  });
};

export const useUpdateEventPlanning = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      data,
      notes,
    }: {
      eventId: number;
      data: PlanningFormData;
      notes?: string;
    }) => planningService.updatePlanning(eventId, data, notes),
    onSuccess: (_response, variables) => {
      // Invalidate and refetch event planning data
      queryClient.invalidateQueries({ queryKey: ['event-planning', variables.eventId] });
      // Also invalidate the event data since it might affect the event's status
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
  });
};
