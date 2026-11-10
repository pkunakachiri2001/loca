/**
 * Zimbabwe Revenue Authority (ZIMRA) Advance Customs Duty & Landed Cost Engine
 * Integrated with Famba's Valuation Platform for Vehicles in Transit
 */

import { calculateValuation } from './engine';
import { ValuationInput } from './types';

export interface TransitDutyInput {
  totalCifUsd: number;
  yearOfManufacture: number;
  engineCapacityCc?: number | null;
  fuelType?: string | null;
  make: string;
  model: string;
  variant?: string | null;
  mileage?: number;
  transmission?: string | null;
  targetSellingPriceUsd?: number | null;
}

export interface TransitDutyAssessment {
  cifUsd: number;
  customsDutyRatePct: number;
  customsDutyUsd: number;
  surtaxRatePct: number;
  surtaxUsd: number;
  vatRatePct: number;
  vatUsd: number;
  portClearanceAndAdminUsd: number;
  totalZimraTaxesUsd: number;
  totalLandedCostUsd: number;
  
  // Market Valuation Forecast
  projectedMarketValueUsd: number;
  projectedLowValueUsd: number;
  projectedHighValueUsd: number;
  confidenceScore: string;
  
  // Margin Analysis
  projectedMarginUsd: number;
  projectedRoiPct: number;
  targetSellingPriceUsd: number;
  targetMarginUsd: number;
  
  surtaxApplies: boolean;
  ageYears: number;
}

const CURRENT_YEAR = 2026;

/**
 * Calculates official ZIMRA import duties, surtaxes, and VAT,
 * and links with Famba's Zimbabwe valuation benchmark for post-arrival market pricing.
 */
export async function assessTransitVehicleLandedCost(
  input: TransitDutyInput
): Promise<TransitDutyAssessment> {
  const cif = Math.max(500, input.totalCifUsd || 0);
  const age = Math.max(0, CURRENT_YEAR - input.yearOfManufacture);
  const engineCc = input.engineCapacityCc || 1800;
  const fuel = (input.fuelType || 'PETROL').toUpperCase();

  // 1. Customs Duty Rate Determination (based on ZIMRA Tariff Code Chapter 87)
  let customsDutyRatePct = 40; // baseline 40%

  if (fuel === 'ELECTRIC') {
    // Zimbabwe Statutory Instrument incentive for EVs
    customsDutyRatePct = 25;
  } else if (fuel === 'HYBRID') {
    customsDutyRatePct = 30;
  } else if (engineCc <= 1500) {
    customsDutyRatePct = 40;
  } else if (engineCc <= 2999) {
    customsDutyRatePct = 45;
  } else {
    // 3000cc+ luxury/high displacement
    customsDutyRatePct = 60;
  }

  const customsDutyUsd = Math.round(cif * (customsDutyRatePct / 100));

  // 2. Surtax Determination (Under Section 98 of Customs Act)
  // Vehicles >= 5 years face surtax; >= 10 years face maximum punitive 35% surtax
  let surtaxRatePct = 0;
  if (age >= 10) {
    surtaxRatePct = 35;
  } else if (age >= 5) {
    surtaxRatePct = 25;
  }

  // Surtax is levied on the CIF Value
  const surtaxUsd = Math.round(cif * (surtaxRatePct / 100));

  // 3. Value Added Tax (VAT) — 15% levied on Value for Duty Purposes (VDP = CIF + Duty + Surtax)
  const vdp = cif + customsDutyUsd + surtaxUsd;
  const vatRatePct = 15;
  const vatUsd = Math.round(vdp * (vatRatePct / 100));

  // Standard port handling, transit storage, and clearing administrative charges
  const portClearanceAndAdminUsd = 450;

  const totalZimraTaxesUsd = customsDutyUsd + surtaxUsd + vatUsd;
  const totalLandedCostUsd = cif + totalZimraTaxesUsd + portClearanceAndAdminUsd;

  // 4. Query Famba Valuation Engine for Projected Open-Market Resale in Zimbabwe
  const valInput: ValuationInput = {
    make: input.make,
    model: input.model,
    variant: input.variant || '',
    yearOfManufacture: input.yearOfManufacture,
    mileage: input.mileage || Math.max(15000, age * 13000),
    condition: 'GOOD',
    fuelType: fuel,
    transmission: input.transmission || 'AUTOMATIC',
    engineCapacity: `${engineCc}cc`,
    purpose: 'IMPORT_LANDED_FORECAST',
  };

  let projectedMarketValueUsd = Math.round(totalLandedCostUsd * 1.25);
  let projectedLowValueUsd = Math.round(totalLandedCostUsd * 1.10);
  let projectedHighValueUsd = Math.round(totalLandedCostUsd * 1.40);
  let confidenceScore = 'HIGH';

  try {
    const valResult = await calculateValuation(valInput);
    if (valResult?.valuation?.indicativeMarketValue) {
      projectedMarketValueUsd = valResult.valuation.indicativeMarketValue;
      projectedLowValueUsd = valResult.valuation.lowValue;
      projectedHighValueUsd = valResult.valuation.highValue;
      confidenceScore = valResult.confidence.score;
    }
  } catch (err) {
    // If valuation benchmark lookup fails, fallback to standard dealership margin
    projectedMarketValueUsd = Math.round(totalLandedCostUsd * 1.22);
  }

  // Margin Analysis
  const projectedMarginUsd = Math.round(projectedMarketValueUsd - totalLandedCostUsd);
  const projectedRoiPct = totalLandedCostUsd > 0
    ? Math.round((projectedMarginUsd / totalLandedCostUsd) * 100)
    : 0;

  const targetSellingPriceUsd = input.targetSellingPriceUsd || projectedMarketValueUsd;
  const targetMarginUsd = Math.round(targetSellingPriceUsd - totalLandedCostUsd);

  return {
    cifUsd: cif,
    customsDutyRatePct,
    customsDutyUsd,
    surtaxRatePct,
    surtaxUsd,
    vatRatePct,
    vatUsd,
    portClearanceAndAdminUsd,
    totalZimraTaxesUsd,
    totalLandedCostUsd,
    projectedMarketValueUsd,
    projectedLowValueUsd,
    projectedHighValueUsd,
    confidenceScore,
    projectedMarginUsd,
    projectedRoiPct,
    targetSellingPriceUsd,
    targetMarginUsd,
    surtaxApplies: surtaxRatePct > 0,
    ageYears: age,
  };
}
