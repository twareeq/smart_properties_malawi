import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 for performance
    });

    return sendSuccess(res, 200, true, 'Notifications fetched successfully', notifications);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch notifications', error.message);
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return sendError(res, 404, false, 'Notification not found');
    }

    if (notification.userId !== userId) {
      return sendError(res, 403, false, 'Not authorized');
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return sendSuccess(res, 200, true, 'Notification marked as read', updated);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to update notification', error.message);
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return sendSuccess(res, 200, true, 'All notifications marked as read');
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to update notifications', error.message);
  }
};
