import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { Prisma } from '@prisma/client';

export const createProperty = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).user.id;
    const { images, ...propertyData } = req.body;

    const newProperty = await prisma.$transaction(async (tx) => {
      const property = await tx.property.create({
        data: {
          ...propertyData,
          ownerId,
        }
      });

      if (images && images.length > 0) {
        // Create images
        const imageRecords = images.map((url: string, index: number) => ({
          propertyId: property.id,
          url,
          isPrimary: index === 0
        }));
        await tx.propertyImage.createMany({
          data: imageRecords
        });
      }

      return await tx.property.findUnique({
        where: { id: property.id },
        include: { images: true }
      });
    });

    return sendSuccess(res, 201, true, 'Property created successfully', newProperty);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to create property', error.message);
  }
};

export const getMyProperties = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).user.id;

    const properties = await prisma.property.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
        reviews: { select: { rating: true } },
        bookings: { select: { id: true, status: true } },
      },
    });

    const processed = properties.map(p => {
      const avgRating = p.reviews.length > 0
        ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length
        : 0;
      return { ...p, avgRating, reviews: undefined };
    });

    return sendSuccess(res, 200, true, 'My properties fetched', processed);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch properties', error.message);
  }
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      search, 
      city, 
      minPrice, 
      maxPrice, 
      type,
      bedrooms,
      hasWiFi,
      hasPool
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const where: Prisma.PropertyWhereInput = {
      status: 'AVAILABLE' // generally public listing wants available
    };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (city) where.city = { equals: city as string, mode: 'insensitive' };
    if (type) where.type = type as any;
    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      if (minPrice) where.pricePerNight.gte = parseFloat(minPrice as string);
      if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice as string);
    }
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms as string, 10) };
    if (hasWiFi === 'true') where.hasWiFi = true;
    if (hasPool === 'true') where.hasPool = true;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { where: { isPrimary: true } }, // mostly need primary image for list
          owner: { select: { profile: { select: { firstName: true, lastName: true } } } },
          reviews: { select: { rating: true } }
        }
      }),
      prisma.property.count({ where })
    ]);

    // calculate avg rating visually
    const processedProperties = properties.map(p => {
      const avgRating = p.reviews.length > 0 
        ? p.reviews.reduce((acc, curr) => acc + curr.rating, 0) / p.reviews.length 
        : 0;
      return { ...p, avgRating, reviews: undefined };
    });

    return sendSuccess(res, 200, true, 'Properties fetched successfully', processedProperties, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch properties', error.message);
  }
};

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        owner: { select: { id: true, profile: true } },
        reviews: {
          include: { tenant: { select: { id: true, profile: { select: { firstName: true, avatarUrl: true } } } } }
        }
      }
    });

    if (!property) {
      return sendError(res, 404, false, 'Property not found');
    }

    // Access control: If property is not PUBLIC/AVAILABLE, only the owner OR a tenant with a booking can see the full details.
    if (property.status !== 'AVAILABLE') {
      const userId = (req as any).user?.id;
      if (!userId) return sendError(res, 403, false, 'Not authorized to view this property listing');
      
      const isOwner = property.ownerId === userId;
      
      // Check if this user has any active or past booking for this property
      const hasBooking = await prisma.booking.findFirst({
        where: {
          propertyId: id,
          tenantId: userId,
          status: { in: ['CONFIRMED', 'COMPLETED', 'PENDING'] }
        }
      });

      if (!isOwner && !hasBooking) {
        return sendError(res, 403, false, 'Not authorized to view this property listing');
      }
    }

    // Optional: Log view
    try {
      await prisma.propertyView.create({
        data: {
          propertyId: id,
          userId: (req as any).user?.id || null 
        }
      });
    } catch(e) { console.error('Failed to log view', e); }

    const avgRating = property.reviews.length > 0 
      ? property.reviews.reduce((acc, curr) => acc + curr.rating, 0) / property.reviews.length 
      : 0;

    return sendSuccess(res, 200, true, 'Property details fetched', { ...property, avgRating });
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch property details', error.message);
  }
};

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = (req as any).user.id;

    // check ownership
    const prop = await prisma.property.findUnique({ where: { id } });
    if (!prop) return sendError(res, 404, false, 'Property not found');
    if (prop.ownerId !== ownerId) {
      return sendError(res, 403, false, 'Not authorized to update this property');
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: req.body,
    });

    return sendSuccess(res, 200, true, 'Property updated', updatedProperty);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to update property', error.message);
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = (req as any).user.id;
    
    // check ownership
    const prop = await prisma.property.findUnique({ where: { id } });
    if (!prop) return sendError(res, 404, false, 'Property not found');
    if (prop.ownerId !== ownerId) {
      return sendError(res, 403, false, 'Not authorized to delete this property');
    }

    // hard delete
    await prisma.property.delete({
      where: { id }
    });

    return sendSuccess(res, 200, true, 'Property deleted successfully');
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to delete property', error.message);
  }
};
