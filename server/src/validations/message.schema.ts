import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid(),
    content: z.string().min(1, 'Message cannot be empty')
  })
});

export const replyMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message cannot be empty')
  })
});
