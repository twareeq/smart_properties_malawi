'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/lib/services/analytics.service';

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: () => analyticsService.getPublicStats().then((r) => r.data.data),
  });
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => analyticsService.getAdminMetrics().then((r) => r.data.data),
  });
}
