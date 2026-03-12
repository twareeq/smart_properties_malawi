import { z } from 'zod';

export const submitReviewSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    cleanliness: z.number().int().min(1).max(5).optional().default(5),
    comfort: z.number().int().min(1).max(5).optional().default(5),
    location: z.number().int().min(1).max(5).optional().default(5),
    value: z.number().int().min(1).max(5).optional().default(5),
    comment: z.string().optional()
  })
});
