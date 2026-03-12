'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { bookingService } from '@/lib/services/booking.service';
import { paymentService } from '@/lib/services/payment.service';

export function useMyBookings() {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingService.getMyBookings().then((r) => r.data.data),
  });
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: (data: { propertyId: string; checkIn: string; checkOut?: string; isFlexibleStay?: boolean }) =>
      bookingService.createBooking(data),
  });
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (bookingId: string) => paymentService.initiatePayment(bookingId),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => paymentService.getInvoices().then((r) => r.data.data),
  });
}

export function useReceipts() {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: () => paymentService.getReceipts().then((r) => r.data.data),
  });
}
