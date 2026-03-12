import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid(),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime().optional(), // optional for flexible
    isFlexibleStay: z.boolean().optional(),
  })
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
  })
});

export const modifyBookingSchema = z.object({
  body: z.object({
    newCheckIn: z.string().datetime().optional(),
    newCheckOut: z.string().datetime().optional(),
    reason: z.string().optional()
  })
});
