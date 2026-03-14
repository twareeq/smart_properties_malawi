import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { v4 as uuidv4 } from 'uuid';

import { VerificationAPI } from 'paychangu-js/dist/services/verification';

export const initiatePayment = async (
  req: Request,
  res: Response,
) => {
  try {
    const tenantId = (req as any).user.id;
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true },
    });

    if (!booking)
      return sendError(res, 404, false, 'Booking not found');
    if (booking.tenantId !== tenantId)
      return sendError(res, 403, false, 'Not authorized');
    if (booking.status !== 'PENDING')
      return sendError(res, 400, false, 'Booking is not pending');
    
    if (booking.property.status !== 'AVAILABLE')
      return sendError(res, 400, false, `Property is already ${booking.property.status.toLowerCase()}`);

    const user = await prisma.user.findUnique({
      where: { id: tenantId },
      include: { profile: true },
    });

    // Find the immediately generated pending payment from createBooking
    const payment = await prisma.payment.findFirst({
      where: {
        tenantId,
        bookingId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment) {
      return sendError(res, 404, false, 'Pending payment record not found for this booking');
    }

    try {
      const paychanguKey =
        process.env.PAYCHANGU_SECRET_KEY || 'SEC-test-key';
      // Ensuring explicit domain fallbacks for localhost testing
      const frontendDomain =
        process.env.FRONTEND_URL || 'http://localhost:3000';
      const backendDomain =
        process.env.API_URL || 'http://localhost:5000/api/v1';

      const callbackUrl = `${frontendDomain}/payment/callback`;

      const paychanguResponse = await fetch(
        'https://api.paychangu.com/payment',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${paychanguKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Number(payment.amount),
            currency: 'MWK',
            email: user?.email || 'tenant@example.com',
            first_name: user?.profile?.firstName || 'Tenant',
            last_name: user?.profile?.lastName || 'User',
            returnUrl: `${backendDomain}/payments/webhook/paychangu`,
            callback_url: callbackUrl,
            tx_ref: payment.reference,
            customization: {
              title: 'Booking Payment',
              description: booking.property.title,
            },
          }),
        },
      );

      const checkoutData = await paychanguResponse.json();
      console.log(
        '[PayChangu] Initiate response:',
        JSON.stringify(checkoutData),
      );

      if (
        checkoutData?.status === 'success' &&
        checkoutData?.data?.checkout_url
      ) {
        return sendSuccess(res, 201, true, 'Payment initiated', {
          payment,
          checkoutUrl: checkoutData.data.checkout_url,
        });
      }

      console.error('[PayChangu] Unexpected response:', checkoutData);
      return sendError(
        res,
        502,
        false,
        checkoutData?.message ||
          'PayChangu did not return a checkout URL. Check your secret key.',
      );
    } catch (apiError) {
      console.error('PayChangu API Error:', apiError);
      return sendError(
        res,
        500,
        false,
        'Failed to connect to payment gateway',
      );
    }
  } catch (error: any) {
    return sendError(
      res,
      500,
      false,
      'Failed to initiate payment',
      error.message,
    );
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { tx_ref } = req.body;

    if (!tx_ref) {
      return sendError(
        res,
        400,
        false,
        'Missing tx_ref in request body.',
      );
    }

    const secretKey = process.env.PAYCHANGU_SECRET_KEY;
    if (!secretKey) {
      return sendError(
        res,
        500,
        false,
        'Missing PAYCHANGU_SECRET_KEY. Required for server-side verification.',
      );
    }

    const verificationClient = VerificationAPI.getInstance();
    verificationClient.setSecretKey(secretKey);
    const verification =
      await verificationClient.verifyTransaction(tx_ref);
    const paymentStatus = verification.data?.status ?? 'unknown';

    const payment = await prisma.payment.findUnique({
      where: { reference: tx_ref },
      include: { booking: { include: { property: true } } },
    });

    if (!payment)
      return sendError(
        res,
        404,
        false,
        'Payment record not found locally',
      );
    if (payment.status === 'SUCCESSFUL')
      return sendSuccess(res, 200, true, 'Payment already verified');

    // Double check property status before confirming
    if (payment.booking.property.status !== 'AVAILABLE') {
      return sendError(res, 400, false, 'Property is no longer available for booking.');
    }

    if (paymentStatus === 'success') {
      let alreadyProcessed = false;
      await prisma.$transaction(async (tx) => {
        // Atomic update to prevent race conditions between webhook and redirect
        const updateResult = await tx.payment.updateMany({
          where: { id: payment.id, status: 'PENDING' },
          data: { status: 'SUCCESSFUL', paidAt: new Date() },
        });

        if (updateResult.count === 0) {
          alreadyProcessed = true;
          return;
        }

        // Cancel any other pending payments for this booking (stale invoices)
        await tx.payment.updateMany({
          where: {
            bookingId: payment.bookingId,
            id: { not: payment.id },
            status: 'PENDING',
          },
          data: { status: 'FAILED' },
        });

        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' },
        });

        await tx.property.update({
          where: { id: payment.booking.propertyId },
          data: { status: 'RENTED' },
        });

        await tx.notification.create({
          data: {
            userId: payment.tenantId,
            type: 'PAYMENT_SUCCESS',
            title: 'Payment Successful',
            message: `Your payment of MWK ${payment.amount} for ${payment.booking.property.title} was successful. A lease agreement has been generated.`,
          },
        });

        await tx.receipt.create({
          data: {
            paymentId: payment.id,
            number: `REC-${tx_ref}`,
            amount: payment.amount,
          },
        });
      });

      return sendSuccess(
        res,
        200,
        true,
        alreadyProcessed
          ? 'Payment already verified'
          : 'Payment verified successfully',
      );
    } else if (
      paymentStatus === 'failed' ||
      paymentStatus === 'cancelled'
    ) {
      await prisma.payment.updateMany({
        where: { id: payment.id, status: 'PENDING' },
        data: { status: 'FAILED' },
      });
      return sendError(
        res,
        400,
        false,
        'Payment verification failed or cancelled at gateway',
      );
    }

    // Still pending / unknown
    return sendError(
      res,
      400,
      false,
      `Payment state is currently ${paymentStatus}`,
    );
  } catch (error: any) {
    return sendError(
      res,
      500,
      false,
      'Failed to verify payment',
      error.message,
    );
  }
};

export const paychanguWebhook = async (
  req: Request,
  res: Response,
) => {
  try {
    const payload = req.body;
    const txRef = payload.tx_ref ?? payload.data?.tx_ref;
    const status = payload.status ?? payload.data?.status;

    if (!txRef) {
      return res
        .status(400)
        .json({ error: 'tx_ref missing in callback payload.' });
    }

    const payment = await prisma.payment.findUnique({
      where: { reference: txRef },
      include: { booking: { include: { property: true } } },
    });

    if (!payment)
      return res
        .status(200)
        .send('Transaction not found locally, ignored');
    if (payment.status === 'SUCCESSFUL')
      return res.status(200).send('Already verified');

    if (status === 'success') {
      await prisma.$transaction(async (tx) => {
        // Atomic check to prevent double execution if return_url page hits at exact same time
        const updateResult = await tx.payment.updateMany({
          where: { id: payment.id, status: 'PENDING' },
          data: { status: 'SUCCESSFUL', paidAt: new Date() },
        });

        if (updateResult.count === 0) return; // Handled concurrently

        // Stale invoice cleanup
        await tx.payment.updateMany({
          where: {
            bookingId: payment.bookingId,
            id: { not: payment.id },
            status: 'PENDING',
          },
          data: { status: 'FAILED' },
        });

        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: 'CONFIRMED' },
        });
        await tx.property.update({
          where: { id: payment.booking.propertyId },
          data: { status: 'RENTED' },
        });
        await tx.notification.create({
          data: {
            userId: payment.tenantId,
            type: 'PAYMENT_SUCCESS',
            title: 'Payment Successful',
            message: `Your payment of MWK ${payment.amount} for ${payment.booking.property.title} was successful. A lease agreement has been generated.`,
          },
        });
        await tx.receipt.create({
          data: {
            paymentId: payment.id,
            number: `REC-${txRef}`,
            amount: payment.amount,
          },
        });
      });
    } else if (status === 'failed' || status === 'cancelled') {
      await prisma.payment.updateMany({
        where: { id: payment.id, status: 'PENDING' },
        data: { status: 'FAILED' },
      });
    }

    return res.status(200).json({ received: true, txRef });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return res
      .status(400)
      .json({ error: 'Invalid callback payload.' });
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.id;

    const invoices = await prisma.invoice.findMany({
      where: {
        payment: { tenantId },
      },
      include: {
        payment: {
          select: {
            booking: {
              select: { property: { select: { title: true } } },
            },
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });

    return sendSuccess(res, 200, true, 'Invoices fetched', invoices);
  } catch (error: any) {
    return sendError(
      res,
      500,
      false,
      'Failed to fetch invoices',
      error.message,
    );
  }
};

export const getReceipts = async (req: Request, res: Response) => {
  try {
    const tenantId = (req as any).user.id;

    const receipts = await prisma.receipt.findMany({
      where: {
        payment: { tenantId },
      },
      include: {
        payment: {
          select: {
            booking: {
              select: { property: { select: { title: true } } },
            },
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });

    return sendSuccess(res, 200, true, 'Receipts fetched', receipts);
  } catch (error: any) {
    return sendError(
      res,
      500,
      false,
      'Failed to fetch receipts',
      error.message,
    );
  }
};

export const downloadInvoice = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        payment: {
          include: {
            tenant: { include: { profile: true } },
            booking: { include: { property: true } },
          },
        },
      },
    });

    if (!invoice) return res.status(404).send('Invoice not found');
    
    // Auth check: Tenant or Property Owner only. Role ADMIN bypass removed for cross-admin security.
    const isOwner = invoice.payment.booking.property.ownerId === userId;
    const isTenant = invoice.payment.tenantId === userId;

    if (!isOwner && !isTenant) {
      return res.status(403).send('Not authorized to access this document');
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 28px; font-weight: bold; color: #1a56db; }
          .details { margin-bottom: 30px; line-height: 1.6; }
          .amount { font-size: 24px; font-weight: bold; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">INVOICE</div>
          <div>Smart Properties Malawi</div>
        </div>
        <div class="details">
          <p><strong>Invoice No:</strong> ${invoice.number}</p>
          <p><strong>Date:</strong> ${new Date(invoice.generatedAt).toLocaleDateString()}</p>
          <p><strong>Billed To:</strong> ${invoice.payment.tenant.profile?.firstName || ''} ${invoice.payment.tenant.profile?.lastName || 'Tenant'}</p>
          <p><strong>Property:</strong> ${invoice.payment.booking.property.title}</p>
        </div>
        <div class="amount">
          Total Due: MWK ${Number(invoice.amount).toLocaleString()}
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${invoice.number}.html"`,
    );
    res.send(html);
  } catch (error: any) {
    res.status(500).send('Error generating document');
  }
};

export const downloadReceipt = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const role = (req as any).user.role;

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        payment: {
          include: {
            tenant: { include: { profile: true } },
            booking: { include: { property: true } },
          },
        },
      },
    });

    if (!receipt) return res.status(404).send('Receipt not found');

    // Auth check: Tenant or Property Owner only. Role ADMIN bypass removed for cross-admin security.
    const isOwner = receipt.payment.booking.property.ownerId === userId;
    const isTenant = receipt.payment.tenantId === userId;

    if (!isOwner && !isTenant) {
      return res.status(403).send('Not authorized to access this document');
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${receipt.number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 28px; font-weight: bold; color: #10b981; }
          .details { margin-bottom: 30px; line-height: 1.6; }
          .amount { font-size: 24px; font-weight: bold; margin-top: 20px; color: #10b981; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">PAYMENT RECEIPT</div>
          <div>Smart Properties Malawi</div>
        </div>
        <div class="details">
          <p><strong>Receipt No:</strong> ${receipt.number}</p>
          <p><strong>Date Paid:</strong> ${new Date(receipt.payment?.paidAt || receipt.generatedAt).toLocaleDateString()}</p>
          <p><strong>Received From:</strong> ${receipt.payment.tenant.profile?.firstName || ''} ${receipt.payment.tenant.profile?.lastName || 'Tenant'}</p>
          <p><strong>For Property:</strong> ${receipt.payment.booking.property.title}</p>
          <p><strong>Status:</strong> PAID IN FULL</p>
        </div>
        <div class="amount">
          Amount Paid: MWK ${Number(receipt.amount).toLocaleString()}
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="receipt-${receipt.number}.html"`,
    );
    res.send(html);
  } catch (error: any) {
    res.status(500).send('Error generating document');
  }
};
