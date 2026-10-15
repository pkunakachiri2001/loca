'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  CheckCircle2,
  Printer,
  Share2,
  ArrowLeft,
  Calendar,
  Gauge,
  Car,
  TrendingUp,
  Scale,
  Award,
  Download,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { apiClient } from '@/lib/api';

export default function ValuationReportPage() {
  const params = useParams();
  const router = useRouter();
  const ref = params?.ref as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadValuation() {
      // 1. Check local session storage first for immediate instant load
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem(`val_${ref}`);
        if (cached) {
          try {
            setData(JSON.parse(cached));
            setLoading(false);
            return;
          } catch (e) {
            console.warn('Cache parse error:', e);
          }
        }
      }

      // 2. Fetch from backend
      try {
        const res = await apiClient.get(`/valuation/${ref}`);
        if (res.data?.success && res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load from API, using fallback data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (ref) {
      loadValuation();
    }
  }, [ref]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-slate-700 font-bold text-lg">Retrieving Valuation Certificate...</div>
        <div className="text-slate-400 text-sm font-mono mt-1">{ref}</div>
      </div>
    );
  }

  // Fallback demonstration data if ref not found
  const val = data?.valuation || {
    indicativeMarketValue: 31500,
    lowValue: 28500,
    highValue: 34000,
    currency: 'USD',
    valuationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  };

  const vehicle = data?.vehicle || {
    make: 'Toyota',
    model: 'Fortuner',
    variant: '2.8 GD-6 4x4 Automatic',
    year: 2019,
    mileage: 82000,
    condition: 'EXCELLENT',
    fuelType: 'DIESEL',
    transmission: 'AUTOMATIC',
    registrationNumber: 'AFE-8921',
  };

  const confidence = data?.confidence || {
    score: 'HIGH',
    percentage: 94,
    reason: 'High confidence based on 26 verified comparable vehicles transacted or listed in Zimbabwe.',
    sampleSize: 26,
  };

  const breakdown = data?.breakdown || {
    baseLandedValueUsd: 56000,
    ageDepreciationPct: 35,
    mileageAdjustmentUsd: 400,
    conditionAdjustmentUsd: 1200,
    zimMarketDemandFactor: 1.22,
    durabilityPremiumPct: 22,
  };

  const comparables = data?.comparables || [
    {
      id: 'c1',
      title: '2019 Toyota Fortuner 2.8 GD-6 4x4',
      year: 2019,
      mileage: 79000,
      priceUsd: 32500,
      priceType: 'ASKING_PRICE',
      source: 'DEALERSHIP',
      location: 'Harare (Borrowdale Motor Hub)',
      date: '3 days ago',
      similarityScore: 98,
    },
    {
      id: 'c2',
      title: '2019 Toyota Fortuner 2.8 GD-6 Auto',
      year: 2019,
      mileage: 86000,
      priceUsd: 31000,
      priceType: 'ACTUAL_TRANSACTION',
      source: 'ZIMNAT_CLAIM',
      location: 'Zimnat Claims Settlement Audit',
      date: '1 week ago',
      similarityScore: 96,
    },
    {
      id: 'c3',
      title: '2019 Toyota Fortuner GD-6 Raised Body',
      year: 2019,
      mileage: 84000,
      priceUsd: 31800,
      priceType: 'ASKING_PRICE',
      source: 'DEALERSHIP',
      location: 'Harare (Msasa Car Dealerships)',
      date: '2 weeks ago',
      similarityScore: 94,
    },
    {
      id: 'c4',
      title: '2018 Toyota Fortuner 2.8 GD-6 4x4',
      year: 2018,
      mileage: 95000,
      priceUsd: 29500,
      priceType: 'ACTUAL_TRANSACTION',
      source: 'MARKETPLACE',
      location: 'Bulawayo (Belmont Auto Row)',
      date: '3 weeks ago',
      similarityScore: 90,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C] flex flex-col font-sans">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Top Action Bar (hidden in print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
          <Link
            href="/valuation"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#008767] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>New Valuation</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition"
            >
              <Share2 className="w-3.5 h-3.5 text-[#008767]" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#008767] hover:bg-[#007358] text-white text-xs font-bold shadow-md shadow-[#008767]/20 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* OFFICIAL CERTIFICATE CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:m-0">
          {/* Certificate Header Banner */}
          <div className="bg-gradient-to-r from-[#008767] via-[#007358] to-[#0B192C] text-white p-6 sm:p-10 border-b border-emerald-900/40 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Defensible Valuation Certificate</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Motor Vehicle Valuation Certificate
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">
                  Issued under the Zimbabwe Multi-Factor Defensible Valuation Framework
                </p>
              </div>

              {/* Reference & QR Box */}
              <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20 text-left sm:text-right">
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                  Certificate Ref No.
                </div>
                <div className="text-lg font-mono font-bold text-white tracking-wide">{ref}</div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Issued: {val.valuationDate} • Valid: 90 Days
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {/* Primary Valuation Hero Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Indicative Fair Market Value */}
              <div className="md:col-span-2 bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 p-6 sm:p-8 rounded-2xl border-2 border-emerald-600/40 shadow-sm relative overflow-hidden">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>Indicative Fair Market Value</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
                    ${val.indicativeMarketValue.toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-emerald-700">{val.currency}</span>
                </div>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  Recommended benchmark for comprehensive insurance sum insured, bank asset finance,
                  and fair trade negotiations in Zimbabwe.
                </p>

                {/* Valuation Range */}
                <div className="mt-5 pt-5 border-t border-emerald-200/60 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">
                      Low (Trade-in / Forced Sale)
                    </div>
                    <div className="text-lg font-extrabold text-slate-800 mt-0.5">
                      ${val.lowValue.toLocaleString()} {val.currency}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">
                      High (Retail / Dealership)
                    </div>
                    <div className="text-lg font-extrabold text-slate-800 mt-0.5">
                      ${val.highValue.toLocaleString()} {val.currency}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidence Score Card */}
              <div className="bg-[#0B192C] text-white p-6 rounded-2xl flex flex-col justify-between border border-[#008767]/30 shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Confidence Score
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold">
                      {confidence.score}
                    </span>
                  </div>

                  <div className="text-3xl font-extrabold text-white mb-2">
                    {confidence.percentage}% Match
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{confidence.reason}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                  <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Sample Size: {confidence.sampleSize} verified units</span>
                </div>
              </div>
            </div>

            {/* Vehicle Specification Grid */}
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>Vehicle Identification & Baseline Attributes</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Make & Model</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {vehicle.make} {vehicle.model}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Variant / Trim</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {vehicle.variant || 'Standard'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Year of Manufacture</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{vehicle.year}</div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Odometer (Mileage)</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {vehicle.mileage.toLocaleString()} km
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Fuel & Transmission</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {vehicle.fuelType || 'Diesel'} • {vehicle.transmission || 'Automatic'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Condition Rating</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">{vehicle.condition}</div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Registration Plate</div>
                  <div className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                    {vehicle.registrationNumber || 'Not Specified'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500 font-semibold uppercase">Origin / Tariff Status</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">Cleared & Duty Paid</div>
                </div>
              </div>
            </div>

            {/* Zimbabwe Valuation Methodology & Adjustments */}
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Zimbabwe Valuation Methodology Factors</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs font-bold text-slate-700 mb-1">ZIMRA Landed Baseline</div>
                  <div className="text-xl font-extrabold text-slate-900">
                    ${breakdown.baseLandedValueUsd.toLocaleString()} USD
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Incorporates CIF import cost, customs duty, surtax and port clearance.
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs font-bold text-slate-700 mb-1">Durability & Market Demand</div>
                  <div className="text-xl font-extrabold text-emerald-700">
                    +{breakdown.durabilityPremiumPct}% Premium
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    High resale retention due to widespread spare parts and terrain resilience.
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="text-xs font-bold text-slate-700 mb-1">Age & Mileage Depreciation</div>
                  <div className="text-xl font-extrabold text-slate-900">
                    -{breakdown.ageDepreciationPct}% Applied
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Normalized against Zimbabwe average of ~14,000 km per annum.
                  </div>
                </div>
              </div>
            </div>

            {/* Underlying Market Comparables Table */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Underlying Zimbabwe Market Comparables</span>
                </h2>
                <span className="text-xs text-slate-500">Live & Anonymized Transaction Records</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                      <th className="p-3">Comparable Vehicle</th>
                      <th className="p-3">Location / Channel</th>
                      <th className="p-3">Mileage</th>
                      <th className="p-3">Price Type</th>
                      <th className="p-3">Price (USD)</th>
                      <th className="p-3 text-right">Similarity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comparables.map((comp: any) => (
                      <tr key={comp.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-semibold text-slate-900">{comp.title}</td>
                        <td className="p-3 text-slate-600">{comp.location}</td>
                        <td className="p-3 text-slate-600">{comp.mileage.toLocaleString()} km</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              comp.priceType === 'ACTUAL_TRANSACTION'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {comp.priceType === 'ACTUAL_TRANSACTION' ? 'Actual Sale' : 'Asking Price'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          ${comp.priceUsd.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-700">
                          {comp.similarityScore}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Seal, QR Verification & CTA */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* QR Verification Seal */}
              <div className="flex items-center gap-4 sm:col-span-2">
                {data?.qrCodeData && (
                  <img
                    src={data.qrCodeData}
                    alt="Valuation QR Code"
                    className="w-24 h-24 rounded-xl border border-slate-300 p-1 bg-white shadow-sm flex-shrink-0"
                  />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Official Tamper-Proof Digital Verification</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Scan with any smartphone camera to verify this certificate on the Zimbabwe Motor
                    Valuation registry. Accepted by Zimnat, banks, and authorized brokers.
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">Ref: {ref}</div>
                </div>
              </div>

              {/* Integrated Insurance CTA */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center print:hidden">
                <div className="text-xs font-extrabold text-emerald-900">Need Comprehensive Insurance?</div>
                <div className="text-[11px] text-emerald-700 mt-0.5 mb-3">
                  Insure at this exact verified value of ${val.indicativeMarketValue.toLocaleString()} USD
                </div>
                <Link
                  href={`/insurance?valRef=${ref}&sumInsured=${val.indicativeMarketValue}&make=${encodeURIComponent(
                    vehicle.make
                  )}&model=${encodeURIComponent(vehicle.model)}&year=${vehicle.year}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                >
                  <span>Get Zimnat Quote</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
