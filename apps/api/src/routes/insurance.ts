import { Router, Request, Response, NextFunction } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { sendText, sendImage } from '../services/whatsapp/sender';

const router = Router();

// ──────────────────────────────────────────────
// GET /api/insurance
// Fetch all insurance policies (For Admin / Insurance Agents)
// ──────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'INSURANCE_AGENT'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const policies = await prisma.insurancePolicy.findMany({
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: policies,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ──────────────────────────────────────────────
// POST /api/insurance/:id/issue
// Generate and send policy copy via WhatsApp
// ──────────────────────────────────────────────
router.post(
  '/:id/issue',
  authenticate,
  authorize('ADMIN', 'INSURANCE_AGENT'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const policy = await prisma.insurancePolicy.findUnique({ where: { id } });

      if (!policy) {
        throw new ApiError(404, 'Insurance policy not found');
      }

      if (policy.paymentStatus !== 'PAID') {
        throw new ApiError(400, 'Cannot issue policy because payment is not completed.');
      }

      // Generate the digital copy (QR Code) for the policy
      const qrData = `FAMBA-INSURANCE\nRef: ${policy.policyRef}\nReg: ${policy.vehicleReg}\nOwner: ${policy.ownerName}\nCoverage: ${policy.coverageType}\nValid until: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}`;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData);

      // Send the copy to the customer's WhatsApp
      const receiptMsg = `✅ *Official Famba Insurance Policy*\n\nHi ${policy.ownerName}, your ${policy.coverageType.replace('_', ' ')} insurance for vehicle *${policy.vehicleReg}* has been officially issued by the agent!\n\nHere is your digital policy copy (QR Code). You can show this to authorities.`;
      
      try {
        await sendImage(policy.phone, receiptMsg, qrCodeDataUrl);
      } catch (err) {
        console.error('Failed to send WhatsApp message to', policy.phone, err);
        // Continue to save it even if WhatsApp fails, maybe they don't have WhatsApp on that number
      }
      
      const updated = await prisma.insurancePolicy.update({
        where: { id },
        data: {
          issuedAt: new Date(),
          expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          qrCodeData: qrData,
          qrCodeUrl: qrCodeDataUrl,
        }
      });

      res.json({
        success: true,
        message: 'Policy issued successfully. A copy has been sent to the customer via WhatsApp.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
