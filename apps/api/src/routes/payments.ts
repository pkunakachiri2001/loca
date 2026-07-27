/**
 * FleetNest — Payments Routes
 * Supports Stripe (production) and Mock mode (demo)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

const router = Router();

// Lazily initialize Stripe only if not in mock mode
let stripe: any = null;
function getStripe() {
  if (!stripe && process.env.STRIPE_MOCK_MODE !== 'true') {
    const Stripe = require('stripe');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
  }
  return stripe;
}

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

    const isMockMode = process.env.STRIPE_MOCK_MODE === 'true';

    if (isMockMode) {
      // Create a mock payment intent
      const payment = await prisma.payment.create({
        data: {
          bookingId,
          userId: req.user!.id,
          amount: booking.totalAmount,
          currency: booking.currency,
          method: 'MOCK',
          status: 'PENDING',
          stripeClientSecret: `mock_secret_${Date.now()}`,
        },
      });

      res.json({
        success: true,
        data: {
          clientSecret: payment.stripeClientSecret,
          paymentId: payment.id,
          amount: booking.totalAmount,
          currency: booking.currency,
          isMockMode: true,
        },
      });
      return;
    }

    // Real Stripe payment intent
    const stripeClient = getStripe();
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(booking.totalAmount * 100), // Convert to kobo/cents
      currency: booking.currency.toLowerCase(),
      metadata: { bookingId, userId: req.user!.id },
    });

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId: req.user!.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        method: 'STRIPE',
        status: 'PENDING',
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret,
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
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
// POST /api/payments/webhook — Stripe webhook handler
// ──────────────────────────────────────────────
router.post('/webhook', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (process.env.STRIPE_MOCK_MODE === 'true') {
      res.json({ received: true });
      return;
    }

    const sig = req.headers['stripe-signature'];
    const stripeClient = getStripe();

    let event: any;
    try {
      event = stripeClient.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch {
      res.status(400).json({ error: 'Invalid webhook signature.' });
      return;
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object;
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: intent.id },
          data: { status: 'COMPLETED', paidAt: new Date(), stripeChargeId: intent.latest_charge },
        });
        const payment = await prisma.payment.findFirst({ where: { stripePaymentIntentId: intent.id } });
        if (payment) {
          await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object;
        await prisma.payment.updateMany({
          where: { stripePaymentIntentId: intent.id },
          data: { status: 'FAILED', failedAt: new Date(), failureMessage: intent.last_payment_error?.message },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
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
