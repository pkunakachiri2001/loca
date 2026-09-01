/**
 * FAMBA WhatsApp Bot — QR Code Generator
 *
 * Generates a QR code PNG containing the policy reference and key
 * policy details. Saves to /uploads/qrcodes/ on disk and returns
 * a public URL that can be sent via WhatsApp.
 *
 * In production, upload the PNG to Cloudinary instead and return
 * the Cloudinary URL.
 */

import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { logger } from '../../config/logger';

const QR_DIR = path.join(process.cwd(), 'uploads', 'qrcodes');

// Ensure directory exists at startup
if (!fs.existsSync(QR_DIR)) {
  fs.mkdirSync(QR_DIR, { recursive: true });
}

export interface PolicyQRPayload {
  policyRef: string;
  ownerName: string;
  vehicleReg: string;
  coverageType: string;
  issuedAt: string;
  verifyUrl: string; // URL staff scan to verify policy
}

/**
 * Generates a QR code PNG and returns the public URL to serve it.
 * The QR encodes a JSON string with key policy fields.
 */
export async function generatePolicyQR(
  payload: PolicyQRPayload,
): Promise<{ localPath: string; publicUrl: string; qrData: string }> {
  const qrData = JSON.stringify({
    ref: payload.policyRef,
    name: payload.ownerName,
    reg: payload.vehicleReg,
    cover: payload.coverageType,
    issued: payload.issuedAt,
    verify: payload.verifyUrl,
  });

  const filename = `policy-${payload.policyRef}.png`;
  const localPath = path.join(QR_DIR, filename);

  try {
    await QRCode.toFile(localPath, qrData, {
      type: 'png',
      width: 400,
      margin: 2,
      color: {
        dark: '#1a1a2e',  // deep navy — matches FAMBA branding
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H', // highest — still readable if partially obscured
    });

    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const publicUrl = `${apiUrl}/uploads/qrcodes/${filename}`;

    logger.info(`[QRCode] Generated for policy ${payload.policyRef}: ${publicUrl}`);
    return { localPath, publicUrl, qrData };
  } catch (err) {
    logger.error(`[QRCode] Generation failed for ${payload.policyRef}:`, err);
    throw err;
  }
}
