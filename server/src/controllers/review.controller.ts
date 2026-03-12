import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const submitReview = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.id;
    const { propertyId, rating, cleanliness, comfort, location, value, comment } = req.body;

    // Check if user actually stayed there
    const hasCompletedBooking = await prisma.booking.findFirst({
      where: {
        tenantId,
        propertyId,
        status: 'COMPLETED'
      }
    });

    if (!hasCompletedBooking) {
      return sendError(res, 403, false, 'You must complete a stay before reviewing this property');
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: { tenantId, propertyId }
    });

    if (existingReview) {
      return sendError(res, 400, false, 'You have already reviewed this property');
    }

    const review = await prisma.review.create({
      data: {
        tenantId,
        propertyId,
        rating,
        cleanliness,
        comfort,
        location,
        value,
        comment
      }
    });

    return sendSuccess(res, 201, true, 'Review submitted successfully', review);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to submit review', error.message);
  }
};

export const getPropertyReviews = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { propertyId },
      include: {
        tenant: {
          select: {
            profile: { select: { firstName: true, avatarUrl: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, 200, true, 'Reviews fetched', reviews);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch reviews', error.message);
  }
};
