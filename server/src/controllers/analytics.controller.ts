import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export const getAdminDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;

    // We assume the user is an admin looking at their properties.
    const properties = await prisma.property.findMany({ where: { ownerId: adminId } });
    const propertyIds = properties.map(p => p.id);

    const [totalProperties, totalBookings, pendingRefunds, payments] = await Promise.all([
      prisma.property.count({ where: { ownerId: adminId } }),
      prisma.booking.count({ where: { propertyId: { in: propertyIds } } }),
      prisma.refundRequest.count({ where: { booking: { propertyId: { in: propertyIds } }, status: 'PENDING' } }),
      prisma.payment.findMany({
        where: { booking: { propertyId: { in: propertyIds } }, status: 'SUCCESSFUL' },
        select: { amount: true, createdAt: true }
      })
    ]);

    const totalRevenue = payments.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // Group revenue by month for chart data
    const monthlyRevenue: Record<string, number> = {};
    payments.forEach(p => {
      const month = p.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(p.amount);
    });

    const metrics = {
      totalProperties,
      totalBookings,
      totalRevenue,
      pendingRefunds,
      revenueChart: Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount }))
    };

    return sendSuccess(res, 200, true, 'Admin metrics fetched', metrics);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch admin metrics', error.message);
  }
};
