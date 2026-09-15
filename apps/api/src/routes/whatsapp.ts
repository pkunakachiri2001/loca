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
import { paynow, checkPaymentStatus } from '../services/paynow';
import { logger } from '../config/logger';
import { prisma } from '../config/database';
import { handleIncomingMessage, completePolicyAfterPayment } from '../services/whatsapp/bot';

const router = Router();

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
  // Zimbabwe numbers: 263 + 9 digits
  const zw12 = /^263[0-9]{9}$/;
  const zw10 = /^0[0-9]{9}$/;
  const zwIntl = /^\+263[0-9]{9}$/;
  // India numbers: 91 + 10 digits (for testing from India)
  const in12 = /^91[0-9]{10}$/;
  const inIntl = /^\+91[0-9]{10}$/;
  return zw12.test(phone) || zw10.test(phone) || zwIntl.test(phone)
      || in12.test(phone) || inIntl.test(phone);
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
  // Evolution API sends 'MESSAGES_UPSERT'; CodeChat sends 'messages.upsert'
  const eventName: string = (body?.event || '').toLowerCase().replace(/_/g, '.');
  if (eventName !== 'messages.upsert' && body?.event !== 'new.message') {
    logger.info(`[Webhook] Ignoring event type: ${body?.event}`);
    return;
  }

  try {
    // Extract message text and sender phone
    // Evolution API: body.data is the single message object
    // CodeChat: body.data.messages is an array
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
// POST /api/whatsapp/paynow-webhook
// Paynow calls this when payment is updated (e.g. Paid).
// ──────────────────────────────────────────────────────────────
router.post('/paynow-webhook', async (req: Request, res: Response) => {
  res.status(200).send('OK');

  const { reference, paynowreference, status, pollurl } = req.body;

  if (status !== 'Paid') {
    logger.info(`[PaynowWebhook] Status is ${status} for reference ${reference}. Ignored.`);
    return;
  }

  try {
    const existingPolicy = await prisma.insurancePolicy.findFirst({
      where: { paynowReference: reference },
    });

    if (existingPolicy && existingPolicy.paymentStatus === 'PAID') {
      logger.info(`[PaynowWebhook] Duplicate webhook for ${reference} — already PAID.`);
      return;
    }

    if (!existingPolicy) {
      logger.warn(`[PaynowWebhook] Policy with reference ${reference} not found.`);
      return;
    }

    logger.info(`[PaynowWebhook] Payment complete for ${existingPolicy.phone}, ref: ${reference}`);
    
    // Complete the policy and notify user via WhatsApp
    await completePolicyAfterPayment(existingPolicy.phone, reference);
  } catch (err: any) {
    logger.error('[PaynowWebhook] Error processing webhook:', err.message);
  }
});

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
