import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, updateUserStatus } from '@/api';
import type { PaginationParams, UsersApiResponse, User } from '@/types';

// Query keys
export const userQueryKeys = {
  all: ['users'] as const,
  list: (params: PaginationParams) => ['users', 'list', params] as const,
};

/**
 * Hook to fetch users with pagination and filters
 */
export const useUsers = (params: PaginationParams) => {
  return useQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: () => fetchUsers(params),
  });
};

/**
 * Hook to update user status with optimistic UI updates
 *
 * Immediately updates the UI when toggled, rolls back on error, and merges
 * server response to avoid refetch flicker.
 *
 * Optionally provide the current list params so the hook can
 * optimistically update the visible page's cached data immediately.
 */
export const useUpdateUserStatus = (currentParams?: PaginationParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'inactive' }) =>
      updateUserStatus(userId, status),
    // Optimistically update the cache before the API responds
    onMutate: async ({ userId, status }) => {
      // If we know the current list params, target that query's cache
      if (currentParams) {
        // Get the current cached data as a backup (don't cancel queries to avoid loading state)
        const prevData = queryClient.getQueryData<UsersApiResponse>(
          userQueryKeys.list(currentParams)
        );

        // Apply optimistic update to the cached users list
        queryClient.setQueryData<UsersApiResponse>(userQueryKeys.list(currentParams), (old) => {
          if (!old?.data?.users) return old as UsersApiResponse | undefined;
          return {
            data: {
              ...old.data,
              users: old.data.users.map((u) =>
                u.userId === userId ? { ...u, status } : u
              ),
            },
          };
        });

        // Return context for rollback in onError
        return { previousData: prevData, params: currentParams };
      }

      return {};
    },
    // Rollback on error: restore the previous cached state
    onError: (_err, _vars, context) => {
      if (context && (context as any).previousData && (context as any).params) {
        const { previousData, params } = context as {
          previousData: UsersApiResponse | undefined;
          params: PaginationParams;
        };
        if (previousData) {
          queryClient.setQueryData(userQueryKeys.list(params), previousData);
        }
      }
    },
    // On success, merge server-confirmed data into cache (no invalidation to avoid spinner)
    onSuccess: (result) => {
      const updatedUser = result?.data as User | undefined;
      
      if (currentParams && updatedUser) {
        // Merge the server-confirmed user into the current list cache
        // This keeps the cache consistent without triggering a refetch
        queryClient.setQueryData<UsersApiResponse>(userQueryKeys.list(currentParams), (old) => {
          if (!old?.data?.users) return old as UsersApiResponse | undefined;
          return {
            data: {
              ...old.data,
              users: old.data.users.map((u) =>
                u.userId === updatedUser.userId ? { ...u, ...updatedUser } : u
              ),
            },
          };
        });
      }
      // Never invalidate - keep the optimistic update without spinner
    },
  });
};

/**
 * Hook to manually invalidate users cache
 */
export const useInvalidateUsersCache = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all }),
  };
};
