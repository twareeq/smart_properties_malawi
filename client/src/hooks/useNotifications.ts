'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/lib/services/notification.service';
import { useAuthStore } from '@/store/authStore';

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getMyNotifications().then((r) => r.data.data),
    enabled: isAuthenticated,
    refetchInterval: 10000, // Poll every 10 seconds for new notifications
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
