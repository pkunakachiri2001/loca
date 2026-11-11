'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Car,
  Calendar,
  DollarSign,
  Ship,
  Calculator,
  CheckCircle2,
  CreditCard,
  Download,
  Loader2,
  Handshake,
  Zap,
  Shield,
  ArrowRight,
  X,
  Building2,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const MAKES = [
  'Toyota',
  'Honda',
  'Mazda',
  'Nissan',
  'Isuzu',
  'Ford',
  'Mercedes-Benz',
  'BMW',
  'Volkswagen',
  'Mitsubishi',
  'Other',
];

const PORTS = [
  'Dar es Salaam',
  'Durban',
  'Beira',
  'Walvis Bay',
  'Maputo',
];

const YEARS = Array.from({ length: 27 }, (_, i) => 2026 - i);

interface QuoteResult {
  thirdPartyAnnualUsd: number;
  comprehensiveAnnualUsd: number;
  selectedPremiumUsd: number;
  estimatedDutyUsd: number;
  estimatedSurtaxUsd: number;
  estimatedVatUsd: number;
  totalEstimatedDutyUsd: number;
  make: string;
  model: string;
  yearOfManufacture: number;
  vehicleValueUsd: number;
  expectedArrivalDate: string;
  portOfDischarge: string;
  vin: string;
  coverageType: 'THIRD_PARTY' | 'COMPREHENSIVE';
}

function computeLocalQuote(params: {
  make: string;
  model: string;
  yearOfManufacture: number;
  vehicleValueUsd: number;
  expectedArrivalDate: string;
  portOfDischarge: string;
  vin: string;
  coverageType: 'THIRD_PARTY' | 'COMPREHENSIVE';
}): QuoteResult {
  const cif = Math.max(500, Number(params.vehicleValueUsd) || 10000);
  const age = Math.max(0, 2026 - params.yearOfManufacture);
  const customsDutyUsd = Math.round(cif * 0.4);
  const surtaxRatePct = age >= 10 ? 35 : age >= 5 ? 25 : 0;
  const surtaxUsd = Math.round(cif * (surtaxRatePct / 100));
  const vatUsd = Math.round((cif + customsDutyUsd + surtaxUsd) * 0.15);
  const totalEstimatedDutyUsd = customsDutyUsd + surtaxUsd + vatUsd;

  const thirdPartyAnnualUsd = 120;
  const comprehensiveAnnualUsd = Math.max(220, Math.round(cif * 0.0128));
  const selectedPremiumUsd =
    params.coverageType === 'COMPREHENSIVE' ? comprehensiveAnnualUsd : thirdPartyAnnualUsd;

  return {
    ...params,
    vehicleValueUsd: cif,
    thirdPartyAnnualUsd,
    comprehensiveAnnualUsd,
    selectedPremiumUsd,
    estimatedDutyUsd: customsDutyUsd,
    estimatedSurtaxUsd: surtaxUsd,
    estimatedVatUsd: vatUsd,
    totalEstimatedDutyUsd,
  };
}

function getDefaultArrivalDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split('T')[0];
}

function formatArrivalDisplay(isoDate: string): string {
  if (!isoDate) return 'Pending Date';
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function SimpleImportCoverPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('');
  const [yearOfManufacture, setYearOfManufacture] = useState(2021);
  const [vehicleValueUsd, setVehicleValueUsd] = useState('25000');
  const [expectedArrivalDate, setExpectedArrivalDate] = useState(getDefaultArrivalDate);
  const [portOfDischarge, setPortOfDischarge] = useState('Dar es Salaam');
  const [vin, setVin] = useState('');
  const [coverageType, setCoverageType] = useState<'THIRD_PARTY' | 'COMPREHENSIVE'>('THIRD_PARTY');

  const [calculating, setCalculating] = useState(false);
  const [quote, setQuote] = useState<QuoteResult>(() =>
    computeLocalQuote({
      make: 'Toyota',
      model: '',
      yearOfManufacture: 2021,
      vehicleValueUsd: 25000,
      expectedArrivalDate: getDefaultArrivalDate(),
      portOfDischarge: 'Dar es Salaam',
      vin: '',
      coverageType: 'THIRD_PARTY',
    })
  );

  // Checkout Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [chassisInput, setChassisInput] = useState('');
  const [submittingPay, setSubmittingPay] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (user?.role === 'INSURANCE_AGENT') {
      router.replace('/insurance/dashboard');
      return;
    }
    if (user?.role === 'COMPANY_OWNER') {
      router.replace('/company/transit');
    }
  }, [isHydrated, user, router]);

  useEffect(() => {
    if (user) {
      setOwnerName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  const handleCalculateQuote = async (overrideCoverage?: 'THIRD_PARTY' | 'COMPREHENSIVE') => {
    const activeCoverage = overrideCoverage || coverageType;
    const cifNum = Math.max(500, Number(vehicleValueUsd) || 0);
    setCalculating(true);

    try {
      const res = await apiClient.post('/insurance/quote', {
        isPreArrival: true,
        make,
        model,
        yearOfManufacture,
        vehicleValueUsd: cifNum,
        coverageType: activeCoverage,
      });

      const d = res.data?.data;
      if (d) {
        setQuote({
          make,
          model,
          yearOfManufacture,
          vehicleValueUsd: cifNum,
          expectedArrivalDate,
          portOfDischarge,
          vin,
          coverageType: activeCoverage,
          thirdPartyAnnualUsd: d.thirdPartyAnnualUsd ?? 120,
          comprehensiveAnnualUsd: d.comprehensiveAnnualUsd ?? Math.max(220, Math.round(cifNum * 0.0128)),
          selectedPremiumUsd: d.premium,
          estimatedDutyUsd: d.estimatedDutyUsd ?? 0,
          estimatedSurtaxUsd: d.estimatedSurtaxUsd ?? 0,
          estimatedVatUsd: d.estimatedVatUsd ?? 0,
          totalEstimatedDutyUsd: d.totalEstimatedDutyUsd ?? 0,
        });
        return;
      }
    } catch {
      // Fallback to local engine if backend API is unavailable
    } finally {
      setCalculating(false);
    }

    setQuote(
      computeLocalQuote({
        make,
        model,
        yearOfManufacture,
        vehicleValueUsd: cifNum,
        expectedArrivalDate,
        portOfDischarge,
        vin,
        coverageType: activeCoverage,
      })
    );
  };

  const handleDownloadQuote = () => {
    const lines = [
      '====================================================',
      'FAMBA MOBILITY - PRE-ARRIVAL IMPORT INSURANCE QUOTE',
      'Insure. Import. Drive.',
      '====================================================',
      `Generated: ${new Date().toLocaleString()}`,
      `Vehicle: ${quote.yearOfManufacture} ${quote.make} ${quote.model}`.trim(),
      `Chassis / VIN: ${quote.vin || 'Pending Final Entry'}`,
      `Declared Value (CIF): $${quote.vehicleValueUsd.toLocaleString()}.00 USD`,
      `Port of Dispatch: ${quote.portOfDischarge}`,
      `Expected Border Arrival: ${formatArrivalDisplay(quote.expectedArrivalDate)}`,
      '',
      '--- ESTIMATED ZIMRA IMPORT DUTY ---',
      `Customs Duty: $${quote.estimatedDutyUsd.toLocaleString()}.00 USD`,
      `Age Surtax:   $${quote.estimatedSurtaxUsd.toLocaleString()}.00 USD`,
      `VAT (15%):    $${quote.estimatedVatUsd.toLocaleString()}.00 USD`,
      `Total Est. Import Duty: $${quote.totalEstimatedDutyUsd.toLocaleString()}.00 USD`,
      '',
      '--- MOTOR VEHICLE INSURANCE OPTIONS ---',
      `Third Party (Basic Cover):    $${quote.thirdPartyAnnualUsd.toFixed(2)} USD / year`,
      `Comprehensive (Full Cover):   $${quote.comprehensiveAnnualUsd.toFixed(2)} USD / year`,
      `Selected Plan: ${quote.coverageType === 'COMPREHENSIVE' ? 'Comprehensive' : 'Third Party'} ($${quote.selectedPremiumUsd.toFixed(2)} USD)`,
      '====================================================',
      'Note: Duty figures are estimates subject to final ZIMRA ASYCUDA assessment.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Famba-Import-Quote-${quote.make}-${quote.yearOfManufacture}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProceedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !phone.trim()) {
      alert('Please enter your name and WhatsApp / EcoCash phone number.');
      return;
    }

    setSubmittingPay(true);
    const resolvedVin = chassisInput.trim() || quote.vin.trim() || '';

    try {
      const res = await apiClient.post('/insurance/buy', {
        isPreArrival: true,
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        vin: resolvedVin,
        make: quote.make,
        yearOfManufacture: quote.yearOfManufacture,
        vehicleValueUsd: quote.vehicleValueUsd,
        portOfDischarge: quote.portOfDischarge,
        expectedArrivalDate: quote.expectedArrivalDate,
        vehicleType: `${quote.yearOfManufacture} ${quote.make} ${quote.model}`.trim(),
        coverageType: quote.coverageType,
        premium: quote.selectedPremiumUsd,
      });

      const ref = res.data?.data?.paynowReference || `INS-${Date.now()}`;
      setSubmittedRef(ref);
      setShowPayModal(false);
    } catch {
      // Resilient local fallback for offline demo testing
      const mockRef = `INS-PRE-${Date.now().toString().slice(-6)}`;
      if (typeof window !== 'undefined') {
        const existing = JSON.parse(localStorage.getItem('famba_simple_import_policies') || '[]');
        localStorage.setItem(
          'famba_simple_import_policies',
          JSON.stringify([
            {
              ...quote,
              ownerId: user?.id || null,
              insurerCode: 'ZIMNAT',
              ref: mockRef,
              ownerName: ownerName.trim(),
              phone: phone.trim(),
              vin: resolvedVin || 'PENDING-KYC',
              status: 'PENDING_PAYMENT',
              paymentStatus: 'PENDING',
              createdAt: new Date().toISOString(),
            },
            ...existing,
          ])
        );
      }
      setSubmittedRef(mockRef);
      setShowPayModal(false);
    } finally {
      setSubmittingPay(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col text-[#0B192C]">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Clean Context Sub-header */}
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] flex items-center justify-center text-[#008767]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-xl font-extrabold text-[#0B192C]">
                  Advance Import Insurance
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                  Insure. Import. Drive.
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Minimal-input border arrival cover &amp; duty estimate for individual importers and simple dealers.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/insurance"
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Local Car (Reg Plate)
            </Link>
            {user?.role === 'COMPANY_OWNER' && (
              <Link
                href="/company/transit"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B192C] text-white hover:bg-slate-800 transition inline-flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Company Fleet CRM</span>
              </Link>
            )}
          </div>
        </div>

        {/* Success Confirmation Banner after Checkout Submission */}
        {submittedRef && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#008767] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-extrabold text-emerald-950">
                  Advance Cover Application Created ({submittedRef})
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Quote for <strong>{quote.yearOfManufacture} {quote.make}</strong> (${quote.selectedPremiumUsd.toFixed(2)} USD {quote.coverageType.replace('_', ' ')}) has been queued for Paynow &amp; WhatsApp disc delivery.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSubmittedRef(null)}
              className="text-xs font-bold text-emerald-800 hover:underline self-end sm:self-center"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Two-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Minimal Vehicle Details & Insurance Options */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-[#0B2A55] text-white px-6 py-4 flex items-center gap-2.5">
              <Car className="w-5 h-5 text-orange-400" />
              <h2 className="font-display font-bold text-base">Vehicle Details</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Car Make */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <Car className="w-3.5 h-3.5 text-[#0B2A55]" />
                    <span>Car Make</span>
                  </label>
                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-[#008767] outline-none"
                  >
                    {MAKES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0B2A55]" />
                    <span>Year of Manufacture</span>
                  </label>
                  <select
                    value={yearOfManufacture}
                    onChange={(e) => setYearOfManufacture(Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-[#008767] outline-none"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Value (USD) */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#0B2A55]" />
                  <span>Vehicle Value / CIF (USD)</span>
                </label>
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={vehicleValueUsd}
                  onChange={(e) => setVehicleValueUsd(e.target.value)}
                  placeholder="25000"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#008767] outline-none"
                />
              </div>

              {/* Expected Day of Arrival & Port */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0B2A55]" />
                    <span>Expected Arrival (Border)</span>
                  </label>
                  <input
                    type="date"
                    value={expectedArrivalDate}
                    onChange={(e) => setExpectedArrivalDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-[#008767] outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <Ship className="w-3.5 h-3.5 text-[#0B2A55]" />
                    <span>From Port</span>
                  </label>
                  <select
                    value={portOfDischarge}
                    onChange={(e) => setPortOfDischarge(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-[#008767] outline-none"
                  >
                    {PORTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Model / VIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Model (Optional)
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Hilux, Fit"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#008767] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Chassis / VIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="e.g. AHTFZ29G..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#008767] outline-none uppercase"
                  />
                </div>
              </div>

              {/* Insurance Options Header */}
              <div className="pt-2">
                <div className="bg-[#0B2A55] text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold mb-3">
                  <Calculator className="w-4 h-4 text-orange-400" />
                  <span>Insurance Options</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCoverageType('THIRD_PARTY');
                      handleCalculateQuote('THIRD_PARTY');
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      coverageType === 'THIRD_PARTY'
                        ? 'border-[#008767] bg-[#E6F4F1] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck
                        className={`w-4 h-4 ${
                          coverageType === 'THIRD_PARTY' ? 'text-[#008767]' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-xs font-extrabold text-[#0B192C]">Third Party</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Basic road cover</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCoverageType('COMPREHENSIVE');
                      handleCalculateQuote('COMPREHENSIVE');
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      coverageType === 'COMPREHENSIVE'
                        ? 'border-[#008767] bg-[#E6F4F1] shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Shield
                        className={`w-4 h-4 ${
                          coverageType === 'COMPREHENSIVE' ? 'text-[#008767]' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-xs font-extrabold text-[#0B192C]">Comprehensive</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Full theft &amp; damage</p>
                  </button>
                </div>
              </div>

              {/* Main Calculate Button */}
              <button
                type="button"
                onClick={() => handleCalculateQuote()}
                disabled={calculating}
                className="w-full mt-2 py-3.5 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {calculating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4" />
                )}
                <span>Calculate &amp; Get Quote</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Quote Summary Panel */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            {/* Quote Ready Banner */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-extrabold text-[#0B192C]">
                    Your Quote is Ready!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Simple. Transparent. Convenient. &bull;{' '}
                    <span className="font-bold text-slate-700">
                      {quote.yearOfManufacture} {quote.make} {quote.model}
                    </span>
                  </p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Declared CIF</div>
                <div className="text-lg font-black text-[#0B2A55]">
                  ${quote.vehicleValueUsd.toLocaleString()} USD
                </div>
              </div>
            </div>

            {/* Import Duty Estimate Box */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Estimated ZIMRA Import Duty (CIF)
                  </div>
                  <div className="text-3xl font-black text-[#0B2A55] mt-0.5">
                    ${quote.totalEstimatedDutyUsd.toLocaleString()}.00{' '}
                    <span className="text-xs font-bold text-slate-500">USD</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Est. Duty ${quote.estimatedDutyUsd.toLocaleString()} + Surtax $
                    {quote.estimatedSurtaxUsd.toLocaleString()} + 15% VAT $
                    {quote.estimatedVatUsd.toLocaleString()}
                  </p>
                </div>
              </div>
              <Link
                href={`/valuation?make=${encodeURIComponent(quote.make)}&model=${encodeURIComponent(quote.model || '')}&year=${quote.yearOfManufacture}`}
                className="text-xs font-bold text-[#008767] hover:underline inline-flex items-center gap-1 shrink-0"
              >
                <span>Full ZMDVF Valuation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Motor Vehicle Insurance Side-by-Side Comparison */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0B2A55]" />
                <h3 className="font-bold text-sm text-[#0B192C]">Motor Vehicle Insurance</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-2xl border-2 transition ${
                    quote.coverageType === 'THIRD_PARTY'
                      ? 'bg-white border-[#008767] shadow-sm'
                      : 'bg-white/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Third Party</span>
                    {quote.coverageType === 'THIRD_PARTY' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4F1] text-[#008767]">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-[#0B2A55] mt-1">
                    ${quote.thirdPartyAnnualUsd.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500">(per year &bull; Vin/Chassis Disc)</div>
                </div>

                <div
                  className={`p-4 rounded-2xl border-2 transition ${
                    quote.coverageType === 'COMPREHENSIVE'
                      ? 'bg-white border-[#008767] shadow-sm'
                      : 'bg-white/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Comprehensive</span>
                    {quote.coverageType === 'COMPREHENSIVE' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E6F4F1] text-[#008767]">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-[#0B2A55] mt-1">
                    ${quote.comprehensiveAnnualUsd.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500">(per year &bull; Theft &amp; Damage)</div>
                </div>
              </div>
            </div>

            {/* Expected Arrival Strip */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-[#0B2A55] shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">Expected Border Arrival</div>
                <div className="text-sm sm:text-base font-extrabold text-[#0B192C]">
                  {formatArrivalDisplay(quote.expectedArrivalDate)}{' '}
                  <span className="text-slate-500 font-semibold text-xs sm:text-sm">
                    (From {quote.portOfDischarge})
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setShowPayModal(true)}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0B2A55] hover:bg-[#081F40] text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>
                  Proceed to Pay (${quote.selectedPremiumUsd.toFixed(2)} USD Cover)
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQuote}
                className="w-full py-3 px-6 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Download Quote</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom 3-Column Feature Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0B2A55] flex items-center justify-center shrink-0">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0B192C]">Pre-Cleared Before Arrival</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Get quotes, settle premiums early, and issue road discs before border entry.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008767] flex items-center justify-center shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0B192C]">For Simple Dealers &amp; Importers</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Know your estimated ZIMRA duty &amp; cover costs upfront in 30 seconds.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0B192C]">Powered by Famba Mobility</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                A simpler way to insure and bring vehicles across Zimbabwe&apos;s borders.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal 3-Field Quick Checkout Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-[#0B192C]">
                  Complete Advance Cover Payment
                </h3>
                <p className="text-xs text-slate-500">
                  {quote.yearOfManufacture} {quote.make} &bull;{' '}
                  {quote.coverageType === 'COMPREHENSIVE' ? 'Comprehensive' : 'Third Party'} ($
                  {quote.selectedPremiumUsd.toFixed(2)} USD)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProceedPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Full Name / Trading Name
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Tatenda Moyo"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-[#008767] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp / EcoCash Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0771234567 or 263771234567"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-[#008767] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chassis / VIN Number (Optional until arrival)
                </label>
                <input
                  type="text"
                  value={chassisInput || vin}
                  onChange={(e) => setChassisInput(e.target.value.toUpperCase())}
                  placeholder="Leave blank if still awaiting shipping doc"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-xs font-mono font-semibold uppercase focus:ring-2 focus:ring-[#008767] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPay}
                  className="px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-xs shadow-sm flex items-center gap-2 disabled:opacity-60"
                >
                  {submittingPay ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  <span>Confirm &amp; Pay via Paynow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
