import { z } from 'zod';

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    pricePerNight: z.number().positive(),
    type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'COMMERCIAL', 'LAND']),
    address: z.string().min(5),
    city: z.string().min(2),
    region: z.string().min(2),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    googleMapsUrl: z.string().url().optional().or(z.literal('')),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().int().nonnegative(),
    isFurnished: z.boolean().optional(),
    hasWiFi: z.boolean().optional(),
    hasParking: z.boolean().optional(),
    hasPool: z.boolean().optional(),
    hasGarden: z.boolean().optional(),
    hasSecurity: z.boolean().optional(),
    images: z.array(z.string().url()).optional()
  })
});

export const updatePropertySchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(10).optional(),
    pricePerNight: z.number().positive().optional(),
    type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'COMMERCIAL', 'LAND']).optional(),
    status: z.enum(['AVAILABLE', 'MAINTENANCE', 'RENTED', 'HIDDEN']).optional(),
    address: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    region: z.string().min(2).optional(),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    googleMapsUrl: z.string().url().optional().or(z.literal('')),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    isFurnished: z.boolean().optional(),
    hasWiFi: z.boolean().optional(),
    hasParking: z.boolean().optional(),
    hasPool: z.boolean().optional(),
    hasGarden: z.boolean().optional(),
    hasSecurity: z.boolean().optional(),
  })
});

export const propertyQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    city: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'COMMERCIAL', 'LAND']).optional(),
    bedrooms: z.string().optional(),
    hasWiFi: z.enum(['true', 'false']).optional(),
    hasPool: z.enum(['true', 'false']).optional(),
  })
});

export const saveMediaSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid(),
    publicId: z.string(),
    secureUrl: z.string().url(),
    thumbnailUrl: z.string().url().optional().nullable(),
    mediumUrl: z.string().url().optional().nullable(),
    originalUrl: z.string().url().optional().nullable(),
    format: z.string().optional().nullable(),
    width: z.number().int().optional().nullable(),
    height: z.number().int().optional().nullable(),
    bytes: z.number().int().optional().nullable(),
    resourceType: z.string().optional(),
    altText: z.string().optional().nullable(),
  })
});
