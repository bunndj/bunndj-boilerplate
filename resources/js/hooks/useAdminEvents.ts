import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services';

export const useAdminEvents = (params?: any) => {
  return useQuery({
    queryKey: ['adminEvents', params],
    queryFn: () => eventService.getAdminEvents(params),
  });
};

export const useAdminEvent = (id: number) => {
  return useQuery({
    queryKey: ['adminEvent', id],
    queryFn: () => eventService.getEvent(id),
    enabled: !!id,
  });
};

export const useUpdateAdminEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => eventService.updateEvent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      queryClient.invalidateQueries({ queryKey: ['adminEvent', id] });
    },
  });
};

export const useDeleteAdminEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eventService.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
    },
  });
};
