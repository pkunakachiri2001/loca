/**
 * Famba — Payments Routes
 * Supports Stripe (production) and Mock mode (demo)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

import { createWebPayment, checkPaymentStatus } from '../services/paynow';

const router = Router();

// ──────────────────────────────────────────────
// POST /api/payments/intent — Create payment intent
// ──────────────────────────────────────────────
router.post('/intent', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, userId: req.user!.id, status: 'PENDING' },
    });

    if (!booking) throw new ApiError(404, 'Booking not found or already paid.');

    const paynowReference = `web_${bookingId}_${Date.now()}`;
    const userEmail = req.user!.email || 'customer@famba.co.zw';

    if (isMockMode) {
      // Create a mock payment
      const payment = await prisma.payment.create({
        data: {
          bookingId,
          userId: req.user!.id,
          amount: booking.totalAmount,
          currency: booking.currency,
          method: 'MOCK',
          status: 'PENDING',
          paynowReference,
        },
      });

      res.json({
        success: true,
        data: {
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/mock-pay?ref=${paynowReference}`,
          paymentId: payment.id,
          amount: booking.totalAmount,
          currency: booking.currency,
          isMockMode: true,
        },
      });
      return;
    }

    // Real Paynow Web Checkout
    const paynowRes = await createWebPayment(paynowReference, booking.totalAmount, userEmail);

    if (!paynowRes.success) {
      throw new ApiError(500, `Paynow error: ${paynowRes.error}`);
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId: req.user!.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        method: 'PAYNOW',
        status: 'PENDING',
        paynowReference,
        paynowPollUrl: paynowRes.pollUrl,
      },
    });

    res.json({
      success: true,
      data: {
        redirectUrl: paynowRes.redirectUrl,
        paymentId: payment.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        isMockMode: false,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/payments/mock — Confirm mock payment (demo mode)
// ──────────────────────────────────────────────
router.post('/mock', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (process.env.STRIPE_MOCK_MODE !== 'true') {
      throw new ApiError(400, 'Mock payments are disabled. Use Stripe.');
    }

    const { bookingId, paymentId } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId, bookingId, userId: req.user!.id, status: 'PENDING' },
    });

    if (!payment) throw new ApiError(404, 'Payment not found.');

    // Simulate processing delay would happen on frontend
    const [updatedPayment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          transactionRef: `MOCK-TXN-${Date.now()}`,
        },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED', confirmedAt: new Date() },
      }),
    ]);

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful!',
        message: `Your payment of $${payment.amount.toLocaleString()} was successful. Your booking is confirmed!`,
        link: `/dashboard/bookings/${bookingId}`,
        metadata: { paymentId, bookingId },
      },
    });

    res.json({
      success: true,
      message: 'Payment processed successfully.',
      data: {
        payment: updatedPayment,
        transactionRef: updatedPayment.transactionRef,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/payments/paynow-webhook — Paynow webhook handler
// ──────────────────────────────────────────────
router.post('/paynow-webhook', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).send('OK');

    const { reference, paynowreference, status, pollurl } = req.body;

    if (status !== 'Paid') {
      logger.info(`[PaynowWebHook] Status is ${status} for ${reference}.`);
      return;
    }

    const payment = await prisma.payment.findFirst({
      where: { paynowReference: reference },
    });

    if (!payment || payment.status === 'COMPLETED') {
      return;
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          transactionRef: paynowreference,
        },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED', confirmedAt: new Date() },
      }),
    ]);

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful!',
        message: `Your Paynow payment of $${payment.amount.toLocaleString()} was successful.`,
        link: `/dashboard/bookings/${payment.bookingId}`,
        metadata: { paymentId: payment.id, bookingId: payment.bookingId },
      },
    });

    logger.info(`[PaynowWebHook] Successfully processed payment for booking ${payment.bookingId}`);
  } catch (err) {
    logger.error('[PaynowWebHook] Error:', err);
  }
});

// ──────────────────────────────────────────────
// GET /api/payments/:id — Get payment details
// ──────────────────────────────────────────────
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { booking: { include: { listing: { select: { title: true } } } } },
    });

    if (!payment) throw new ApiError(404, 'Payment not found.');
    if (payment.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new ApiError(403, 'Access denied.');
    }

    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
});

export default router;
