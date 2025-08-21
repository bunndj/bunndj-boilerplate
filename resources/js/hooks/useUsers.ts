import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services';
import { authStorage } from '@/utils/storage';
import { QUERY_KEYS } from '@/types';
import type { User } from '@/types';

// Hook for getting all users (admin only)
export const useUsers = (params?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.users.list(params),
    queryFn: () => userService.getUsers(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for getting single user
export const useUser = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.users.detail(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for updating user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: data => {
      // Update user in auth cache
      queryClient.setQueryData(QUERY_KEYS.auth.user, data.data);

      // Update stored user data
      authStorage.setUser(data.data);
    },
  });
};

// Hook for updating user (admin only)
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific user and users list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
  });
};

// Hook for deleting user (admin only)
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
  });
};

// Hook for searching DJs
export const useSearchDJs = (query: string) => {
  return useQuery({
    queryKey: ['djs', 'search', query],
    queryFn: () => userService.searchDJs(query),
    enabled: query.length > 2, // Only search if query has more than 2 characters
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
