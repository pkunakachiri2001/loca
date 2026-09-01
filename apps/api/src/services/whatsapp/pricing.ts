/**
 * FAMBA WhatsApp Bot — Zimnat Insurance Pricing
 *
 * Replace the hardcoded tables below with real Zimnat API calls
 * once you have API access. Set ZIMNAT_MOCK_MODE=false and
 * implement getQuoteFromApi() accordingly.
 *
 * Coverage types:
 *   THIRD_PARTY    — Statutory Third Party (cheapest, legal minimum)
 *   THIRD_PARTY_FF — Third Party, Fire & Theft
 *   COMPREHENSIVE  — Fully comprehensive
 */

export type CoverageType = 'THIRD_PARTY' | 'THIRD_PARTY_FF' | 'COMPREHENSIVE';

export type VehicleType =
  | 'Saloon / Hatchback'
  | 'SUV / 4x4'
  | 'Pickup / Light Truck'
  | 'Minibus / Kombi'
  | 'Heavy Truck'
  | 'Motorcycle';

export interface InsuranceQuote {
  vehicleType: VehicleType;
  coverageType: CoverageType;
  annualPremium: number; // USD
  monthlyPremium: number;
  coverageSummary: string;
  currency: string;
}

// ─── Mock pricing table (USD per year) ───────────────────────────────────
// Replace with real Zimnat rates when available.
const PRICING: Record<VehicleType, Record<CoverageType, number>> = {
  'Saloon / Hatchback': {
    THIRD_PARTY: 55,
    THIRD_PARTY_FF: 90,
    COMPREHENSIVE: 185,
  },
  'SUV / 4x4': {
    THIRD_PARTY: 65,
    THIRD_PARTY_FF: 110,
    COMPREHENSIVE: 230,
  },
  'Pickup / Light Truck': {
    THIRD_PARTY: 70,
    THIRD_PARTY_FF: 115,
    COMPREHENSIVE: 245,
  },
  'Minibus / Kombi': {
    THIRD_PARTY: 90,
    THIRD_PARTY_FF: 145,
    COMPREHENSIVE: 310,
  },
  'Heavy Truck': {
    THIRD_PARTY: 130,
    THIRD_PARTY_FF: 200,
    COMPREHENSIVE: 450,
  },
  Motorcycle: {
    THIRD_PARTY: 30,
    THIRD_PARTY_FF: 50,
    COMPREHENSIVE: 95,
  },
};

const COVERAGE_SUMMARIES: Record<CoverageType, string> = {
  THIRD_PARTY:
    '✅ Covers damage/injury to third parties only. Legal minimum in Zimbabwe.',
  THIRD_PARTY_FF:
    '✅ Third Party + covers your vehicle if stolen or damaged by fire.',
  COMPREHENSIVE:
    '✅ Full cover — third party, fire, theft, AND your own vehicle damage.',
};

// ─── Public API ───────────────────────────────────────────────────────────

export function getQuote(
  vehicleType: VehicleType,
  coverageType: CoverageType,
): InsuranceQuote {
  const annual = PRICING[vehicleType]?.[coverageType] ?? 0;
  return {
    vehicleType,
    coverageType,
    annualPremium: annual,
    monthlyPremium: parseFloat((annual / 12).toFixed(2)),
    coverageSummary: COVERAGE_SUMMARIES[coverageType],
    currency: 'USD',
  };
}

export function formatQuoteMessage(quote: InsuranceQuote): string {
  const coverageLabel: Record<CoverageType, string> = {
    THIRD_PARTY: 'Third Party',
    THIRD_PARTY_FF: 'Third Party, Fire & Theft',
    COMPREHENSIVE: 'Comprehensive',
  };

  return [
    `🛡️ *Your Zimnat Insurance Quote*`,
    ``,
    `🚗 Vehicle: ${quote.vehicleType}`,
    `📋 Coverage: ${coverageLabel[quote.coverageType]}`,
    ``,
    `💵 *Annual Premium: $${quote.annualPremium} USD*`,
    `   (or $${quote.monthlyPremium}/month)`,
    ``,
    quote.coverageSummary,
    ``,
    `_Powered by Zimnat Insurance & FAMBA_`,
  ].join('\n');
}

export const VEHICLE_TYPES: VehicleType[] = [
  'Saloon / Hatchback',
  'SUV / 4x4',
  'Pickup / Light Truck',
  'Minibus / Kombi',
  'Heavy Truck',
  'Motorcycle',
];

export const COVERAGE_TYPES: { key: CoverageType; label: string }[] = [
  { key: 'THIRD_PARTY', label: 'Third Party (cheapest — legal minimum)' },
  { key: 'THIRD_PARTY_FF', label: 'Third Party, Fire & Theft' },
  { key: 'COMPREHENSIVE', label: 'Comprehensive (full cover)' },
];
