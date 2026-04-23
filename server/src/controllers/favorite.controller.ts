import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.id;
    const { propertyId } = req.params;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return sendError(res, 404, false, 'Property not found');
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        tenantId_propertyId: {
          tenantId,
          propertyId
        }
      }
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });
      return sendSuccess(res, 200, true, 'Property removed from favorites', { favorited: false });
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          tenantId,
          propertyId
        }
      });
      return sendSuccess(res, 201, true, 'Property added to favorites', { favorited: true });
    }
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to toggle favorite', error.message);
  }
};

export const getMyFavorites = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.id;

    const favorites = await prisma.favorite.findMany({
      where: { tenantId },
      include: {
        property: {
          include: {
            images: { take: 1 },
            reviews: { select: { rating: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const processedProperties = favorites.map(f => {
      const p = f.property;
      const avgRating = p.reviews.length > 0 
        ? p.reviews.reduce((acc, curr) => acc + curr.rating, 0) / p.reviews.length 
        : 0;
      return { ...p, avgRating, reviews: undefined, isFavorited: true };
    });

    return sendSuccess(res, 200, true, 'Favorites fetched successfully', processedProperties);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch favorites', error.message);
  }
};
