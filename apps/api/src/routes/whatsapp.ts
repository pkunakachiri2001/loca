/**
 * FAMBA WhatsApp Bot — Webhook Router
 *
 * POST /api/whatsapp/webhook
 *   Receives incoming messages from CodeChat (self-hosted WhatsApp API).
 *   Protected by HMAC-SHA256 signature verification.
 *
 * POST /api/whatsapp/stripe-webhook
 *   Receives Stripe Checkout "payment succeeded" events.
 *   Protected by Stripe's own signature verification.
 *
 * GET  /api/whatsapp/verify-policy/:ref
 *   Public endpoint embedded in QR codes so Zimnat staff can verify a
 *   policy is genuine by scanning the QR.
 */

import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import Stripe from 'stripe';
import { logger } from '../config/logger';
import { prisma } from '../config/database';
import { handleIncomingMessage, completePolicyAfterPayment } from '../services/whatsapp/bot';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10' as any,
});

// ──────────────────────────────────────────────────────────────
// SECURITY: Rate limiter for webhook endpoints
// Prevents flooding/abuse of the webhook endpoints.
// ──────────────────────────────────────────────────────────────
const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 120,             // max 120 messages per minute per IP (generous for CodeChat)
  message: { success: false, message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ──────────────────────────────────────────────────────────────
// SECURITY: HMAC-SHA256 Signature Verification for CodeChat
//
// In your CodeChat config, set a webhook secret.
// CodeChat will include a header: x-codechat-signature: sha256=<hmac>
// We verify it here so ONLY your CodeChat instance can trigger the bot.
//
// ENV: CODECHAT_WEBHOOK_SECRET — must match your CodeChat config.
// ──────────────────────────────────────────────────────────────
const CODECHAT_SECRET = process.env.CODECHAT_WEBHOOK_SECRET || '';

function verifyCodeChatSignature(req: Request, res: Response, next: NextFunction): void {
  // If no secret is configured, warn but allow (development mode)
  if (!CODECHAT_SECRET) {
    logger.warn('[Security] CODECHAT_WEBHOOK_SECRET is not set — webhook is unprotected!');
    return next();
  }

  const signature = req.headers['x-codechat-signature'] as string
    || req.headers['x-hub-signature-256'] as string
    || '';

  if (!signature) {
    logger.warn('[Security] CodeChat webhook received with no signature header');
    res.status(401).json({ success: false, message: 'Missing signature' });
    return;
  }

  // Compute expected HMAC from raw body
  const rawBody = JSON.stringify(req.body); // body already parsed by express.json()
  const expected = 'sha256=' + crypto
    .createHmac('sha256', CODECHAT_SECRET)
    .update(rawBody)
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  const sigBuffer      = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    logger.warn(`[Security] Invalid CodeChat signature from ${req.ip}`);
    res.status(401).json({ success: false, message: 'Invalid signature' });
    return;
  }

  next();
}

// ──────────────────────────────────────────────────────────────
// SECURITY: Zimbabwe phone number validation
// Ensures we only process messages from real Zimbabwean numbers.
// Zimbabwe numbers: 263 + 7X XXX XXXX (10 digits after country code)
// ──────────────────────────────────────────────────────────────
function isValidZimbabwePhone(phone: string): boolean {
  // Accepts: 2637XXXXXXXX (12 digits) or 07XXXXXXXX (10 digits)
  const zw12 = /^2637[0-9]{8}$/;   // e.g. 263771234567
  const zw10 = /^07[0-9]{8}$/;     // e.g. 0771234567
  const intl  = /^\+?2637[0-9]{8}$/;
  return zw12.test(phone) || zw10.test(phone) || intl.test(phone);
}

// ──────────────────────────────────────────────────────────────
// POST /api/whatsapp/webhook
// CodeChat fires this for every incoming WhatsApp message.
// Protected by: rate limiting + HMAC signature verification.
// ──────────────────────────────────────────────────────────────
router.post('/webhook', webhookRateLimiter, verifyCodeChatSignature, async (req: Request, res: Response) => {
  // Immediately return 200 — CodeChat retries if it doesn't get it quickly
  res.status(200).json({ received: true });

  const body = req.body;

  // Only handle new incoming messages
  if (body?.event !== 'messages.upsert' && body?.event !== 'new.message') {
    return;
  }

  try {
    // Extract message text and sender phone from CodeChat payload
    // CodeChat wraps Evolution API / WhiskeySockets format
    const messages = body?.data?.messages || (body?.data ? [body.data] : []);

    for (const msg of messages) {
      // Skip messages sent BY the bot (fromMe = true)
      if (msg?.key?.fromMe) continue;

      const senderJid: string = msg?.key?.remoteJid || '';
      if (!senderJid) continue;

      // Extract phone number — JID looks like "263771234567@s.whatsapp.net"
      const phone = senderJid.split('@')[0];
      if (!phone) continue;

      // SECURITY: Validate phone number format
      if (!isValidZimbabwePhone(phone)) {
        logger.warn(`[Webhook] Ignoring message from non-ZW number: ${phone}`);
        continue;
      }

      // Extract the text content
      const text: string =
        msg?.message?.conversation ||
        msg?.message?.extendedTextMessage?.text ||
        msg?.message?.imageMessage?.caption ||
        '';

      if (!text) {
        logger.info(`[Webhook] Non-text message from ${phone}, skipping.`);
        continue;
      }

      // Process asynchronously — don't block the 200 response
      handleIncomingMessage(phone, text).catch((err) => {
        logger.error(`[Webhook] handleIncomingMessage error for ${phone}:`, err);
      });
    }
  } catch (err) {
    logger.error('[Webhook] Failed to process CodeChat webhook:', err);
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/whatsapp/stripe-webhook
// Stripe calls this when payment is completed.
// NOTE: Register this URL in your Stripe dashboard webhook settings.
//       Event to listen for: checkout.session.completed
// ──────────────────────────────────────────────────────────────
router.post(
  '/stripe-webhook',
  // Raw body needed for Stripe signature verification
  // (already handled in app.ts for /api/payments/webhook; this is a separate endpoint)
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WHATSAPP_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: Stripe.Event;

    try {
      // req.body is raw Buffer if you add raw middleware for this route (see app.ts note)
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret,
      );
    } catch (err: any) {
      logger.error('[StripeWebhook] Signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    res.status(200).json({ received: true });

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const phone   = session.metadata?.whatsappPhone;

      if (!phone) {
        logger.warn('[StripeWebhook] No whatsappPhone in session metadata');
        return;
      }

      // SECURITY: Idempotency check — prevent duplicate policy on Stripe retries
      // Stripe can fire the same webhook multiple times. We check if a policy
      // already exists for this Stripe session before processing.
      const existingPolicy = await prisma.insurancePolicy.findFirst({
        where: { stripeSessionId: session.id },
      });

      if (existingPolicy) {
        logger.info(`[StripeWebhook] Duplicate webhook for session ${session.id} — already issued policy ${existingPolicy.policyRef}. Skipping.`);
        return;
      }

      logger.info(`[StripeWebhook] Payment complete for ${phone}, session ${session.id}`);

      completePolicyAfterPayment(phone, session.id).catch((err) => {
        logger.error('[StripeWebhook] completePolicyAfterPayment error:', err);
      });
    }
  },
);

// ──────────────────────────────────────────────────────────────
// GET /api/whatsapp/verify-policy/:ref
// Zimnat staff scan the QR code and land here. Shows policy details.
// ──────────────────────────────────────────────────────────────
router.get('/verify-policy/:ref', async (req: Request, res: Response) => {
  const { ref } = req.params;

  try {
    const policy = await prisma.insurancePolicy.findUnique({
      where: { policyRef: ref },
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found. This QR code may be invalid.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Policy verified successfully ✅',
      data: {
        policyRef:    policy.policyRef,
        ownerName:    policy.ownerName,
        idNumber:     policy.idNumber,
        vehicleReg:   policy.vehicleReg,
        vehicleType:  policy.vehicleType,
        coverageType: policy.coverageType,
        premium:      `$${policy.premium} USD`,
        paymentStatus: policy.paymentStatus,
        issuedAt:     policy.issuedAt,
        expiresAt:    policy.expiresAt,
        deliveryType: policy.deliveryType,
      },
    });
  } catch (err) {
    logger.error('[VerifyPolicy] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ──────────────────────────────────────────────────────────────
// GET /api/whatsapp/policies (admin — list all policies)
// ──────────────────────────────────────────────────────────────
router.get('/policies', async (req: Request, res: Response) => {
  try {
    const policies = await prisma.insurancePolicy.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.status(200).json({ success: true, data: policies });
  } catch (err) {
    logger.error('[Policies] Error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
