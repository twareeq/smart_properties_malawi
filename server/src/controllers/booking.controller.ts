import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const createBooking = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.id;
    const { propertyId, checkIn, checkOut, isFlexibleStay } = req.body;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return sendError(res, 404, false, 'Property not found');
    if (property.status !== 'AVAILABLE') return sendError(res, 400, false, 'Property is not available');

    // Calculate nights for fixed stay; flex stay will calculate over time or have an initial standard
    let nights = 1;
    let totalCost = 0;

    if (!isFlexibleStay && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (nights <= 0) return sendError(res, 400, false, 'Invalid dates');
      
      totalCost = nights * Number(property.pricePerNight);
    } else {
      // Logic for flexible stay initial deposit or standard night charge
      // For MVP we charge at least 1 night for flex
      totalCost = Number(property.pricePerNight);
    }

    const booking = await prisma.booking.create({
      data: {
        tenantId,
        propertyId,
        checkIn: new Date(checkIn),
        checkOut: checkOut ? new Date(checkOut) : null,
        nights,
        isFlexibleStay: Boolean(isFlexibleStay),
        totalCost,
        status: 'PENDING'
      }
    });

    // Notify Admin (we'll implement notifications later, placeholder here)

    return sendSuccess(res, 201, true, 'Booking created pending payment', booking);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to create booking', error.message);
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.id;
    
    const bookings = await prisma.booking.findMany({
      where: { tenantId },
      include: {
        property: {
          select: {
            title: true,
            city: true,
            pricePerNight: true,
            images: { where: { isPrimary: true } }
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, 200, true, 'Bookings fetched', bookings);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch bookings', error.message);
  }
};

export const getPropertyBookings = async (req: Request, res: Response) => {
  try {
    const ownerId = (req as any).user.id;
    const { propertyId } = req.params;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.ownerId !== ownerId) {
      return sendError(res, 403, false, 'Not authorized');
    }

    const bookings = await prisma.booking.findMany({
      where: { propertyId },
      include: { tenant: { select: { profile: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess(res, 200, true, 'Property bookings fetched', bookings);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch property bookings', error.message);
  }
};

export const requestModification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).user.id;
    const { newCheckIn, newCheckOut, reason } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id, tenantId } });
    if (!booking) return sendError(res, 404, false, 'Booking not found');

    const modification = await prisma.bookingModification.create({
      data: {
        bookingId: id,
        newCheckIn: newCheckIn ? new Date(newCheckIn) : null,
        newCheckOut: newCheckOut ? new Date(newCheckOut) : null,
        reason,
        status: 'PENDING'
      }
    });

    return sendSuccess(res, 201, true, 'Modification requested', modification);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to request modification', error.message);
  }
};
