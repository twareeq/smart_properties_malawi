import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    // Both tenants and admins/owners might have conversations. We just query all their involved conversations.
    // This allows a property owner with role "TENANT" to see their owner conversations too.
    const where = role === 'ADMIN' ? { adminId: userId } : { OR: [{ tenantId: userId }, { adminId: userId }] };

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        property: { select: { title: true, images: { where: { isPrimary: true } } } },
        tenant: { select: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        admin: { select: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return sendSuccess(res, 200, true, 'Conversations fetched', conversations);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch conversations', error.message);
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = (req as any).user.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) return sendError(res, 404, false, 'Conversation not found');
    if (conversation.tenantId !== userId && conversation.adminId !== userId) {
      return sendError(res, 403, false, 'Not authorized');
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    // Mark as read
    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, status: { not: 'READ' } },
      data: { status: 'READ' }
    });

    return sendSuccess(res, 200, true, 'Messages fetched', messages);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch messages', error.message);
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { propertyId, content } = req.body;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return sendError(res, 404, false, 'Property not found');

    if (userId === property.ownerId) {
      return sendError(res, 400, false, 'You cannot message yourself');
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: { propertyId, tenantId: userId, adminId: property.ownerId }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          propertyId,
          tenantId: userId,
          adminId: property.ownerId
        }
      });
    } else {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        content
      }
    });

    return sendSuccess(res, 201, true, 'Message sent', message);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to send message', error.message);
  }
};

export const replyMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) return sendError(res, 404, false, 'Conversation not found');
    
    if (conversation.tenantId !== userId && conversation.adminId !== userId) {
      return sendError(res, 403, false, 'Not authorized');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return sendSuccess(res, 201, true, 'Reply sent', message);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to reply', error.message);
  }
};
