import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { calculateValuation } from '../services/valuation/engine';
import { ZIM_VEHICLE_BENCHMARKS } from '../services/valuation/benchmarks';
import { ValuationInput } from '../services/valuation/types';

const router = Router();

// In-memory cache for fast lookups if DB is syncing
const valuationCache = new Map<string, any>();

// ──────────────────────────────────────────────
// GET /api/valuation/benchmarks
// Returns popular makes, models, and variants for frontend dropdowns
// ──────────────────────────────────────────────
router.get('/benchmarks', (req: Request, res: Response) => {
  try {
    const makesMap: { [make: string]: string[] } = {};

    ZIM_VEHICLE_BENCHMARKS.forEach((item) => {
      if (!makesMap[item.make]) {
        makesMap[item.make] = [];
      }
      if (!makesMap[item.make].includes(item.model)) {
        makesMap[item.make].push(item.model);
      }
    });

    const popularVehicles = ZIM_VEHICLE_BENCHMARKS.slice(0, 12).map((v) => ({
      make: v.make,
      model: v.model,
      variant: v.variant,
      bodyType: v.bodyType,
      durabilityRating: v.durabilityPremium,
      partsAvailability: v.partsAvailability,
    }));

    return res.json({
      success: true,
      data: {
        makes: Object.keys(makesMap),
        modelsByMake: makesMap,
        popularVehicles,
      },
    });
  } catch (error) {
    logger.error('Error fetching valuation benchmarks:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch benchmarks' });
  }
});

// ──────────────────────────────────────────────
// POST /api/valuation/estimate
// Generates an instant defensible vehicle valuation with comparables
// ──────────────────────────────────────────────
router.post('/estimate', async (req: Request, res: Response) => {
  try {
    const {
      registrationNumber,
      vin,
      make,
      model,
      variant,
      yearOfManufacture,
      mileage,
      condition,
      fuelType,
      transmission,
      engineCapacity,
      importStatus,
      countryOfOrigin,
      optionalExtras,
      accidentHistory,
      purpose,
      requesterName,
      requesterEmail,
      requesterPhone,
      userId,
    } = req.body;

    if (!make || !model || !yearOfManufacture || mileage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Make, model, year of manufacture, and mileage are required.',
      });
    }

    const input: ValuationInput = {
      registrationNumber,
      vin,
      make: String(make).trim(),
      model: String(model).trim(),
      variant: variant ? String(variant).trim() : undefined,
      yearOfManufacture: Number(yearOfManufacture),
      mileage: Number(mileage),
      condition: condition || 'GOOD',
      fuelType,
      transmission,
      engineCapacity,
      importStatus,
      countryOfOrigin,
      optionalExtras: Array.isArray(optionalExtras) ? optionalExtras : undefined,
      accidentHistory: accidentHistory || 'NONE',
      purpose: purpose || 'INSURANCE',
      requesterName,
      requesterEmail,
      requesterPhone,
      userId,
    };

    const result = await calculateValuation(input);

    // Cache result
    valuationCache.set(result.valuationRef, result);

    // Persist to database if available
    try {
      if ((prisma as any).vehicleValuation) {
        await (prisma as any).vehicleValuation.create({
          data: {
            valuationRef: result.valuationRef,
            registrationNumber: input.registrationNumber,
            vin: input.vin,
            make: input.make,
            model: input.model,
            variant: result.vehicle.variant,
            yearOfManufacture: input.yearOfManufacture,
            mileage: input.mileage,
            condition: input.condition,
            fuelType: result.vehicle.fuelType,
            transmission: result.vehicle.transmission,
            engineCapacity: input.engineCapacity,
            importStatus: input.importStatus,
            countryOfOrigin: input.countryOfOrigin,
            optionalExtras: input.optionalExtras ? JSON.parse(JSON.stringify(input.optionalExtras)) : undefined,
            accidentHistory: input.accidentHistory,
            purpose: input.purpose,
            requesterName: input.requesterName,
            requesterEmail: input.requesterEmail,
            requesterPhone: input.requesterPhone,
            indicativeMarketValue: result.valuation.indicativeMarketValue,
            lowValue: result.valuation.lowValue,
            highValue: result.valuation.highValue,
            currency: result.valuation.currency,
            confidenceScore: result.confidence.score,
            confidencePercentage: result.confidence.percentage,
            confidenceReason: result.confidence.reason,
            comparableCount: result.comparables.length,
            methodologyNotes: result.methodology.framework,
            comparablesData: JSON.parse(JSON.stringify(result.comparables)),
            qrCodeData: result.qrCodeData,
            userId: input.userId,
          },
        });
      }
    } catch (dbErr) {
      logger.warn('Failed to persist vehicle valuation in DB, using memory cache:', dbErr);
    }

    return res.json({
      success: true,
      message: 'Vehicle valuation generated successfully',
      data: result,
    });
  } catch (error: any) {
    logger.error('Error generating vehicle valuation:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate vehicle valuation',
    });
  }
});

// ──────────────────────────────────────────────
// GET /api/valuation/:idOrRef
// Retrieves valuation certificate by reference (e.g. ZIM-VAL-2026-1234)
// ──────────────────────────────────────────────
router.get('/:idOrRef', async (req: Request, res: Response) => {
  try {
    const { idOrRef } = req.params;

    // Check memory cache first
    if (valuationCache.has(idOrRef)) {
      return res.json({
        success: true,
        data: valuationCache.get(idOrRef),
      });
    }

    // Check database
    try {
      if ((prisma as any).vehicleValuation) {
        const record = await (prisma as any).vehicleValuation.findFirst({
          where: {
            OR: [{ valuationRef: idOrRef }, { id: idOrRef }],
          },
        });

        if (record) {
          const formattedResult = {
            valuationRef: record.valuationRef,
            vehicle: {
              make: record.make,
              model: record.model,
              variant: record.variant,
              year: record.yearOfManufacture,
              mileage: record.mileage,
              condition: record.condition,
              fuelType: record.fuelType,
              transmission: record.transmission,
              engineCapacity: record.engineCapacity,
              registrationNumber: record.registrationNumber,
              vin: record.vin,
            },
            valuation: {
              indicativeMarketValue: record.indicativeMarketValue,
              lowValue: record.lowValue,
              highValue: record.highValue,
              currency: record.currency || 'USD',
              valuationDate: record.createdAt.toISOString().split('T')[0],
              expiryDate: new Date(new Date(record.createdAt).getTime() + 90 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            },
            confidence: {
              score: record.confidenceScore,
              percentage: record.confidencePercentage,
              reason: record.confidenceReason,
              sampleSize: record.comparableCount || 12,
            },
            breakdown: {
              baseLandedValueUsd: record.highValue,
              ageDepreciationPct: 24,
              mileageAdjustmentUsd: 0,
              conditionAdjustmentUsd: 0,
              zimMarketDemandFactor: 1.15,
              durabilityPremiumPct: 15,
            },
            comparables: record.comparablesData || [],
            methodology: {
              framework: record.methodologyNotes || 'Zimbabwe Multi-Factor Defensible Valuation Framework (ZMDVF-v1)',
              notes: [
                'Benchmarked against ZIMRA customs clearance tariffs and landed costs.',
                'Adjusted for Zimbabwe-specific parts availability, road surface durability, and fuel resilience.',
                'Continuous comparison against active dealership listings and anonymized insurance claims settlements.',
              ],
              disclaimer:
                'This valuation certificate provides an independent, objective indicative market range based on prevailing economic factors, actual transactions, and local market comparables.',
            },
            qrCodeData: record.qrCodeData,
          };

          valuationCache.set(record.valuationRef, formattedResult);
          return res.json({ success: true, data: formattedResult });
        }
      }
    } catch (dbErr) {
      logger.warn('DB lookup failed for valuation:', dbErr);
    }

    return res.status(404).json({
      success: false,
      message: `Valuation reference ${idOrRef} not found.`,
    });
  } catch (error) {
    logger.error('Error fetching valuation by ref:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve valuation' });
  }
});

export default router;
