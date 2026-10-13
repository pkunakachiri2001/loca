export type VehicleCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'ACCIDENT_DAMAGED';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type FuelTypeVal = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
export type TransmissionVal = 'AUTOMATIC' | 'MANUAL';
export type ValuationPurpose = 'INSURANCE' | 'BANK_FINANCE' | 'BUYING' | 'SELLING' | 'FLEET_AUDIT';

export interface ValuationInput {
  registrationNumber?: string;
  vin?: string;
  make: string;
  model: string;
  variant?: string;
  yearOfManufacture: number;
  mileage: number; // in km
  condition: VehicleCondition;
  fuelType?: FuelTypeVal | string;
  transmission?: TransmissionVal | string;
  engineCapacity?: string;
  importStatus?: string;
  countryOfOrigin?: string;
  optionalExtras?: string[];
  accidentHistory?: 'NONE' | 'MINOR' | 'MAJOR_REPAIRED';
  purpose?: ValuationPurpose | string;
  requesterName?: string;
  requesterEmail?: string;
  requesterPhone?: string;
  userId?: string;
}

export interface ValuationComparable {
  id: string;
  title: string;
  year: number;
  mileage: number;
  priceUsd: number;
  priceType: 'ASKING_PRICE' | 'ACTUAL_TRANSACTION' | 'CLAIMS_SETTLEMENT';
  source: 'DEALERSHIP' | 'MARKETPLACE' | 'ZIMNAT_CLAIM' | 'AUCTION';
  location: string;
  date: string;
  similarityScore: number; // 0 to 100%
}

export interface ValuationResult {
  valuationRef: string;
  vehicle: {
    make: string;
    model: string;
    variant: string;
    year: number;
    mileage: number;
    condition: VehicleCondition;
    fuelType?: string;
    transmission?: string;
    engineCapacity?: string;
    registrationNumber?: string;
    vin?: string;
  };
  valuation: {
    indicativeMarketValue: number; // USD
    lowValue: number; // Trade-in / Liquidation USD
    highValue: number; // Retail / Showroom USD
    currency: 'USD';
    valuationDate: string;
    expiryDate: string;
  };
  confidence: {
    score: ConfidenceLevel;
    percentage: number;
    reason: string;
    sampleSize: number;
  };
  breakdown: {
    baseLandedValueUsd: number;
    ageDepreciationPct: number;
    mileageAdjustmentUsd: number;
    conditionAdjustmentUsd: number;
    zimMarketDemandFactor: number;
    durabilityPremiumPct: number;
  };
  comparables: ValuationComparable[];
  methodology: {
    framework: string;
    notes: string[];
    disclaimer: string;
  };
  qrCodeData: string;
}
