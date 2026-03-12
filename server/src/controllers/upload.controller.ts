import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { generateCloudinarySignature, deleteFromCloudinary } from '../config/cloudinary';

/**
 * GET /api/v1/uploads/signature
 * Returns signed upload parameters for direct Cloudinary upload
 */
export const getCloudinarySignature = async (req: Request, res: Response) => {
  try {
    const signatureData = generateCloudinarySignature();
    return sendSuccess(res, 200, true, 'Signature generated', signatureData);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to generate signature', error.message);
  }
};

/**
 * POST /api/v1/uploads/property-image
 * Saves uploaded Cloudinary asset metadata into the database
 */
export const saveMediaMetadata = async (req: Request, res: Response) => {
  try {
    const { propertyId, publicId, secureUrl, thumbnailUrl, mediumUrl, originalUrl, format, width, height, bytes, resourceType, altText } = req.body;
    const userId = (req as any).user.id;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return sendError(res, 404, false, 'Property not found');
    if (property.ownerId !== userId) return sendError(res, 403, false, 'Unauthorized');

    // Check limit
    const imageCount = await prisma.propertyImage.count({ where: { propertyId } });
    if (imageCount >= 8) {
      return sendError(res, 400, false, 'Maximum of 8 images allowed per property');
    }

    const isPrimary = imageCount === 0;

    const image = await prisma.propertyImage.create({
      data: {
        propertyId,
        publicId,
        secureUrl,
        thumbnailUrl,
        mediumUrl,
        originalUrl,
        format,
        width,
        height,
        bytes,
        resourceType: resourceType || 'image',
        altText,
        isPrimary,
        uploadedBy: userId,
        sortOrder: imageCount,
      },
    });

    return sendSuccess(res, 201, true, 'Media metadata saved', image);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to save media metadata', error.message);
  }
};

/**
 * DELETE /api/v1/uploads/property-image/:imageId
 * Removes an image from DB and Cloudinary
 */
export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const { imageId } = req.params;
    const userId = (req as any).user.id;

    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
      include: { property: { select: { ownerId: true } } },
    });

    if (!image) return sendError(res, 404, false, 'Image not found');
    if (image.property.ownerId !== userId) return sendError(res, 403, false, 'Unauthorized');

    // 1. Delete from Cloudinary
    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    // 2. Delete from DB
    await prisma.propertyImage.delete({ where: { id: imageId } });

    // Optional: If primary was deleted and others exist, make the next one primary
    if (image.isPrimary) {
      const nextImage = await prisma.propertyImage.findFirst({
        where: { propertyId: image.propertyId },
        orderBy: { sortOrder: 'asc' }
      });
      if (nextImage) {
        await prisma.propertyImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true }
        });
      }
    }

    return sendSuccess(res, 200, true, 'Image deleted successfully');
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to delete image', error.message);
  }
};
