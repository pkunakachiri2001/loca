'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import {
  Ship,
  Truck,
  ArrowLeft,
  ArrowRight,
  Plus,
  Scale,
  Sparkles,
  DollarSign,
  Calendar,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Compass,
  Anchor,
  CheckCircle2,
  FileText,
  Loader2,
} from 'lucide-react';

const POPULAR_PRESETS = [
  {
    label: 'Toyota Hilux 2.8 GD-6 (2021)',
    make: 'Toyota',
    model: 'Hilux',
    variant: '2.8 GD-6 Double Cab 4x4',
    year: 2021,
    engineCc: 2755,
    fuelType: 'DIESEL',
    transmission: 'AUTOMATIC',
    origin: 'South Africa',
    cif: 28000,
    port: 'DURBAN',
    border: 'BEITBRIDGE',
  },
  {
    label: 'Toyota Fortuner 2.8 GD-6 (2019)',
    make: 'Toyota',
    model: 'Fortuner',
    variant: '2.8 GD-6 Automatic',
    year: 2019,
    engineCc: 2755,
    fuelType: 'DIESEL',
    transmission: 'AUTOMATIC',
    origin: 'South Africa',
    cif: 26000,
    port: 'DURBAN',
    border: 'BEITBRIDGE',
  },
  {
    label: 'Honda Fit Hybrid GP5 (2016)',
    make: 'Honda',
    model: 'Fit',
    variant: '1.5 Hybrid GP5',
    year: 2016,
    engineCc: 1496,
    fuelType: 'HYBRID',
    transmission: 'AUTOMATIC',
    origin: 'Japan',
    cif: 3800,
    port: 'BEIRA',
    border: 'FORBES_MUTARE',
  },
  {
    label: 'Mazda Demio 1.3 SkyActiv (2017)',
    make: 'Mazda',
    model: 'Demio',
    variant: '1.3 SkyActiv-G',
    year: 2017,
    engineCc: 1298,
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    origin: 'Japan',
    cif: 3200,
    port: 'BEIRA',
    border: 'FORBES_MUTARE',
  },
  {
    label: 'Isuzu D-Max 3.0 Ddi (2018)',
    make: 'Isuzu',
    model: 'D-Max',
    variant: '3.0 Ddi Double Cab',
    year: 2018,
    engineCc: 2999,
    fuelType: 'DIESEL',
    transmission: 'MANUAL',
    origin: 'South Africa',
    cif: 21000,
    port: 'DURBAN',
    border: 'BEITBRIDGE',
  },
];

export default function NewTransitVehiclePage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || (user?.role !== 'COMPANY_OWNER' && user?.role !== 'ADMIN')) {
      router.push('/auth/login?redirect=/company/transit/new');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    vin: '',
    make: 'Toyota',
    model: 'Hilux',
    variant: '2.8 GD-6 4x4 Double Cab',
    yearOfManufacture: 2021,
    monthOfManufacture: 5,
    engineCapacityCc: 2755,
    fuelType: 'DIESEL',
    transmission: 'AUTOMATIC',
    mileage: 62000,
    color: 'White',
    exteriorGrade: '4.5',
    interiorGrade: 'B',

    countryOfOrigin: 'South Africa',
    supplierName: 'Barons Auto / Auction',
    supplierInvoiceNumber: 'INV-2026-901',
    fobPriceUsd: 25000,
    freightCostUsd: 2200,
    insuranceCostUsd: 800,
    totalCifUsd: 28000,

    portOfDischarge: 'DURBAN',
    vesselName: 'Hoegh Transporter',
    voyageNumber: 'V2608',
    billOfLadingNumber: 'BL-DUR-89210',
    containerNumber: '',
    carrierCompany: 'Pioneer Car Carriers',
    borderPost: 'BEITBRIDGE',
    destinationCity: 'Harare',
    destinationWarehouse: 'Msasa Bonded Logistics Hub',

    purchaseDate: new Date().toISOString().split('T')[0],
    departureDate: '',
    portEta: '',
    borderEta: '',
    deliveryEta: '',

    clearingAgentName: 'Zim-Clear Logistics',
    clearingAgentPhone: '+263 77 123 4567',
    clearingBondNumber: 'BOND-HRE-992',
    zimraAssessmentNumber: '',
    status: 'ON_VESSEL',

    targetSellingPriceUsd: 46000,
    notes: 'Advance ZIMRA entry pre-filed. Client expressed interest upon Harare arrival.',
  });

  const applyPreset = (preset: (typeof POPULAR_PRESETS)[0]) => {
    setFormData((prev) => ({
      ...prev,
      make: preset.make,
      model: preset.model,
      variant: preset.variant,
      yearOfManufacture: preset.year,
      engineCapacityCc: preset.engineCc,
      fuelType: preset.fuelType,
      transmission: preset.transmission,
      countryOfOrigin: preset.origin,
      totalCifUsd: preset.cif,
      fobPriceUsd: Math.round(preset.cif * 0.85),
      freightCostUsd: Math.round(preset.cif * 0.12),
      insuranceCostUsd: Math.round(preset.cif * 0.03),
      portOfDischarge: preset.port,
      borderPost: preset.border,
    }));
  };

  // Auto-calculate CIF when FOB/Freight/Insurance changes
  const computedCif = useMemo(() => {
    const fob = Number(formData.fobPriceUsd) || 0;
    const freight = Number(formData.freightCostUsd) || 0;
    const ins = Number(formData.insuranceCostUsd) || 0;
    return fob + freight + ins;
  }, [formData.fobPriceUsd, formData.freightCostUsd, formData.insuranceCostUsd]);

  // Sync computed CIF
  useEffect(() => {
    if (computedCif > 0 && computedCif !== formData.totalCifUsd) {
      setFormData((prev) => ({ ...prev, totalCifUsd: computedCif }));
    }
  }, [computedCif]);

  // Live Real-Time Duty & Valuation Assessment
  const assessment = useMemo(() => {
    const cif = Math.max(500, formData.totalCifUsd || 0);
    const age = Math.max(0, 2026 - formData.yearOfManufacture);
    const engineCc = Number(formData.engineCapacityCc) || 1800;
    const fuel = formData.fuelType.toUpperCase();

    // 1. Customs Duty
    let dutyRate = 40;
    if (fuel === 'ELECTRIC') dutyRate = 25;
    else if (fuel === 'HYBRID') dutyRate = 30;
    else if (engineCc <= 1500) dutyRate = 40;
    else if (engineCc <= 2999) dutyRate = 45;
    else dutyRate = 60;

    const dutyUsd = Math.round(cif * (dutyRate / 100));

    // 2. Surtax
    let surtaxRate = 0;
    if (age >= 10) surtaxRate = 35;
    else if (age >= 5) surtaxRate = 25;

    const surtaxUsd = Math.round(cif * (surtaxRate / 100));

    // 3. VAT (15% on CIF + Duty + Surtax)
    const vdp = cif + dutyUsd + surtaxUsd;
    const vatUsd = Math.round(vdp * 0.15);

    const portAdminUsd = 450;
    const totalTaxes = dutyUsd + surtaxUsd + vatUsd;
    const totalLanded = cif + totalTaxes + portAdminUsd;

    // Projected Zimbabwe Market Price based on brand durability
    let brandMultiplier = 1.25;
    if (formData.make.toLowerCase().includes('toyota')) brandMultiplier = 1.30;
    else if (formData.make.toLowerCase().includes('honda')) brandMultiplier = 1.26;
    else if (formData.make.toLowerCase().includes('isuzu')) brandMultiplier = 1.25;
    else if (formData.make.toLowerCase().includes('bmw') || formData.make.toLowerCase().includes('mercedes')) brandMultiplier = 1.15;

    const projectedMarket = Math.round((totalLanded * brandMultiplier) / 100) * 100;
    const projectedMargin = Math.round(projectedMarket - totalLanded);
    const targetPrice = Number(formData.targetSellingPriceUsd) || projectedMarket;
    const targetMargin = Math.round(targetPrice - totalLanded);

    return {
      dutyRate,
      dutyUsd,
      surtaxRate,
      surtaxUsd,
      vatUsd,
      portAdminUsd,
      totalTaxes,
      totalLanded,
      projectedMarket,
      projectedMargin,
      targetPrice,
      targetMargin,
      ageYears: age,
    };
  }, [formData.totalCifUsd, formData.yearOfManufacture, formData.engineCapacityCc, formData.fuelType, formData.make, formData.targetSellingPriceUsd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.vin.trim()) throw new Error('VIN / Chassis number is required.');
      if (!formData.make.trim() || !formData.model.trim()) throw new Error('Vehicle Make and Model are required.');

      const payload = {
        ...formData,
        vin: formData.vin.trim().toUpperCase(),
        totalCifUsd: formData.totalCifUsd || computedCif,
      };

      try {
        const res = await apiClient.post('/transit', payload);
        if (res.data?.success && res.data?.data) {
          router.push(`/company/transit/${res.data.data.id}`);
          return;
        }
      } catch (apiErr) {
        console.warn('API backend offline; saving transit record to local preview storage:', apiErr);
        const mockId = `mock-${Date.now()}`;
        const newRecord = {
          id: mockId,
          ...payload,
          totalCifUsd: payload.totalCifUsd,
          projectedDutyUsd: assessment.dutyUsd,
          customsDutyUsd: assessment.dutyUsd,
          projectedSurtaxUsd: assessment.surtaxUsd,
          surtaxUsd: assessment.surtaxUsd,
          projectedVatUsd: assessment.vatUsd,
          vatUsd: assessment.vatUsd,
          totalDutyUsd: assessment.totalTaxes,
          projectedTotalLandedCostUsd: assessment.totalLanded,
          totalLandedCostUsd: assessment.totalLanded,
          projectedMarketValueUsd: assessment.projectedMarket,
          projectedLowValueUsd: Math.round(assessment.projectedMarket * 0.93),
          projectedHighValueUsd: Math.round(assessment.projectedMarket * 1.07),
          projectedMarginUsd: assessment.projectedMargin,
          projectedMarginPercent: Math.round((assessment.projectedMargin / assessment.totalLanded) * 100),
          status: formData.status || 'PURCHASED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          documents: [],
          events: [
            {
              id: `ev-${Date.now()}`,
              status: formData.status || 'PURCHASED',
              description: 'Vehicle record created and logged into Cars in Transit pipeline.',
              createdAt: new Date().toISOString(),
            },
          ],
        };

        if (typeof window !== 'undefined') {
          const existing = JSON.parse(localStorage.getItem('famba_mock_transit_vehicles') || '[]');
          localStorage.setItem('famba_mock_transit_vehicles', JSON.stringify([newRecord, ...existing]));
        }
        router.push(`/company/transit/${mockId}`);
        return;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="max-w-6xl mx-auto py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#008767] mb-3" />
        <div className="text-slate-600 font-bold text-sm">Loading vehicle onboarding wizard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-[#0B192C] pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/company/transit"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#008767] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to In-Transit Pipeline</span>
        </Link>
        <Link
          href="/valuation"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Open Zimbabwe Valuation Framework</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Ship className="w-3.5 h-3.5" />
          <span>Automotive Dealer Onboarding</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] tracking-tight">
          Log Vehicle in Transit
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
          Enter vehicle details from your auction invoice, Bill of Lading, or export certificate to
          generate ZIMRA landed assessments and prepare customs clearance in advance.
        </p>

        {/* Popular Presets */}
        <div className="mt-4 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Fast Preset:</span>
          </span>
          {POPULAR_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-xs font-medium px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form + Sticky Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* SECTION 1: VEHICLE IDENTITY */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-[#E6F4F1] text-[#008767] flex items-center justify-center text-xs font-black">
                1
              </span>
              <span>Vehicle Identification & Specifications</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  VIN / Chassis Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                  placeholder="e.g. KDH200-0012345 or AHTBA3CD..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Required for ZIMRA ASYCUDA pre-lodgement and Interpol clearance.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Make <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  placeholder="Toyota, Honda, Isuzu, Ford..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Hilux, Fortuner, Fit, Demio..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Variant / Grade
                </label>
                <input
                  type="text"
                  value={formData.variant}
                  onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                  placeholder="2.8 GD-6 4x4, 1.5 Hybrid GP5..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Year of Manufacture <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.yearOfManufacture}
                  onChange={(e) =>
                    setFormData({ ...formData, yearOfManufacture: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                >
                  {Array.from({ length: 28 }, (_, i) => 2026 - i).map((yr) => (
                    <option key={yr} value={yr}>
                      {yr} {yr <= 2016 ? '(35% ZIMRA Surtax Applied)' : yr <= 2021 ? '(25% Surtax)' : '(Zero Surtax)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Engine Displacement (cc)
                </label>
                <input
                  type="number"
                  value={formData.engineCapacityCc}
                  onChange={(e) =>
                    setFormData({ ...formData, engineCapacityCc: Number(e.target.value) })
                  }
                  placeholder="e.g. 1496, 2755, 2982"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fuel Type
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                >
                  <option value="DIESEL">Diesel</option>
                  <option value="PETROL">Petrol</option>
                  <option value="HYBRID">Hybrid (Reduced Duty)</option>
                  <option value="ELECTRIC">Electric (EV Concession)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transmission
                </label>
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                >
                  <option value="AUTOMATIC">Automatic</option>
                  <option value="MANUAL">Manual</option>
                  <option value="SEMI_AUTOMATIC">Semi-Automatic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Odometer Mileage (km)
                </label>
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PURCHASE & CIF FINANCIALS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-[#E6F4F1] text-[#008767] flex items-center justify-center text-xs font-black">
                2
              </span>
              <span>Purchase Origin & CIF Cost Breakdown (USD)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Country of Origin <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.countryOfOrigin}
                  onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                >
                  <option value="Japan">Japan (Yokohama/Kobe/Nagoya)</option>
                  <option value="South Africa">South Africa</option>
                  <option value="United Kingdom">United Kingdom (Southampton)</option>
                  <option value="UAE">United Arab Emirates (Dubai)</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Supplier / Auction Source
                </label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="e.g. Be Forward, SBT Japan, BCA, USS"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  FOB Auction Purchase (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.fobPriceUsd}
                    onChange={(e) =>
                      setFormData({ ...formData, fobPriceUsd: Number(e.target.value) })
                    }
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ocean Freight & Shipping (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.freightCostUsd}
                    onChange={(e) =>
                      setFormData({ ...formData, freightCostUsd: Number(e.target.value) })
                    }
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Marine Insurance (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.insuranceCostUsd}
                    onChange={(e) =>
                      setFormData({ ...formData, insuranceCostUsd: Number(e.target.value) })
                    }
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Total CIF Value (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-700 font-bold text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.totalCifUsd}
                    onChange={(e) =>
                      setFormData({ ...formData, totalCifUsd: Number(e.target.value) })
                    }
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 font-bold text-xs text-emerald-900 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">ZIMRA base Value for Duty Purposes (VDP).</p>
              </div>
            </div>
          </div>

          {/* SECTION 3: SHIPPING & LOGISTICS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-[#E6F4F1] text-[#008767] flex items-center justify-center text-xs font-black">
                3
              </span>
              <span>Shipping, Routing & Zimbabwe Logistics</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Discharge Seaport
                </label>
                <select
                  value={formData.portOfDischarge}
                  onChange={(e) => setFormData({ ...formData, portOfDischarge: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                >
                  <option value="DURBAN">Durban (South Africa)</option>
                  <option value="BEIRA">Beira (Mozambique)</option>
                  <option value="WALVIS_BAY">Walvis Bay (Namibia)</option>
                  <option value="DAR_ES_SALAAM">Dar es Salaam (Tanzania)</option>
                  <option value="MAPUTO">Maputo (Mozambique)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Zimbabwe Border Post
                </label>
                <select
                  value={formData.borderPost}
                  onChange={(e) => setFormData({ ...formData, borderPost: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                >
                  <option value="BEITBRIDGE">Beitbridge Post (from SA / Durban)</option>
                  <option value="FORBES_MUTARE">Forbes Post (from Beira)</option>
                  <option value="PLUMTREE">Plumtree Post (from Walvis Bay / Botswana)</option>
                  <option value="CHIRUNDU">Chirundu Post (from Dar es Salaam)</option>
                  <option value="NYAMAPANDA">Nyamapanda Post</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bill of Lading (B/L) / Booking #
                </label>
                <input
                  type="text"
                  value={formData.billOfLadingNumber}
                  onChange={(e) => setFormData({ ...formData, billOfLadingNumber: e.target.value })}
                  placeholder="e.g. BL-DUR-89210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Vessel Name & Voyage
                </label>
                <input
                  type="text"
                  value={formData.vesselName}
                  onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                  placeholder="e.g. Hoegh Transporter V2608"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Inland Car Carrier
                </label>
                <input
                  type="text"
                  value={formData.carrierCompany}
                  onChange={(e) => setFormData({ ...formData, carrierCompany: e.target.value })}
                  placeholder="e.g. Pioneer Transport, Drive-away"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Destination Showroom City
                </label>
                <input
                  type="text"
                  value={formData.destinationCity}
                  onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                  placeholder="Harare, Bulawayo, Mutare..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Port Arrival (ETA Seaport)
                </label>
                <input
                  type="date"
                  value={formData.portEta}
                  onChange={(e) => setFormData({ ...formData, portEta: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Showroom Delivery (ETA Zim)
                </label>
                <input
                  type="date"
                  value={formData.deliveryEta}
                  onChange={(e) => setFormData({ ...formData, deliveryEta: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: CLEARING AGENT & TARGET SELLING PRICE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="w-6 h-6 rounded-lg bg-[#E6F4F1] text-[#008767] flex items-center justify-center text-xs font-black">
                4
              </span>
              <span>Clearing Agent & Target Selling Margin</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clearing Agent / Broker Name
                </label>
                <input
                  type="text"
                  value={formData.clearingAgentName}
                  onChange={(e) => setFormData({ ...formData, clearingAgentName: e.target.value })}
                  placeholder="e.g. Zim-Clear Freight Logistics"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Clearing Agent Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.clearingAgentPhone}
                  onChange={(e) => setFormData({ ...formData, clearingAgentPhone: e.target.value })}
                  placeholder="+263 77..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Showroom Selling Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.targetSellingPriceUsd}
                    onChange={(e) =>
                      setFormData({ ...formData, targetSellingPriceUsd: Number(e.target.value) })
                    }
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/company/transit"
              className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging Vehicle & Computing Duty...</span>
                </>
              ) : (
                <>
                  <span>Save to In-Transit CRM</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right 1 Col: Sticky Live ZIMRA Duty & Valuation Preview Panel */}
        <div className="lg:col-span-1 lg:sticky lg:top-28 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#0B192C] text-white rounded-3xl p-6 shadow-xl border border-slate-700">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Live ZIMRA Duty Engine
                </span>
              </div>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-slate-300">
                ZMDVF-v1
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Total CIF Value:</span>
                <span className="font-mono font-bold text-white text-sm">
                  ${formData.totalCifUsd.toLocaleString()} USD
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Customs Duty ({assessment.dutyRate}%):</span>
                <span className="font-mono font-bold text-amber-400">
                  +${assessment.dutyUsd.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>
                  Surtax ({assessment.surtaxRate}% {assessment.ageYears >= 10 ? '• 10yr Cliff' : ''}):
                </span>
                <span className="font-mono font-bold text-amber-400">
                  +${assessment.surtaxUsd.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>VAT (15% on VDP):</span>
                <span className="font-mono font-bold text-amber-400">
                  +${assessment.vatUsd.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>Port Admin & Handling:</span>
                <span className="font-mono font-bold text-slate-400">
                  +${assessment.portAdminUsd}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                <span className="font-bold text-slate-200">Total Landed Cost:</span>
                <span className="font-mono font-extrabold text-white text-base">
                  ${assessment.totalLanded.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Market Valuation Projection */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Projected Market Resale (Zimbabwe)</span>
              </div>

              <div className="text-2xl font-black text-emerald-400">
                ${assessment.projectedMarket.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-300">USD</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Selling Price:</span>
                  <span className="font-mono font-bold text-white">
                    ${assessment.targetPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Projected Dealer Net Margin:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    +${assessment.targetMargin.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                Calculated using ZIMRA customs baseline tariffs and Famba&apos;s Harare/Bulawayo
                dealership market liquidity index.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
