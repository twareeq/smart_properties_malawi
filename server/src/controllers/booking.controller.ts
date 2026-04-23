import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { v4 as uuidv4 } from 'uuid';

// ─── Admin: All Bookings ──────────────────────────────────────────────────────
export const getAdminBookings = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;
    const role = (req as any).user.role;
    if (role !== 'ADMIN') return sendError(res, 403, false, 'Admin access required');

    const bookings = await prisma.booking.findMany({
      where: {
        property: { ownerId: adminId }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: { id: true, title: true, city: true, region: true, address: true, status: true, type: true, pricePerNight: true }
        },
        tenant: {
          select: { 
            id: true, 
            email: true, 
            profile: {
              select: { firstName: true, lastName: true, phone: true, avatarUrl: true }
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, status: true, amount: true, reference: true, paidAt: true, currency: true }
        }
      }
    });

    return sendSuccess(res, 200, true, 'Admin bookings fetched', bookings);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch admin bookings', error.message);
  }
};

// ─── Admin: Single Booking Detail ────────────────────────────────────────────
export const getAdminBookingDetail = async (req: Request, res: Response) => {
  try {
    const role = (req as any).user.role;
    if (role !== 'ADMIN') return sendError(res, 403, false, 'Admin access required');

    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            owner: { 
              select: { 
                id: true, 
                email: true, 
                profile: {
                  select: { firstName: true, lastName: true, phone: true }
                } 
              } 
            },
            images: { where: { isPrimary: true }, take: 1 }
          }
        },
        tenant: {
          select: { 
            id: true, 
            email: true, 
            profile: {
              select: { firstName: true, lastName: true, phone: true, avatarUrl: true, bio: true }
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          include: { invoice: true, receipt: true }
        },
        modifications: true
      }
    });

    if (!booking) return sendError(res, 404, false, 'Booking not found');

    // Verify ownership
    if (booking.property.ownerId !== (req as any).user.id) {
      return sendError(res, 403, false, 'Not authorized to view this booking');
    }

    return sendSuccess(res, 200, true, 'Booking detail fetched', booking);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch booking detail', error.message);
  }
};

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

    const newBooking = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
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

      // Generate strict reference for PayChangu early
      const reference = `TX-${uuidv4().substring(0, 8).toUpperCase()}-${Date.now()}`;

      // Create pending payment immediately
      const payment = await tx.payment.create({
        data: {
          tenantId,
          bookingId: booking.id,
          amount: booking.totalCost,
          reference,
          status: 'PENDING',
          provider: 'PayChangu',
        },
      });

      // Create pre-payment invoice immediately
      await tx.invoice.create({
        data: {
          paymentId: payment.id,
          number: `INV-${reference}`,
          amount: payment.amount,
        },
      });

      return booking;
    }, {
      timeout: 15000
    });

    // Notify Admin (we'll implement notifications later, placeholder here)

    return sendSuccess(res, 201, true, 'Booking created pending payment', newBooking);
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

// ─── Tenant: Single Booking Detail ───────────────────────────────────────────
export const getTenantBookingDetail = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.id;
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: { firstName: true, lastName: true, phone: true }
                }
              }
            },
            images: { where: { isPrimary: true }, take: 1 }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          include: { invoice: true, receipt: true }
        },
        modifications: true
      }
    });

    if (!booking) return sendError(res, 404, false, 'Booking not found');
    if (booking.tenantId !== tenantId) {
      return sendError(res, 403, false, 'Not authorized');
    }

    return sendSuccess(res, 200, true, 'Booking detail fetched', booking);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch booking detail', error.message);
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

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = (req as any).user.id;

    const booking = await prisma.booking.findUnique({
      where: { id, tenantId },
      include: { payments: true }
    });

    if (!booking) return sendError(res, 404, false, 'Booking not found');
    if (booking.status !== 'PENDING') {
      return sendError(res, 400, false, `Cannot cancel booking with status ${booking.status}`);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Mark booking as cancelled
      await tx.booking.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      // 2. Mark associated property back to available (if it was somehow blocked, though normally it's blocked at CONFIRMED. Keeping this explicit for safety)
      await tx.property.update({
        where: { id: booking.propertyId },
        data: { status: 'AVAILABLE' }
      });

      // 3. Mark pending payments/invoices as failed/aborted
      await tx.payment.updateMany({
        where: { bookingId: id, status: 'PENDING' },
        data: { status: 'FAILED' }
      });
    });

    return sendSuccess(res, 200, true, 'Booking cancelled successfully');
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to cancel booking', error.message);
  }
};

export const downloadAgreement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const role = (req as any).user.role;
    
    // Using any as simple workaround for the Prisma query typing on deeply nested includes if any issue arises, though it should be fine.
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: { include: { owner: { include: { profile: true } } } },
        tenant: { include: { profile: true } }
      }
    });

    if (!booking) return res.status(404).send('Booking not found');
    
    // Auth check: Tenant or Property Owner only. Role ADMIN bypass is removed for cross-admin security.
    const isOwner = booking.property.ownerId === userId;
    const isTenant = booking.tenantId === userId;

    if (!isOwner && !isTenant) {
      return res.status(403).send('Not authorized to access this document');
    }
    
    if (booking.status === 'PENDING' || booking.status === 'CANCELLED') {
      return res.status(400).send('Agreement not available for this booking status');
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Lease Agreement - ${booking.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
          .title { font-size: 28px; font-weight: bold; color: #1a56db; }
          .section-title { font-size: 18px; font-weight: bold; margin-top: 20px; text-decoration: underline; }
          .content { margin-bottom: 30px; }
          .signature-box { margin-top: 50px; display: flex; justify-content: space-between; }
          .sig-line { border-top: 1px solid #000; width: 250px; padding-top: 10px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">RESIDENTIAL LEASE AGREEMENT</div>
          <div>Smart Properties Malawi</div>
        </div>
        
        <div class="content">
          <p>This Residential Lease Agreement ("Agreement") is made and entered into on <strong>${new Date().toLocaleDateString()}</strong>, by and between:</p>
          
          <p><strong>Landlord:</strong> ${booking.property.owner.profile?.firstName || ''} ${booking.property.owner.profile?.lastName || 'Owner'} <br/>
          <strong>Tenant:</strong> ${booking.tenant.profile?.firstName || ''} ${booking.tenant.profile?.lastName || 'Tenant'}</p>
          
          <div class="section-title">1. PROPERTY DETAILS</div>
          <p>The Landlord agrees to lease the property located at:<br/>
          <strong>${booking.property.address}, ${booking.property.city}, ${booking.property.region}, ${booking.property.country}</strong><br/>
          Type: ${booking.property.type} | Bedrooms: ${booking.property.bedrooms} | Bathrooms: ${booking.property.bathrooms}</p>

          <div class="section-title">2. LEASE TERM</div>
          <p>The term of this lease shall commence on <strong>${new Date(booking.checkIn).toLocaleDateString()}</strong> and, unless terminated earlier in accordance with this Agreement, will end on <strong>${booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A'}</strong> (Total: ${booking.nights} nights).</p>

          <div class="section-title">3. RENT & PAYMENT</div>
          <p>The Tenant agrees to pay the total rental amount of <strong>MWK ${Number(booking.totalCost).toLocaleString()}</strong> for the duration of the lease.</p>

          <div class="section-title">4. TERMS & CONDITIONS</div>
          <p>The Tenant agrees to maintain the property in a clean and safe condition, report any damages immediately to the Landlord, and adhere to all community and specific property rules listed on the platform.</p>
        </div>

        <div class="signature-box">
          <div>
            <div class="sig-line">Landlord Signature / Date</div>
            <p>Digitally agreed via platform</p>
          </div>
          <div>
            <div class="sig-line">Tenant Signature / Date</div>
            <p>Digitally agreed via platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="lease-agreement-${booking.id}.html"`);
    res.send(html);
  } catch (error: any) {
    res.status(500).send('Error generating agreement document');
  }
};
