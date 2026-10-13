export interface VehicleBenchmarkRecord {
  make: string;
  model: string;
  variant: string;
  bodyType: 'SUV' | 'PICKUP' | 'SEDAN' | 'HATCHBACK' | 'MINIVAN' | 'COMMERCIAL';
  newPriceUsd: number; // Landed reference new/cleared price in Zimbabwe
  annualDeprRate: number; // Base annual depreciation rate (e.g., 0.08 = 8%)
  durabilityPremium: number; // Multiplier: Toyota rugged vehicles = 1.15 to 1.25, luxury European = 0.85
  partsAvailability: 'HIGH' | 'MEDIUM' | 'LOW';
  fuelTypeDefault: 'PETROL' | 'DIESEL' | 'HYBRID';
  transmissionDefault: 'AUTOMATIC' | 'MANUAL';
  popularityRank: number; // 1 = highest volume in Zimbabwe
}

export const ZIM_VEHICLE_BENCHMARKS: VehicleBenchmarkRecord[] = [
  // --- TOYOTA (Top market share in Zimbabwe) ---
  {
    make: 'Toyota',
    model: 'Hilux',
    variant: '2.8 GD-6 Double Cab 4x4',
    bodyType: 'PICKUP',
    newPriceUsd: 58000,
    annualDeprRate: 0.065, // Holds exceptional value in Zim
    durabilityPremium: 1.25,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 1,
  },
  {
    make: 'Toyota',
    model: 'Hilux',
    variant: '2.4 GD-6 Double Cab 4x2',
    bodyType: 'PICKUP',
    newPriceUsd: 46000,
    annualDeprRate: 0.07,
    durabilityPremium: 1.20,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'MANUAL',
    popularityRank: 2,
  },
  {
    make: 'Toyota',
    model: 'Hilux',
    variant: '3.0 D-4D Legend 45',
    bodyType: 'PICKUP',
    newPriceUsd: 38000,
    annualDeprRate: 0.075,
    durabilityPremium: 1.20,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'MANUAL',
    popularityRank: 3,
  },
  {
    make: 'Toyota',
    model: 'Fortuner',
    variant: '2.8 GD-6 4x4',
    bodyType: 'SUV',
    newPriceUsd: 56000,
    annualDeprRate: 0.07,
    durabilityPremium: 1.22,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 4,
  },
  {
    make: 'Toyota',
    model: 'Fortuner',
    variant: '2.4 GD-6 Raised Body',
    bodyType: 'SUV',
    newPriceUsd: 44000,
    annualDeprRate: 0.072,
    durabilityPremium: 1.18,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 5,
  },
  {
    make: 'Toyota',
    model: 'Land Cruiser Prado',
    variant: '150 Series 3.0 D-4D TX',
    bodyType: 'SUV',
    newPriceUsd: 72000,
    annualDeprRate: 0.065,
    durabilityPremium: 1.25,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 6,
  },
  {
    make: 'Toyota',
    model: 'Land Cruiser',
    variant: '79 Series Single Cab 4.5 V8 D-4D',
    bodyType: 'PICKUP',
    newPriceUsd: 68000,
    annualDeprRate: 0.05, // Retains highest resale value of any vehicle in Zimbabwe
    durabilityPremium: 1.35,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'MANUAL',
    popularityRank: 7,
  },
  {
    make: 'Toyota',
    model: 'Corolla Axio',
    variant: '1.5 X / G',
    bodyType: 'SEDAN',
    newPriceUsd: 14000, // Landed import reference
    annualDeprRate: 0.08,
    durabilityPremium: 1.12,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 8,
  },
  {
    make: 'Toyota',
    model: 'Corolla Fielder',
    variant: '1.5 Hybrid / Petrol',
    bodyType: 'HATCHBACK',
    newPriceUsd: 14500,
    annualDeprRate: 0.08,
    durabilityPremium: 1.12,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'HYBRID',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 9,
  },
  {
    make: 'Toyota',
    model: 'Wish',
    variant: '1.8 X / S',
    bodyType: 'MINIVAN',
    newPriceUsd: 13500,
    annualDeprRate: 0.085,
    durabilityPremium: 1.10,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 10,
  },
  {
    make: 'Toyota',
    model: 'Aqua',
    variant: '1.5 Hybrid',
    bodyType: 'HATCHBACK',
    newPriceUsd: 12000,
    annualDeprRate: 0.085,
    durabilityPremium: 1.08,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'HYBRID',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 11,
  },
  {
    make: 'Toyota',
    model: 'Probox',
    variant: '1.5 DX / GL',
    bodyType: 'COMMERCIAL',
    newPriceUsd: 11000,
    annualDeprRate: 0.075,
    durabilityPremium: 1.15,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 12,
  },
  {
    make: 'Toyota',
    model: 'RAV4',
    variant: '2.0 / 2.5 AWD',
    bodyType: 'SUV',
    newPriceUsd: 36000,
    annualDeprRate: 0.08,
    durabilityPremium: 1.15,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 13,
  },

  // --- HONDA ---
  {
    make: 'Honda',
    model: 'Fit',
    variant: '1.3 / 1.5 Hybrid GP1/GP5',
    bodyType: 'HATCHBACK',
    newPriceUsd: 11500, // Landed import
    annualDeprRate: 0.082,
    durabilityPremium: 1.12,
    partsAvailability: 'HIGH', // Magaba/Gazaland spares everywhere
    fuelTypeDefault: 'HYBRID',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 14,
  },
  {
    make: 'Honda',
    model: 'CR-V',
    variant: '2.0 / 2.4 i-VTEC AWD',
    bodyType: 'SUV',
    newPriceUsd: 28000,
    annualDeprRate: 0.09,
    durabilityPremium: 1.08,
    partsAvailability: 'MEDIUM',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 15,
  },
  {
    make: 'Honda',
    model: 'Vezel',
    variant: '1.5 Hybrid e:HEV',
    bodyType: 'SUV',
    newPriceUsd: 21000,
    annualDeprRate: 0.088,
    durabilityPremium: 1.08,
    partsAvailability: 'MEDIUM',
    fuelTypeDefault: 'HYBRID',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 16,
  },

  // --- MAZDA ---
  {
    make: 'Mazda',
    model: 'Demio',
    variant: '1.3 SkyActiv',
    bodyType: 'HATCHBACK',
    newPriceUsd: 10500,
    annualDeprRate: 0.088,
    durabilityPremium: 1.05,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 17,
  },
  {
    make: 'Mazda',
    model: 'CX-5',
    variant: '2.2 SkyActiv-D / 2.0 Petrol',
    bodyType: 'SUV',
    newPriceUsd: 32000,
    annualDeprRate: 0.095,
    durabilityPremium: 1.02,
    partsAvailability: 'MEDIUM',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 18,
  },
  {
    make: 'Mazda',
    model: 'BT-50',
    variant: '3.2 Double Cab 4x4',
    bodyType: 'PICKUP',
    newPriceUsd: 42000,
    annualDeprRate: 0.09,
    durabilityPremium: 1.10,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'MANUAL',
    popularityRank: 19,
  },

  // --- ISUZU ---
  {
    make: 'Isuzu',
    model: 'D-Max',
    variant: '3.0 Ddi Double Cab 4x4',
    bodyType: 'PICKUP',
    newPriceUsd: 52000,
    annualDeprRate: 0.072,
    durabilityPremium: 1.20,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 20,
  },
  {
    make: 'Isuzu',
    model: 'KB250',
    variant: 'Fleetside Single Cab',
    bodyType: 'PICKUP',
    newPriceUsd: 31000,
    annualDeprRate: 0.07,
    durabilityPremium: 1.22,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'MANUAL',
    popularityRank: 21,
  },

  // --- NISSAN ---
  {
    make: 'Nissan',
    model: 'NP200',
    variant: '1.6 8V Half-tonner',
    bodyType: 'PICKUP',
    newPriceUsd: 19000,
    annualDeprRate: 0.08,
    durabilityPremium: 1.15,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'MANUAL',
    popularityRank: 22,
  },
  {
    make: 'Nissan',
    model: 'Hardbody NP300',
    variant: '2.5 TDi Double Cab 4x4',
    bodyType: 'PICKUP',
    newPriceUsd: 36000,
    annualDeprRate: 0.08,
    durabilityPremium: 1.16,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'MANUAL',
    popularityRank: 23,
  },
  {
    make: 'Nissan',
    model: 'X-Trail',
    variant: '2.0 / 2.5 4x4',
    bodyType: 'SUV',
    newPriceUsd: 27000,
    annualDeprRate: 0.098,
    durabilityPremium: 1.02,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 24,
  },

  // --- FORD ---
  {
    make: 'Ford',
    model: 'Ranger',
    variant: '2.0 Bi-Turbo Wildtrak 4x4',
    bodyType: 'PICKUP',
    newPriceUsd: 56000,
    annualDeprRate: 0.085,
    durabilityPremium: 1.10,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 25,
  },
  {
    make: 'Ford',
    model: 'Ranger',
    variant: '2.2 TDCi XL Double Cab',
    bodyType: 'PICKUP',
    newPriceUsd: 39000,
    annualDeprRate: 0.088,
    durabilityPremium: 1.08,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'MANUAL',
    popularityRank: 26,
  },

  // --- VOLKSWAGEN ---
  {
    make: 'Volkswagen',
    model: 'Amarok',
    variant: '3.0 V6 TDI Highline 4Motion',
    bodyType: 'PICKUP',
    newPriceUsd: 62000,
    annualDeprRate: 0.09,
    durabilityPremium: 1.08,
    partsAvailability: 'MEDIUM',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 27,
  },
  {
    make: 'Volkswagen',
    model: 'Golf',
    variant: 'Golf 7 1.4 TSI / GTI',
    bodyType: 'HATCHBACK',
    newPriceUsd: 24000,
    annualDeprRate: 0.11, // European hatchbacks depreciate faster in Zim
    durabilityPremium: 0.92,
    partsAvailability: 'MEDIUM',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 28,
  },
  {
    make: 'Volkswagen',
    model: 'Polo',
    variant: '1.2 TSI / 1.0 TSI Vivo',
    bodyType: 'HATCHBACK',
    newPriceUsd: 17000,
    annualDeprRate: 0.095,
    durabilityPremium: 0.95,
    partsAvailability: 'HIGH',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'MANUAL',
    popularityRank: 29,
  },

  // --- MERCEDES-BENZ ---
  {
    make: 'Mercedes-Benz',
    model: 'C-Class',
    variant: 'C200 / C220d Avantgarde',
    bodyType: 'SEDAN',
    newPriceUsd: 48000,
    annualDeprRate: 0.12, // High initial depreciation in Zimbabwe
    durabilityPremium: 0.88,
    partsAvailability: 'LOW',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 30,
  },
  {
    make: 'Mercedes-Benz',
    model: 'E-Class',
    variant: 'E250 / E350',
    bodyType: 'SEDAN',
    newPriceUsd: 65000,
    annualDeprRate: 0.13,
    durabilityPremium: 0.85,
    partsAvailability: 'LOW',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 31,
  },

  // --- BMW ---
  {
    make: 'BMW',
    model: '3 Series',
    variant: '320i / 320d M Sport',
    bodyType: 'SEDAN',
    newPriceUsd: 46000,
    annualDeprRate: 0.125,
    durabilityPremium: 0.86,
    partsAvailability: 'LOW',
    fuelTypeDefault: 'PETROL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 32,
  },
  {
    make: 'BMW',
    model: 'X5',
    variant: 'xDrive30d M Sport',
    bodyType: 'SUV',
    newPriceUsd: 78000,
    annualDeprRate: 0.12,
    durabilityPremium: 0.90,
    partsAvailability: 'LOW',
    fuelTypeDefault: 'DIESEL',
    transmissionDefault: 'AUTOMATIC',
    popularityRank: 33,
  },
];

export function findVehicleBenchmark(make: string, model: string, variant?: string): VehicleBenchmarkRecord | null {
  const normMake = make.trim().toLowerCase();
  const normModel = model.trim().toLowerCase();

  // Try exact make + model
  const matches = ZIM_VEHICLE_BENCHMARKS.filter(
    (b) => b.make.toLowerCase() === normMake && b.model.toLowerCase() === normModel
  );

  if (matches.length === 0) {
    // Try partial model match (e.g. "Hilux GD6" vs "Hilux")
    const partialMatch = ZIM_VEHICLE_BENCHMARKS.find(
      (b) => b.make.toLowerCase() === normMake && (normModel.includes(b.model.toLowerCase()) || b.model.toLowerCase().includes(normModel))
    );
    if (partialMatch) return partialMatch;
    return null;
  }

  if (variant && matches.length > 1) {
    const normVariant = variant.trim().toLowerCase();
    const variantMatch = matches.find((m) => m.variant.toLowerCase().includes(normVariant) || normVariant.includes(m.variant.toLowerCase()));
    if (variantMatch) return variantMatch;
  }

  return matches[0];
}
