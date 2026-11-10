/**
 * Famba — Car Dealer In-Transit CRM Routes
 * Enables automotive dealers to track vehicles in transit from overseas (Japan, UK, SA, UAE),
 * manage advance ZIMRA customs documentation, calculate duty & landed valuations,
 * and publish arriving-soon inventory directly to the marketplace.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import { assessTransitVehicleLandedCost } from '../services/valuation/transitCalculator';
import QRCode from 'qrcode';

const router = Router();

// Helper to resolve company for authenticated user
async function getDealerCompany(userId: string) {
  const company = await prisma.company.findUnique({
    where: { ownerId: userId },
  });
  if (!company) {
    throw new ApiError(404, 'Dealer company profile not found. Please register your company first.');
  }
  return company;
}

// ──────────────────────────────────────────────
// POST /api/transit/assess-duty
// Live Interactive ZIMRA Duty & Landed Valuation Pre-Calculator
// ──────────────────────────────────────────────
router.post('/assess-duty', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      totalCifUsd,
      yearOfManufacture,
      engineCapacityCc,
      fuelType,
      make,
      model,
      variant,
      mileage,
      transmission,
      targetSellingPriceUsd,
    } = req.body;

    if (!totalCifUsd || !yearOfManufacture || !make || !model) {
      throw new ApiError(400, 'Total CIF, Year of Manufacture, Make, and Model are required.');
    }

    const assessment = await assessTransitVehicleLandedCost({
      totalCifUsd: Number(totalCifUsd),
      yearOfManufacture: Number(yearOfManufacture),
      engineCapacityCc: engineCapacityCc ? Number(engineCapacityCc) : undefined,
      fuelType,
      make,
      model,
      variant,
      mileage: mileage ? Number(mileage) : undefined,
      transmission,
      targetSellingPriceUsd: targetSellingPriceUsd ? Number(targetSellingPriceUsd) : undefined,
    });

    res.json({ success: true, data: assessment });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// GET /api/transit/stats/overview
// CRM Dashboard Summary Metrics for the Dealer
// ──────────────────────────────────────────────
router.get('/stats/overview', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await getDealerCompany(req.user!.id);

    const vehicles = await prisma.transitVehicle.findMany({
      where: { companyId: company.id },
      select: {
        id: true,
        status: true,
        totalCifUsd: true,
        projectedDutyUsd: true,
        projectedSurtaxUsd: true,
        projectedVatUsd: true,
        projectedTotalLandedCostUsd: true,
        projectedMarketValueUsd: true,
        borderPost: true,
        portOfDischarge: true,
        countryOfOrigin: true,
        deliveryEta: true,
        borderEta: true,
      },
    });

    const totalVehicles = vehicles.length;
    let totalCifInvested = 0;
    let totalProjectedTaxes = 0;
    let totalProjectedMarketValue = 0;

    const byStatus: Record<string, number> = {
      PURCHASED: 0,
      ON_VESSEL: 0,
      ARRIVED_PORT: 0,
      INLAND_TRANSIT: 0,
      AT_BORDER: 0,
      CUSTOMS_CLEARING: 0,
      CLEARED_DELIVERED: 0,
      AVAILABLE_FOR_SALE: 0,
      SOLD: 0,
    };

    const byOrigin: Record<string, number> = {};
    const byBorder: Record<string, number> = {};

    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 86400000);
    let arrivingNext7Days = 0;

    for (const v of vehicles) {
      totalCifInvested += v.totalCifUsd || 0;
      totalProjectedTaxes += (v.projectedDutyUsd || 0) + (v.projectedSurtaxUsd || 0) + (v.projectedVatUsd || 0);
      totalProjectedMarketValue += v.projectedMarketValueUsd || 0;

      if (byStatus[v.status] !== undefined) {
        byStatus[v.status]++;
      } else {
        byStatus[v.status] = 1;
      }

      const origin = v.countryOfOrigin || 'Unknown';
      byOrigin[origin] = (byOrigin[origin] || 0) + 1;

      const border = v.borderPost || 'Unknown';
      byBorder[border] = (byBorder[border] || 0) + 1;

      if (v.deliveryEta && new Date(v.deliveryEta) <= next7Days && v.status !== 'AVAILABLE_FOR_SALE' && v.status !== 'SOLD') {
        arrivingNext7Days++;
      }
    }

    const projectedPortfolioMargin = totalProjectedMarketValue - (totalCifInvested + totalProjectedTaxes);

    res.json({
      success: true,
      data: {
        totalVehicles,
        totalCifInvested,
        totalProjectedTaxes,
        totalProjectedMarketValue,
        projectedPortfolioMargin,
        arrivingNext7Days,
        byStatus,
        byOrigin,
        byBorder,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// GET /api/transit
// List All In-Transit Vehicles with Filters & Pagination
// ──────────────────────────────────────────────
router.get('/', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await getDealerCompany(req.user!.id);
    const {
      status,
      borderPost,
      portOfDischarge,
      countryOfOrigin,
      q,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      companyId: company.id,
      ...(status && { status }),
      ...(borderPost && { borderPost }),
      ...(portOfDischarge && { portOfDischarge }),
      ...(countryOfOrigin && { countryOfOrigin: { contains: countryOfOrigin, mode: 'insensitive' } }),
      ...(q && {
        OR: [
          { vin: { contains: q, mode: 'insensitive' } },
          { make: { contains: q, mode: 'insensitive' } },
          { model: { contains: q, mode: 'insensitive' } },
          { supplierName: { contains: q, mode: 'insensitive' } },
          { billOfLadingNumber: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, vehicles] = await Promise.all([
      prisma.transitVehicle.count({ where }),
      prisma.transitVehicle.findMany({
        where,
        include: {
          documents: { select: { id: true, type: true, title: true, verificationStatus: true, fileUrl: true } },
          events: { orderBy: { createdAt: 'desc' }, take: 3 },
          publicListing: { select: { id: true, slug: true, status: true } },
        },
        orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/transit
// Create New In-Transit Vehicle Record
// ──────────────────────────────────────────────
router.post('/', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await getDealerCompany(req.user!.id);
    const {
      vin,
      make,
      model,
      variant,
      yearOfManufacture,
      monthOfManufacture,
      engineCapacityCc,
      fuelType = 'PETROL',
      transmission = 'AUTOMATIC',
      mileage = 0,
      color,
      exteriorGrade,
      interiorGrade,
      countryOfOrigin,
      supplierName,
      supplierInvoiceNumber,
      fobPriceUsd = 0,
      freightCostUsd = 0,
      insuranceCostUsd = 0,
      totalCifUsd,
      portOfDischarge = 'DURBAN',
      vesselName,
      voyageNumber,
      billOfLadingNumber,
      containerNumber,
      carrierCompany,
      borderPost = 'BEITBRIDGE',
      destinationCity = 'Harare',
      destinationWarehouse,
      purchaseDate,
      departureDate,
      portEta,
      borderEta,
      deliveryEta,
      clearingAgentName,
      clearingAgentPhone,
      clearingBondNumber,
      zimraAssessmentNumber,
      status = 'PURCHASED',
      targetSellingPriceUsd,
      notes,
    } = req.body;

    if (!vin || !make || !model || !yearOfManufacture || !countryOfOrigin) {
      throw new ApiError(400, 'VIN, Make, Model, Year of Manufacture, and Country of Origin are required.');
    }

    // Calculate or verify CIF
    const calculatedCif = Number(totalCifUsd) || (Number(fobPriceUsd) + Number(freightCostUsd) + Number(insuranceCostUsd));

    // Run ZIMRA Landed Cost & Valuation Assessment
    const assessment = await assessTransitVehicleLandedCost({
      totalCifUsd: calculatedCif,
      yearOfManufacture: Number(yearOfManufacture),
      engineCapacityCc: engineCapacityCc ? Number(engineCapacityCc) : undefined,
      fuelType,
      make,
      model,
      variant,
      mileage: Number(mileage),
      transmission,
      targetSellingPriceUsd: targetSellingPriceUsd ? Number(targetSellingPriceUsd) : undefined,
    });

    const vehicle = await prisma.transitVehicle.create({
      data: {
        companyId: company.id,
        vin: vin.trim().toUpperCase(),
        make: make.trim(),
        model: model.trim(),
        variant: variant ? variant.trim() : null,
        yearOfManufacture: Number(yearOfManufacture),
        monthOfManufacture: monthOfManufacture ? Number(monthOfManufacture) : null,
        engineCapacityCc: engineCapacityCc ? Number(engineCapacityCc) : null,
        fuelType,
        transmission,
        mileage: Number(mileage),
        color,
        exteriorGrade,
        interiorGrade,
        countryOfOrigin,
        supplierName,
        supplierInvoiceNumber,
        fobPriceUsd: Number(fobPriceUsd),
        freightCostUsd: Number(freightCostUsd),
        insuranceCostUsd: Number(insuranceCostUsd),
        totalCifUsd: calculatedCif,
        portOfDischarge,
        vesselName,
        voyageNumber,
        billOfLadingNumber,
        containerNumber,
        carrierCompany,
        borderPost,
        destinationCity,
        destinationWarehouse,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        departureDate: departureDate ? new Date(departureDate) : null,
        portEta: portEta ? new Date(portEta) : null,
        borderEta: borderEta ? new Date(borderEta) : null,
        deliveryEta: deliveryEta ? new Date(deliveryEta) : null,
        projectedDutyUsd: assessment.customsDutyUsd,
        projectedSurtaxUsd: assessment.surtaxUsd,
        projectedVatUsd: assessment.vatUsd,
        projectedTotalLandedCostUsd: assessment.totalLandedCostUsd,
        projectedMarketValueUsd: assessment.projectedMarketValueUsd,
        projectedLowValueUsd: assessment.projectedLowValueUsd,
        projectedHighValueUsd: assessment.projectedHighValueUsd,
        targetSellingPriceUsd: targetSellingPriceUsd ? Number(targetSellingPriceUsd) : assessment.projectedMarketValueUsd,
        projectedMarginUsd: assessment.projectedMarginUsd,
        clearingAgentName,
        clearingAgentPhone,
        clearingBondNumber,
        zimraAssessmentNumber,
        status,
        notes,
        events: {
          create: {
            status,
            location: countryOfOrigin,
            note: `Vehicle logged into transit CRM by dealer. Initial CIF: $${calculatedCif.toLocaleString()} USD.`,
          },
        },
      },
      include: {
        documents: true,
        events: true,
      },
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// GET /api/transit/:id
// Get Transit Vehicle Details
// ──────────────────────────────────────────────
router.get('/:id', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await getDealerCompany(req.user!.id);
    const vehicle = await prisma.transitVehicle.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.role === 'ADMIN' ? undefined : company.id,
      },
      include: {
        documents: { orderBy: { createdAt: 'desc' } },
        events: { orderBy: { createdAt: 'desc' } },
        publicListing: {
          include: {
            images: { orderBy: { order: 'asc' } },
          },
        },
        company: {
          select: { id: true, name: true, phone: true, email: true, logo: true, slug: true },
        },
      },
    });

    if (!vehicle) {
      throw new ApiError(404, 'Transit vehicle not found.');
    }

    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// PATCH /api/transit/:id
// Update Details or Advance Transit Lifecycle
// ──────────────────────────────────────────────
router.patch('/:id', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await getDealerCompany(req.user!.id);
    const existing = await prisma.transitVehicle.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.role === 'ADMIN' ? undefined : company.id,
      },
    });

    if (!existing) {
      throw new ApiError(404, 'Transit vehicle not found.');
    }

    const {
      status,
      eventLocation,
      eventNote,
      totalCifUsd,
      fobPriceUsd,
      freightCostUsd,
      insuranceCostUsd,
      departureDate,
      portEta,
      borderEta,
      deliveryEta,
      clearingAgentName,
      clearingAgentPhone,
      clearingBondNumber,
      zimraAssessmentNumber,
      targetSellingPriceUsd,
      notes,
      vesselName,
      voyageNumber,
      billOfLadingNumber,
      containerNumber,
      carrierCompany,
      borderPost,
      portOfDischarge,
    } = req.body;

    const dataToUpdate: any = {};

    if (departureDate !== undefined) dataToUpdate.departureDate = departureDate ? new Date(departureDate) : null;
    if (portEta !== undefined) dataToUpdate.portEta = portEta ? new Date(portEta) : null;
    if (borderEta !== undefined) dataToUpdate.borderEta = borderEta ? new Date(borderEta) : null;
    if (deliveryEta !== undefined) dataToUpdate.deliveryEta = deliveryEta ? new Date(deliveryEta) : null;

    if (clearingAgentName !== undefined) dataToUpdate.clearingAgentName = clearingAgentName;
    if (clearingAgentPhone !== undefined) dataToUpdate.clearingAgentPhone = clearingAgentPhone;
    if (clearingBondNumber !== undefined) dataToUpdate.clearingBondNumber = clearingBondNumber;
    if (zimraAssessmentNumber !== undefined) dataToUpdate.zimraAssessmentNumber = zimraAssessmentNumber;
    if (vesselName !== undefined) dataToUpdate.vesselName = vesselName;
    if (voyageNumber !== undefined) dataToUpdate.voyageNumber = voyageNumber;
    if (billOfLadingNumber !== undefined) dataToUpdate.billOfLadingNumber = billOfLadingNumber;
    if (containerNumber !== undefined) dataToUpdate.containerNumber = containerNumber;
    if (carrierCompany !== undefined) dataToUpdate.carrierCompany = carrierCompany;
    if (borderPost !== undefined) dataToUpdate.borderPost = borderPost;
    if (portOfDischarge !== undefined) dataToUpdate.portOfDischarge = portOfDischarge;
    if (notes !== undefined) dataToUpdate.notes = notes;

    // Financial updates
    let recomputeValuation = false;
    if (totalCifUsd !== undefined || fobPriceUsd !== undefined || freightCostUsd !== undefined || insuranceCostUsd !== undefined) {
      const cif = Number(totalCifUsd) || (Number(fobPriceUsd || existing.fobPriceUsd) + Number(freightCostUsd || existing.freightCostUsd) + Number(insuranceCostUsd || existing.insuranceCostUsd));
      dataToUpdate.totalCifUsd = cif;
      if (fobPriceUsd !== undefined) dataToUpdate.fobPriceUsd = Number(fobPriceUsd);
      if (freightCostUsd !== undefined) dataToUpdate.freightCostUsd = Number(freightCostUsd);
      if (insuranceCostUsd !== undefined) dataToUpdate.insuranceCostUsd = Number(insuranceCostUsd);
      recomputeValuation = true;
    }

    if (targetSellingPriceUsd !== undefined) {
      dataToUpdate.targetSellingPriceUsd = Number(targetSellingPriceUsd);
      dataToUpdate.projectedMarginUsd = Math.round(Number(targetSellingPriceUsd) - (existing.projectedTotalLandedCostUsd || 0));
    }

    // Status transition tracking
    const statusChanged = status && status !== existing.status;
    if (statusChanged) {
      dataToUpdate.status = status;
      if (status === 'CLEARED_DELIVERED' && !existing.clearedAt) {
        dataToUpdate.clearedAt = new Date();
      }
    }

    // If CIF changed, re-run landed cost & valuation
    if (recomputeValuation) {
      const assessment = await assessTransitVehicleLandedCost({
        totalCifUsd: dataToUpdate.totalCifUsd || existing.totalCifUsd,
        yearOfManufacture: existing.yearOfManufacture,
        engineCapacityCc: existing.engineCapacityCc,
        fuelType: existing.fuelType,
        make: existing.make,
        model: existing.model,
        variant: existing.variant,
        mileage: existing.mileage,
        transmission: existing.transmission,
        targetSellingPriceUsd: dataToUpdate.targetSellingPriceUsd || existing.targetSellingPriceUsd,
      });

      dataToUpdate.projectedDutyUsd = assessment.customsDutyUsd;
      dataToUpdate.projectedSurtaxUsd = assessment.surtaxUsd;
      dataToUpdate.projectedVatUsd = assessment.vatUsd;
      dataToUpdate.projectedTotalLandedCostUsd = assessment.totalLandedCostUsd;
      dataToUpdate.projectedMarketValueUsd = assessment.projectedMarketValueUsd;
      dataToUpdate.projectedLowValueUsd = assessment.projectedLowValueUsd;
      dataToUpdate.projectedHighValueUsd = assessment.projectedHighValueUsd;
      dataToUpdate.projectedMarginUsd = assessment.projectedMarginUsd;
    }

    // Execute update & log event if status changed
    const updated = await prisma.$transaction(async (tx) => {
      const v = await tx.transitVehicle.update({
        where: { id: existing.id },
        data: dataToUpdate,
      });

      if (statusChanged || eventNote) {
        await tx.transitEvent.create({
          data: {
            transitVehicleId: existing.id,
            status: status || existing.status,
            location: eventLocation || null,
            note: eventNote || `Status updated to ${status || existing.status}`,
          },
        });
      }

      return v;
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/transit/:id/documents
// Attach Advance Clearance Document
// ──────────────────────────────────────────────
router.post('/:id/documents', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await getDealerCompany(req.user!.id);
    const vehicle = await prisma.transitVehicle.findFirst({
      where: { id: req.params.id, companyId: req.user!.role === 'ADMIN' ? undefined : company.id },
    });

    if (!vehicle) throw new ApiError(404, 'Transit vehicle not found.');

    const { type, title, fileUrl, fileName, fileSize, mimeType, notes } = req.body;
    if (!type || !title || !fileUrl) {
      throw new ApiError(400, 'Document Type, Title, and File URL are required.');
    }

    const doc = await prisma.transitDocument.create({
      data: {
        transitVehicleId: vehicle.id,
        type,
        title,
        fileUrl,
        fileName,
        fileSize: fileSize ? Number(fileSize) : null,
        mimeType,
        notes,
      },
    });

    // Log event
    await prisma.transitEvent.create({
      data: {
        transitVehicleId: vehicle.id,
        status: vehicle.status,
        note: `Document added: ${title} (${type})`,
      },
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// DELETE /api/transit/:id/documents/:docId
// Remove Document
// ──────────────────────────────────────────────
router.delete('/:id/documents/:docId', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await getDealerCompany(req.user!.id);
    const vehicle = await prisma.transitVehicle.findFirst({
      where: { id: req.params.id, companyId: req.user!.role === 'ADMIN' ? undefined : company.id },
    });

    if (!vehicle) throw new ApiError(404, 'Transit vehicle not found.');

    await prisma.transitDocument.deleteMany({
      where: { id: req.params.docId, transitVehicleId: vehicle.id },
    });

    res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/transit/:id/generate-valuation
// Generate Official Pre-Arrival Valuation Certificate with QR Code
// ──────────────────────────────────────────────
router.post('/:id/generate-valuation', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await getDealerCompany(req.user!.id);
    const vehicle = await prisma.transitVehicle.findFirst({
      where: { id: req.params.id, companyId: req.user!.role === 'ADMIN' ? undefined : company.id },
    });

    if (!vehicle) throw new ApiError(404, 'Transit vehicle not found.');

    const assessment = await assessTransitVehicleLandedCost({
      totalCifUsd: vehicle.totalCifUsd,
      yearOfManufacture: vehicle.yearOfManufacture,
      engineCapacityCc: vehicle.engineCapacityCc,
      fuelType: vehicle.fuelType,
      make: vehicle.make,
      model: vehicle.model,
      variant: vehicle.variant,
      mileage: vehicle.mileage,
      transmission: vehicle.transmission,
    });

    // Reference ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const valuationRef = `ZIM-VAL-TRANSIT-${randomSuffix}`;
    const qrVerificationUrl = `https://famba.co.zw/valuation/report/${valuationRef}`;

    let qrCodeData = '';
    try {
      qrCodeData = await QRCode.toDataURL(qrVerificationUrl, {
        width: 256,
        margin: 2,
        color: { dark: '#008767', light: '#FFFFFF' },
      });
    } catch {
      qrCodeData = qrVerificationUrl;
    }

    // Persist to VehicleValuation table
    const valuation = await prisma.vehicleValuation.create({
      data: {
        valuationRef,
        vin: vehicle.vin,
        make: vehicle.make,
        model: vehicle.model,
        variant: vehicle.variant,
        yearOfManufacture: vehicle.yearOfManufacture,
        mileage: vehicle.mileage,
        condition: 'GOOD',
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        engineCapacity: vehicle.engineCapacityCc ? `${vehicle.engineCapacityCc}cc` : undefined,
        importStatus: vehicle.countryOfOrigin,
        countryOfOrigin: vehicle.countryOfOrigin,
        purpose: 'DEALER_TRANSIT_PRE_CLEARANCE',
        indicativeMarketValue: assessment.projectedMarketValueUsd,
        lowValue: assessment.projectedLowValueUsd,
        highValue: assessment.projectedHighValueUsd,
        confidenceScore: assessment.confidenceScore,
        confidencePercentage: 92,
        confidenceReason: `Pre-arrival CIF duty modeling and market valuation for transit chassis ${vehicle.vin}.`,
        methodologyNotes: `Benchmarked via ZMDVF-v1. CIF: $${vehicle.totalCifUsd} USD. ZIMRA Duty: $${assessment.customsDutyUsd} USD, Surtax: $${assessment.surtaxUsd} USD, VAT: $${assessment.vatUsd} USD.`,
        qrCodeData,
        userId: req.user!.id,
      },
    });

    // Update TransitVehicle with valuationRef
    await prisma.transitVehicle.update({
      where: { id: vehicle.id },
      data: { valuationRef },
    });

    res.json({
      success: true,
      data: {
        valuationRef,
        qrCodeData,
        assessment,
        valuationUrl: `/valuation/report/${valuationRef}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /api/transit/:id/publish-listing
// Seamlessly Publish In-Transit Car to Public Famba Marketplace
// ──────────────────────────────────────────────
router.post('/:id/publish-listing', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await getDealerCompany(req.user!.id);
    const vehicle = await prisma.transitVehicle.findFirst({
      where: { id: req.params.id, companyId: req.user!.role === 'ADMIN' ? undefined : company.id },
      include: { publicListing: true },
    });

    if (!vehicle) throw new ApiError(404, 'Transit vehicle not found.');

    const { pricePerDay = 0, targetSellingPriceUsd, images = [] } = req.body;
    const finalSellingPrice = Number(targetSellingPriceUsd) || vehicle.targetSellingPriceUsd || vehicle.projectedMarketValueUsd;

    const baseTitle = `${vehicle.yearOfManufacture} ${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}`.trim();
    const slug = `${vehicle.make.toLowerCase()}-${vehicle.model.toLowerCase()}-${vehicle.yearOfManufacture}-${vehicle.vin.slice(-5).toLowerCase()}`;

    const arrivalDateStr = vehicle.deliveryEta
      ? new Date(vehicle.deliveryEta).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'Shortly';

    const description = `[IN TRANSIT / ARRIVING SOON: ${arrivalDateStr}]
Genuine import from ${vehicle.countryOfOrigin}. Chassis No: ${vehicle.vin}.
${vehicle.transmission} transmission, ${vehicle.engineCapacityCc ? vehicle.engineCapacityCc + 'cc' : ''} ${vehicle.fuelType} engine.
Current Status: ${vehicle.status.replace(/_/g, ' ')}.
Pre-cleared with ZIMRA customs documentation underway. Reserve today before showroom arrival!`;

    const features = [
      'Arriving Soon',
      'In Transit',
      `${vehicle.countryOfOrigin} Import`,
      vehicle.transmission,
      vehicle.fuelType,
      'ZIMRA Customs Pre-Cleared',
    ];

    if (vehicle.publicListing) {
      // Update existing listing
      const updatedListing = await prisma.listing.update({
        where: { id: vehicle.publicListing.id },
        data: {
          title: baseTitle,
          description,
          pricePerDay: Number(pricePerDay) || 0,
          city: vehicle.destinationCity || 'Harare',
          state: 'Harare Province',
          features,
          status: 'ACTIVE',
        },
      });

      await prisma.transitVehicle.update({
        where: { id: vehicle.id },
        data: { isPublishedAsArrivingSoon: true },
      });

      return res.json({ success: true, data: updatedListing, message: 'Marketplace listing updated!' });
    }

    // Create new listing
    const newListing = await prisma.listing.create({
      data: {
        companyId: company.id,
        title: baseTitle,
        slug,
        description,
        category: 'VEHICLE_DEALER',
        status: 'ACTIVE',
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.yearOfManufacture,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        mileage: vehicle.mileage,
        color: vehicle.color,
        pricePerDay: Number(pricePerDay) || 0,
        deposit: Math.round(finalSellingPrice * 0.1), // 10% holding deposit
        currency: 'USD',
        city: vehicle.destinationCity || 'Harare',
        state: 'Harare Province',
        features,
        tags: ['In Transit', 'Arriving Soon', vehicle.make, vehicle.model, vehicle.countryOfOrigin],
        transitVehicleId: vehicle.id,
        images: {
          create: images.map((imgUrl: string, idx: number) => ({
            url: imgUrl,
            isPrimary: idx === 0,
            order: idx,
          })),
        },
      },
    });

    await prisma.transitVehicle.update({
      where: { id: vehicle.id },
      data: { isPublishedAsArrivingSoon: true },
    });

    // Log event
    await prisma.transitEvent.create({
      data: {
        transitVehicleId: vehicle.id,
        status: vehicle.status,
        note: `Vehicle published to Famba Marketplace as 'Arriving Soon'. Listing ID: ${newListing.id}`,
      },
    });

    res.status(201).json({ success: true, data: newListing, message: 'Vehicle published to Famba Marketplace!' });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// DELETE /api/transit/:id
// Delete Transit Record
// ──────────────────────────────────────────────
router.delete('/:id', authenticate, authorize('COMPANY_OWNER', 'ADMIN'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const company = await getDealerCompany(req.user!.id);
    const vehicle = await prisma.transitVehicle.findFirst({
      where: { id: req.params.id, companyId: req.user!.role === 'ADMIN' ? undefined : company.id },
    });

    if (!vehicle) throw new ApiError(404, 'Transit vehicle not found.');

    await prisma.transitVehicle.delete({
      where: { id: vehicle.id },
    });

    res.json({ success: true, message: 'In-transit vehicle deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
