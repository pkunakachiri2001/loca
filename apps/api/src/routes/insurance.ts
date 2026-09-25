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
// POST /api/insurance/quote
// Calculate insurance premium
// ──────────────────────────────────────────────
router.post('/quote', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { vehicleType, coverageType } = req.body;
    
    // Simple pricing logic mirroring the WhatsApp bot
    let basePrice = 30; // 1 term (4 months) base
    if (vehicleType === 'Truck' || vehicleType === 'Bus') basePrice += 40;
    if (coverageType === 'COMPREHENSIVE') basePrice += 150;

    res.json({
      success: true,
      data: { premium: basePrice, currency: 'USD' }
    });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────
// POST /api/insurance/buy
// Submit insurance details and get Paynow payment link
// ──────────────────────────────────────────────
router.post('/buy', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, ownerName, idNumber, vehicleReg, vehicleType, coverageType, premium } = req.body;

    if (!phone || !ownerName || !vehicleReg || !idNumber) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Generate Paynow reference
    const paynowReference = `INS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const policy = await prisma.insurancePolicy.create({
      data: {
        phone,
        ownerName,
        idNumber,
        vehicleReg,
        vehicleType,
        coverageType,
        premium: Number(premium),
        paynowReference,
        paymentStatus: 'PENDING'
      }
    });

    // In a real scenario, integrate Paynow here. 
    // For MOCK mode, we return a mock redirect URL:
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/mock-pay?ref=${paynowReference}&type=insurance`;

    res.json({
      success: true,
      message: 'Policy created. Proceed to payment.',
      data: {
        policyId: policy.id,
        paymentUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

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
