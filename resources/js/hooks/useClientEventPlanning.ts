import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planningService } from '@/services';
import type { PlanningFormData } from '@/types';

export const useClientEventPlanning = (eventId: number) => {
  return useQuery({
    queryKey: ['client-event-planning', eventId],
    queryFn: () => planningService.getPlanningForClient(eventId),
    enabled: !!eventId,
  });
};

export const useSaveClientEventPlanning = () => {
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
    }) => planningService.updatePlanningForClient(eventId, data, notes),
    onSuccess: (_response, variables) => {
      // Invalidate and refetch event planning data
      queryClient.invalidateQueries({ queryKey: ['client-event-planning', variables.eventId] });
      // Also invalidate the event data since it might affect the event's status
      queryClient.invalidateQueries({ queryKey: ['client-event', variables.eventId] });
    },
  });
};
