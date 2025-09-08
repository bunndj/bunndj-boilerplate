import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services';

export const useAdminUsers = (params?: any) => {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: () => userService.getUsers(params),
  });
};

export const useAdminUser = (id: number) => {
  return useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: any) => userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUser', id] });
    },
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => userService.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};

export const useBulkUserAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userIds, action }: { userIds: number[]; action: string }) => 
      userService.bulkUserAction(userIds, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });
};
