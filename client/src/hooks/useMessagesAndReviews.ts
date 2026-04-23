'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { messageService } from '@/lib/services/message.service';
import { reviewService } from '@/lib/services/review.service';
import { analyticsService } from '@/lib/services/analytics.service';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations().then((r) => r.data.data),
    refetchInterval: 5000, // Sync conversations every 5s
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messageService.getMessages(conversationId).then((r) => r.data.data),
    enabled: !!conversationId,
    refetchInterval: 3000, // Fast polling for active messages
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: ({ propertyId, content }: { propertyId: string; content: string }) =>
      messageService.sendMessage(propertyId, content),
  });
}

export function useReplyMessage() {
  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      messageService.replyMessage(conversationId, content),
  });
}

export function usePropertyReviews(propertyId: string) {
  return useQuery({
    queryKey: ['reviews', propertyId],
    queryFn: () => reviewService.getPropertyReviews(propertyId).then((r) => r.data.data),
    enabled: !!propertyId,
  });
}

export function useSubmitReview() {
  return useMutation({
    mutationFn: (data: any) => reviewService.submitReview(data),
  });
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => analyticsService.getAdminMetrics().then((r) => r.data.data),
  });
}
