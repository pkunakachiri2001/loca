/**
 * FAMBA WhatsApp Bot — CodeChat Sender
 * Sends messages via a self-hosted CodeChat (WhiskeySockets/Baileys) instance.
 *
 * Docs: https://github.com/code-chat-br/whatsapp-api
 *
 * ENV VARS REQUIRED:
 *   CODECHAT_URL        — e.g. http://localhost:8083
 *   CODECHAT_API_KEY    — your CodeChat global API key
 *   CODECHAT_INSTANCE   — instance name you created in CodeChat
 */

import axios from 'axios';
import { logger } from '../../config/logger';

const BASE_URL = process.env.CODECHAT_URL || 'http://localhost:8083';
const API_KEY  = process.env.CODECHAT_API_KEY || '';
const INSTANCE = process.env.CODECHAT_INSTANCE || 'famba';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    apikey: API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
});

// ─── Normalise phone number ────────────────────────────────────────────────
// CodeChat expects the number without +, e.g. 263771234567
export function normalisePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

// ─── Send plain text ──────────────────────────────────────────────────────
export async function sendText(to: string, text: string): Promise<void> {
  const phone = normalisePhone(to);
  try {
    await client.post(`/message/sendText/${INSTANCE}`, {
      number: phone,
      textMessage: { text },
    });
  } catch (err: any) {
    logger.error(`[WhatsApp] sendText failed to ${phone}:`, err?.response?.data || err.message);
    throw err;
  }
}

// ─── Send image (used for QR code) ───────────────────────────────────────
export async function sendImage(
  to: string,
  imageUrl: string,
  caption?: string,
): Promise<void> {
  const phone = normalisePhone(to);
  try {
    await client.post(`/message/sendMedia/${INSTANCE}`, {
      number: phone,
      mediaMessage: {
        mediatype: 'image',
        media: imageUrl,
        caption: caption || '',
      },
    });
  } catch (err: any) {
    logger.error(`[WhatsApp] sendImage failed to ${phone}:`, err?.response?.data || err.message);
    throw err;
  }
}

// ─── Send numbered list as text (WhatsApp formatting) ────────────────────
// CodeChat free-tier doesn't expose interactive list buttons,
// so we format a clean numbered menu as a text message.
export async function sendMenu(
  to: string,
  header: string,
  items: { number: number; label: string; description?: string }[],
  footer?: string,
): Promise<void> {
  const lines: string[] = [`*${header}*`, ''];
  for (const item of items) {
    lines.push(`*${item.number}.* ${item.label}`);
    if (item.description) lines.push(`   _${item.description}_`);
  }
  if (footer) {
    lines.push('');
    lines.push(`_${footer}_`);
  }
  await sendText(to, lines.join('\n'));
}
