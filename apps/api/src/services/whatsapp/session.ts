/**
 * FAMBA WhatsApp Bot — Session Manager
 *
 * Uses the Prisma DB (InsuranceSession model) to persist conversation
 * state across server restarts. No Redis dependency needed.
 *
 * Each phone number gets one active session. When a policy is issued
 * (state = DONE), the session is cleared automatically.
 */

import { prisma } from '../../config/database';
import { logger } from '../../config/logger';

export interface SessionData {
  // Collected during conversation
  ownerName?: string;
  idNumber?: string;
  vehicleReg?: string;
  vehicleType?: string;
  coverageType?: string;
  phone?: string;
  // Quote & payment
  quotedPremium?: number;
  stripeSessionId?: string;
  policyId?: string;
  // Delivery preference
  deliveryType?: 'SELF_COLLECT' | 'BIKER';
  deliveryAddress?: string;
  nearestBranch?: string;
}

export interface BotSession {
  phone: string;
  state: string;
  data: SessionData;
}

// ─── Get session (creates one if first contact) ────────────────────────────
export async function getSession(phone: string): Promise<BotSession> {
  try {
    const existing = await prisma.insuranceSession.findUnique({
      where: { phone },
    });

    if (existing) {
      return {
        phone: existing.phone,
        state: existing.state,
        data: (existing.data as SessionData) || {},
      };
    }

    // First time this number contacts the bot
    const created = await prisma.insuranceSession.create({
      data: {
        phone,
        state: 'WELCOME',
        data: {},
      },
    });

    return { phone: created.phone, state: created.state, data: {} };
  } catch (err) {
    logger.error(`[Session] getSession error for ${phone}:`, err);
    return { phone, state: 'WELCOME', data: {} };
  }
}

// ─── Save / advance session state ─────────────────────────────────────────
export async function saveSession(
  phone: string,
  state: string,
  data: SessionData,
): Promise<void> {
  try {
    await prisma.insuranceSession.upsert({
      where: { phone },
      update: { state, data: data as any },
      create: { phone, state, data: data as any },
    });
  } catch (err) {
    logger.error(`[Session] saveSession error for ${phone}:`, err);
  }
}

// ─── Clear session (after policy issued or user resets) ────────────────────
export async function clearSession(phone: string): Promise<void> {
  try {
    await prisma.insuranceSession.deleteMany({ where: { phone } });
  } catch (err) {
    logger.error(`[Session] clearSession error for ${phone}:`, err);
  }
}
