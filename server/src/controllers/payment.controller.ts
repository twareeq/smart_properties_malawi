import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { v4 as uuidv4 } from 'uuid';

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.id;
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({ 
      where: { id: bookingId }, 
      include: { property: true } 
    });

    if (!booking) return sendError(res, 404, false, 'Booking not found');
    if (booking.tenantId !== tenantId) return sendError(res, 403, false, 'Not authorized');

    // Generate strict reference for PayChangu
    const reference = `TX-${uuidv4().substring(0, 8).toUpperCase()}-${Date.now()}`;

    // Create pending payment
    const payment = await prisma.payment.create({
      data: {
        tenantId,
        bookingId,
        amount: booking.totalCost,
        reference,
        status: 'PENDING',
        provider: 'PayChangu'
      }
    });

    // Create pre-payment invoice
    await prisma.invoice.create({
      data: {
        paymentId: payment.id,
        number: `INV-${reference}`,
        amount: payment.amount
      }
    });

    // Here we would typically call PayChangu API to get checkout URL
    // For MVP, return mock URL or checkout parameters
    return sendSuccess(res, 201, true, 'Payment initiated', {
      payment,
      checkoutUrl: `https://nexus.paychangu.com/checkout?ref=${reference}&amount=${payment.amount}`
    });
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to initiate payment', error.message);
  }
};

// Webhook for PayChangu
export const paychanguWebhook = async (req: Request, res: Response) => {
  try {
    // In production, verify PayChangu signature
    // const signature = req.headers['x-paychangu-signature'];
    
    const { event, data } = req.body;
    
    // Example event from PayChangu
    if (event === 'charge.success') {
      const { tx_ref, amount, status } = data;

      const payment = await prisma.payment.findUnique({ 
        where: { reference: tx_ref },
        include: { booking: true } 
      });
      if (!payment) return res.status(200).send('Payment not found, skipping');

      if (payment.status === 'SUCCESSFUL') {
        return res.status(200).send('Already processed');
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESSFUL', paidAt: new Date() }
        });

        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' }
        });

        // Hide property since it's now reserved by a tenant
        await tx.property.update({
          where: { id: payment.booking.propertyId },
          data: { status: 'HIDDEN' }
        });

        // Generate Receipt
        await tx.receipt.create({
          data: {
            paymentId: payment.id,
            number: `REC-${tx_ref}`,
            amount: payment.amount
          }
        });
      });

      return res.status(200).send('Webhook processed');
    }

    return res.status(200).send('Event ignored');
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return res.status(500).send('Webhook error');
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.id;
    
    const invoices = await prisma.invoice.findMany({
      where: {
        payment: { tenantId }
      },
      include: {
        payment: { select: { booking: { select: { property: { select: { title: true } } } } } }
      },
      orderBy: { generatedAt: 'desc' }
    });

    return sendSuccess(res, 200, true, 'Invoices fetched', invoices);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch invoices', error.message);
  }
};

export const getReceipts = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.id;
    
    const receipts = await prisma.receipt.findMany({
      where: {
        payment: { tenantId }
      },
      include: {
        payment: { select: { booking: { select: { property: { select: { title: true } } } } } }
      },
      orderBy: { generatedAt: 'desc' }
    });

    return sendSuccess(res, 200, true, 'Receipts fetched', receipts);
  } catch (error: any) {
    return sendError(res, 500, false, 'Failed to fetch receipts', error.message);
  }
};
