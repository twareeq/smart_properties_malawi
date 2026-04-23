'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '@/lib/services/favorite.service';

export function useMyFavorites(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['my-favorites'],
    queryFn: () => favoriteService.getMyFavorites().then((r) => r.data.data),
    ...options,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => favoriteService.toggleFavorite(propertyId),
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['my-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
    },
  });
}
