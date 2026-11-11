import { Router, Request, Response, NextFunction } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { verifyAccessToken } from '../config/jwt';
import { ApiError } from '../middleware/errorHandler';
import { sendImage } from '../services/whatsapp/sender';
import { assessTransitVehicleLandedCost } from '../services/valuation/transitCalculator';

const router = Router();

const UNDERWRITER_POLICY_SELECT = {
  id: true,
  policyRef: true,
  phone: true,
  ownerName: true,
  idNumber: true,
  vehicleReg: true,
  vehicleType: true,
  coverageType: true,
  premium: true,
  currency: true,
  paymentStatus: true,
  paynowReference: true,
  nearestBranch: true,
  deliveryType: true,
  deliveryAddress: true,
  qrCodeUrl: true,
  issuedAt: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

type PartnerOrg = 'ZIMNAT' | 'ZIMRA' | 'ALL';

function extractOptionalUserId(req: Request): string | null {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    const decoded = verifyAccessToken(auth.slice(7));
    return decoded?.userId || null;
  } catch {
    return null;
  }
}

function resolvePartnerOrg(user?: { email?: string; role?: string }): PartnerOrg {
  if (user?.role === 'ADMIN') return 'ALL';
  if (user?.email?.toLowerCase().includes('zimra')) return 'ZIMRA';
  return 'ZIMNAT';
}

function assertPolicyOrgAccess(partnerOrg: PartnerOrg, policy: { nearestBranch?: string | null; deliveryAddress?: string | null }): void {
  if (partnerOrg === 'ALL') return;
  const branch = (policy.nearestBranch || '').toUpperCase();
  if (partnerOrg === 'ZIMRA') {
    const isImport = (policy.deliveryAddress || '').includes('PRE-ARRIVAL') || branch.includes('ZIMRA');
    if (!isImport) {
      throw new ApiError(403, 'Forbidden: Policy is outside your ZIMRA border customs scope.');
    }
    return;
  }
  if (branch === 'ZIMRA') {
    throw new ApiError(403, 'Forbidden: Policy belongs to another partner organization.');
  }
}

function maskIdNumber(value?: string | null): string {
  if (!value || value === 'PRE-ARRIVAL-KYC') return value || 'PRE-ARRIVAL-KYC';
  if (value.length <= 4) return '****';
  return `${value.slice(0, 2)}****${value.slice(-3)}`;
}

function formatUnderwriterPolicy(policy: any) {
  const rawAddress: string = policy.deliveryAddress || '';
  const cleanedAddress = rawAddress.replace(/\s*\|\s*OwnerId:[^\s|]+/i, '').trim() || null;
  const isPreArrival = rawAddress.startsWith('PRE-ARRIVAL') || (policy.vehicleReg || '').startsWith('PRE-');

  const portMatch = cleanedAddress?.match(/Port:\s*([^|]+)/i);
  const etaMatch = cleanedAddress?.match(/ETA:\s*([^|]+)/i);
  const cifMatch = cleanedAddress?.match(/CIF:\s*\$?([\d,]+)/i);

  return {
    ...policy,
    idNumber: maskIdNumber(policy.idNumber),
    deliveryAddress: cleanedAddress,
    isPreArrival,
    preArrivalMeta: isPreArrival
      ? {
          portOfDischarge: portMatch?.[1]?.trim() || 'Dar es Salaam',
          expectedArrivalDate: etaMatch?.[1]?.trim() || 'Pending',
          vehicleValueUsd: cifMatch ? Number(cifMatch[1].replace(/,/g, '')) : null,
        }
      : null,
  };
}

// ──────────────────────────────────────────────
// GET /api/insurance/my-policies
// Strictly scoped policy list for signed-in individuals / simple dealers
// ──────────────────────────────────────────────
router.get(
  '/my-policies',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUser = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, phone: true },
      });

      const ownershipFilters: any[] = [
        { deliveryAddress: { contains: `OwnerId:${req.user!.id}` } },
      ];
      if (currentUser?.phone) {
        ownershipFilters.push({ phone: currentUser.phone });
      }

      const policies = await prisma.insurancePolicy.findMany({
        where: { OR: ownershipFilters },
        select: UNDERWRITER_POLICY_SELECT,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        data: policies.map(formatUnderwriterPolicy),
      });
    } catch (error) {
      next(error);
    }
  }
);

// ──────────────────────────────────────────────
// GET /api/insurance
// Fetch scoped insurance policies (For Admin / Verified Insurer Partners only)
// ──────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'INSURANCE_AGENT'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const partnerOrg = resolvePartnerOrg(req.user);
      const statusFilter = (req.query.status as string | undefined)?.toUpperCase();
      const typeFilter = (req.query.type as string | undefined)?.toUpperCase();
      const search = (req.query.q as string | undefined)?.trim();

      const andFilters: any[] = [];

      // Tenant / Partner scoping (insurers never query company fleet margins or other partners' private entries)
      if (partnerOrg === 'ZIMRA') {
        andFilters.push({
          OR: [
            { nearestBranch: 'ZIMRA' },
            { deliveryAddress: { contains: 'PRE-ARRIVAL' } },
            { vehicleReg: { startsWith: 'PRE-' } },
          ],
        });
      } else if (partnerOrg === 'ZIMNAT') {
        andFilters.push({
          OR: [
            { nearestBranch: null },
            { nearestBranch: { not: 'ZIMRA' } },
          ],
        });
      }

      if (statusFilter === 'ISSUED') {
        andFilters.push({ issuedAt: { not: null } });
      } else if (statusFilter === 'PAID') {
        andFilters.push({ paymentStatus: 'PAID', issuedAt: null });
      } else if (statusFilter === 'PENDING') {
        andFilters.push({ paymentStatus: 'PENDING' });
      }

      if (typeFilter === 'PRE_ARRIVAL') {
        andFilters.push({
          OR: [
            { vehicleReg: { startsWith: 'PRE-' } },
            { deliveryAddress: { contains: 'PRE-ARRIVAL' } },
          ],
        });
      } else if (typeFilter === 'REGISTERED') {
        andFilters.push({
          NOT: {
            OR: [
              { vehicleReg: { startsWith: 'PRE-' } },
              { deliveryAddress: { contains: 'PRE-ARRIVAL' } },
            ],
          },
        });
      }

      if (search) {
        andFilters.push({
          OR: [
            { ownerName: { contains: search, mode: 'insensitive' } },
            { vehicleReg: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { policyRef: { contains: search, mode: 'insensitive' } },
          ],
        });
      }

      const policies = await prisma.insurancePolicy.findMany({
        where: andFilters.length > 0 ? { AND: andFilters } : undefined,
        select: UNDERWRITER_POLICY_SELECT,
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        success: true,
        partnerOrg,
        data: policies.map(formatUnderwriterPolicy),
      });
    } catch (error) {
      next(error);
    }
  }
);

// ──────────────────────────────────────────────
// POST /api/insurance/quote
// Calculate insurance premium (supports standard reg-plate & pre-arrival imports)
// ──────────────────────────────────────────────
router.post('/quote', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      vehicleType,
      coverageType = 'THIRD_PARTY',
      isPreArrival,
      vehicleValueUsd,
      yearOfManufacture,
      make,
      model,
    } = req.body;

    if (isPreArrival || vehicleValueUsd !== undefined) {
      const cif = Math.max(500, Number(vehicleValueUsd) || 10000);
      const year = Number(yearOfManufacture) || 2021;
      const thirdPartyAnnualUsd = 120;
      const comprehensiveAnnualUsd = Math.max(220, Math.round(cif * 0.0128));
      const selectedPremium =
        coverageType === 'COMPREHENSIVE' ? comprehensiveAnnualUsd : thirdPartyAnnualUsd;

      const assessment = await assessTransitVehicleLandedCost({
        totalCifUsd: cif,
        yearOfManufacture: year,
        make: make || 'Toyota',
        model: model || 'Import',
      });

      res.json({
        success: true,
        data: {
          premium: selectedPremium,
          thirdPartyAnnualUsd,
          comprehensiveAnnualUsd,
          estimatedDutyUsd: assessment.customsDutyUsd,
          estimatedSurtaxUsd: assessment.surtaxUsd,
          estimatedVatUsd: assessment.vatUsd,
          totalEstimatedDutyUsd: assessment.totalZimraTaxesUsd,
          totalLandedCostUsd: assessment.totalLandedCostUsd,
          currency: 'USD',
        },
      });
      return;
    }

    // Standard pricing logic mirroring the WhatsApp bot for local registered vehicles
    let basePrice = 30; // 1 term (4 months) base
    if (vehicleType === 'Truck' || vehicleType === 'Bus') basePrice += 40;
    if (coverageType === 'COMPREHENSIVE') basePrice += 150;

    res.json({
      success: true,
      data: { premium: basePrice, currency: 'USD' },
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
    const {
      phone,
      ownerName,
      idNumber,
      vehicleReg,
      vehicleType,
      coverageType,
      premium,
      isPreArrival,
      vin,
      make,
      yearOfManufacture,
      portOfDischarge,
      expectedArrivalDate,
      vehicleValueUsd,
      insurerCode,
      deliveryType,
      deliveryAddress,
    } = req.body;

    const resolvedReg =
      vehicleReg ||
      vin ||
      (isPreArrival ? `PRE-${(make || 'IMP').toUpperCase()}-${yearOfManufacture || '2026'}` : '');
    const resolvedId = idNumber || (isPreArrival ? 'PRE-ARRIVAL-KYC' : '');

    if (!phone || !ownerName || !resolvedReg || !resolvedId) {
      throw new ApiError(400, 'Missing required fields');
    }

    const authUserId = extractOptionalUserId(req);
    const ownerTag = authUserId ? ` | OwnerId:${authUserId}` : '';
    const resolvedAddress = isPreArrival
      ? `PRE-ARRIVAL | Port: ${portOfDischarge || 'Dar es Salaam'} | ETA: ${expectedArrivalDate || 'Pending'} | CIF: $${Number(vehicleValueUsd) || 0}${ownerTag}`
      : deliveryAddress
      ? `${deliveryAddress}${ownerTag}`
      : authUserId
      ? `OwnerId:${authUserId}`
      : null;

    // Generate Paynow reference
    const paynowReference = `INS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const policy = await prisma.insurancePolicy.create({
      data: {
        phone,
        ownerName,
        idNumber: resolvedId,
        vehicleReg: resolvedReg,
        vehicleType: vehicleType || `${yearOfManufacture || ''} ${make || 'Import'}`.trim(),
        coverageType: coverageType || 'THIRD_PARTY',
        premium: Number(premium),
        paynowReference,
        paymentStatus: 'PENDING',
        nearestBranch: (insurerCode || 'ZIMNAT').toUpperCase(),
        deliveryType: deliveryType || (isPreArrival ? 'DIGITAL_IMPORT_COVER' : 'DIGITAL'),
        deliveryAddress: resolvedAddress,
      },
    });

    // In a real scenario, integrate Paynow here.
    // For MOCK mode, we return a mock redirect URL:
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/mock-pay?ref=${paynowReference}&type=insurance`;

    res.json({
      success: true,
      message: 'Policy created. Proceed to payment.',
      data: {
        policyId: policy.id,
        paynowReference,
        paymentUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────
// POST /api/insurance/:id/confirm-payment
// Confirm payment / reconcile Paynow settlement by Underwriter or Admin
// ──────────────────────────────────────────────
router.post(
  '/:id/confirm-payment',
  authenticate,
  authorize('ADMIN', 'INSURANCE_AGENT'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const partnerOrg = resolvePartnerOrg(req.user);
      const policy = await prisma.insurancePolicy.findUnique({ where: { id } });

      if (!policy) {
        throw new ApiError(404, 'Insurance policy not found');
      }

      assertPolicyOrgAccess(partnerOrg, policy);

      const updated = await prisma.insurancePolicy.update({
        where: { id },
        data: { paymentStatus: 'PAID' },
        select: UNDERWRITER_POLICY_SELECT,
      });

      res.json({
        success: true,
        message: 'Payment confirmed. Policy is now ready to issue.',
        data: formatUnderwriterPolicy(updated),
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
      const partnerOrg = resolvePartnerOrg(req.user);
      const policy = await prisma.insurancePolicy.findUnique({ where: { id } });

      if (!policy) {
        throw new ApiError(404, 'Insurance policy not found');
      }

      assertPolicyOrgAccess(partnerOrg, policy);

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
        },
        select: UNDERWRITER_POLICY_SELECT,
      });

      res.json({
        success: true,
        message: 'Policy issued successfully. A copy has been sent to the customer via WhatsApp.',
        data: formatUnderwriterPolicy(updated),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
