'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import {
  Ship,
  Truck,
  Plus,
  Search,
  Filter,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Scale,
  Anchor,
  Compass,
  ArrowUpRight,
  Layers,
  Loader2,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  PURCHASED: {
    label: 'Purchased / Awaiting Vessel',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Clock,
  },
  ON_VESSEL: {
    label: 'On Vessel (High Seas)',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Ship,
  },
  ARRIVED_PORT: {
    label: 'Arrived at Seaport',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Anchor,
  },
  INLAND_TRANSIT: {
    label: 'Inland Transshipment',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: Truck,
  },
  AT_BORDER: {
    label: 'At Zimbabwe Border',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: Compass,
  },
  CUSTOMS_CLEARING: {
    label: 'ZIMRA Clearing',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: Scale,
  },
  CLEARED_DELIVERED: {
    label: 'Cleared & Delivered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  AVAILABLE_FOR_SALE: {
    label: 'Showroom Stock / For Sale',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    icon: Sparkles,
  },
  SOLD: {
    label: 'Sold',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: CheckCircle2,
  },
};

export default function TransitDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || (user?.role !== 'COMPANY_OWNER' && user?.role !== 'ADMIN')) {
      router.push('/auth/login?redirect=/company/transit');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [portFilter, setPortFilter] = useState('ALL');
  const [borderFilter, setBorderFilter] = useState('ALL');

  // Fetch overview metrics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['transit-stats-overview'],
    queryFn: () => apiClient.get('/transit/stats/overview').then((r) => r.data.data),
    enabled: !!isAuthenticated,
  });

  // Fetch vehicles
  const { data: listData, isLoading: listLoading, refetch } = useQuery({
    queryKey: ['transit-vehicles', statusFilter, portFilter, borderFilter, search],
    queryFn: async () => {
      let remote: any[] = [];
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'ALL') params.set('status', statusFilter);
        if (portFilter !== 'ALL') params.set('portOfDischarge', portFilter);
        if (borderFilter !== 'ALL') params.set('borderPost', borderFilter);
        if (search) params.set('q', search);
        const res = await apiClient.get(`/transit?${params.toString()}`);
        remote = res.data?.data || [];
      } catch {
        // API offline fallback
      }

      let local: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          local = JSON.parse(localStorage.getItem('famba_mock_transit_vehicles') || '[]');
        } catch {}
      }

      const all = [...local, ...remote];
      return all.filter((v) => {
        if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
        if (portFilter !== 'ALL' && v.portOfDischarge !== portFilter) return false;
        if (borderFilter !== 'ALL' && v.borderPost !== borderFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          const match =
            v.make?.toLowerCase().includes(q) ||
            v.model?.toLowerCase().includes(q) ||
            v.vin?.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      });
    },
    enabled: !!isAuthenticated,
  });

  const vehicles: any[] = (listData || []).map((v: any) => ({
    ...v,
    totalCifUsd: Number(v.totalCifUsd || 0),
    projectedDutyUsd: Number(v.projectedDutyUsd ?? v.customsDutyUsd ?? 0),
    projectedSurtaxUsd: Number(v.projectedSurtaxUsd ?? v.surtaxUsd ?? 0),
    projectedVatUsd: Number(v.projectedVatUsd ?? v.vatUsd ?? 0),
    projectedTotalLandedCostUsd: Number(v.projectedTotalLandedCostUsd ?? v.totalLandedCostUsd ?? 0),
    projectedMarketValueUsd: Number(v.projectedMarketValueUsd ?? 0),
    projectedMarginUsd: Number(v.projectedMarginUsd ?? 0),
  }));

  const stats = statsData || {
    totalVehicles: vehicles.length,
    totalCifInvested: vehicles.reduce((sum, v) => sum + (v.totalCifUsd || 0), 0),
    totalProjectedTaxes: vehicles.reduce((sum, v) => sum + (v.projectedDutyUsd + v.projectedSurtaxUsd + v.projectedVatUsd || 0), 0),
    totalProjectedMarketValue: vehicles.reduce((sum, v) => sum + (v.projectedMarketValueUsd || 0), 0),
    projectedPortfolioMargin: vehicles.reduce((sum, v) => sum + (v.projectedMarginUsd || 0), 0),
    arrivingNext7Days: 0,
    byStatus: {},
  };

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#008767] mb-3" />
        <div className="text-slate-600 font-bold text-sm">Loading dealer pipeline...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-[#0B192C]">
      {/* Hero / Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Ship className="w-3.5 h-3.5" />
            <span>Dealer Import CRM & ZIMRA Pre-Clearance</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#0B192C] tracking-tight">
            Cars in Transit Pipeline
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Track overseas shipments from Japan, UK, SA & UAE, process advance customs paperwork,
            and monitor duty liabilities before border arrival.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/valuation"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-[#008767] font-bold text-xs shadow-sm transition"
          >
            <Scale className="h-4 w-4 text-[#008767]" />
            <span>Valuation Engine</span>
          </Link>
          <Link
            href="/company/transit/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            <span>Log In-Transit Vehicle</span>
          </Link>
        </div>
      </motion.div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total In Pipeline */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total In Pipeline
            </span>
            <Ship className="w-4 h-4 text-[#008767]" />
          </div>
          <div className="text-2xl font-black text-[#0B192C]">
            {statsLoading ? '...' : stats.totalVehicles}
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-[#008767] font-bold">{stats.arrivingNext7Days}</span> arriving in
            next 7 days
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        </div>

        {/* Total CIF Capital Invested */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total CIF Invested
            </span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-[#0B192C]">
            ${statsLoading ? '...' : (stats.totalCifInvested || 0).toLocaleString()} <span className="text-xs text-slate-400">USD</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">
            FOB + Ocean Freight + Marine Cover
          </div>
        </div>

        {/* Projected ZIMRA Duties */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Est. ZIMRA Duty Liability
            </span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">
            ${statsLoading ? '...' : (stats.totalProjectedTaxes || 0).toLocaleString()} <span className="text-xs text-slate-400">USD</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">
            Customs duty, surtax & 15% VAT
          </div>
        </div>

        {/* Projected Net Portfolio Margin */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Projected Gross Margin
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            +${statsLoading ? '...' : (stats.projectedPortfolioMargin || 0).toLocaleString()} <span className="text-xs text-slate-400">USD</span>
          </div>
          <div className="text-[11px] font-medium text-slate-500 mt-1">
            Based on Famba ZMDVF-v1 valuation
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by VIN / Chassis, Make, Model, B/L or Supplier..."
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white text-[#0B192C]"
            />
          </div>

          {/* Port of Discharge Filter */}
          <select
            value={portFilter}
            onChange={(e) => setPortFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white text-slate-700"
          >
            <option value="ALL">All Seaports</option>
            <option value="DURBAN">Durban (South Africa)</option>
            <option value="WALVIS_BAY">Walvis Bay (Namibia)</option>
            <option value="BEIRA">Beira (Mozambique)</option>
            <option value="DAR_ES_SALAAM">Dar es Salaam (Tanzania)</option>
            <option value="MAPUTO">Maputo (Mozambique)</option>
          </select>

          {/* Zimbabwe Border Post Filter */}
          <select
            value={borderFilter}
            onChange={(e) => setBorderFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white text-slate-700"
          >
            <option value="ALL">All Zimbabwe Borders</option>
            <option value="BEITBRIDGE">Beitbridge Post</option>
            <option value="FORBES_MUTARE">Forbes (Mutare) Post</option>
            <option value="PLUMTREE">Plumtree Post</option>
            <option value="CHIRUNDU">Chirundu Post</option>
            <option value="NYAMAPANDA">Nyamapanda Post</option>
          </select>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh pipeline"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Lifecycle Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 text-xs font-bold">
          {[
            { id: 'ALL', label: 'All Vehicles' },
            { id: 'PURCHASED', label: 'Purchased' },
            { id: 'ON_VESSEL', label: 'On Vessel' },
            { id: 'ARRIVED_PORT', label: 'At Seaport' },
            { id: 'INLAND_TRANSIT', label: 'Inland Transit' },
            { id: 'AT_BORDER', label: 'At Border' },
            { id: 'CUSTOMS_CLEARING', label: 'ZIMRA Clearing' },
            { id: 'CLEARED_DELIVERED', label: 'Cleared' },
            { id: 'AVAILABLE_FOR_SALE', label: 'For Sale' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#008767] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Cards / Table */}
      {listLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse h-36" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mx-auto mb-4">
            <Ship className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-[#0B192C]">No In-Transit Vehicles Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Log your overseas car purchases as soon as you receive the Bill of Lading or auction invoice
            so clearance paperwork can be completed before arrival.
          </p>
          <Link
            href="/company/transit/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            <span>Log Your First Transit Vehicle</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((v) => {
            const statusConfig = STATUS_CONFIG[v.status] || STATUS_CONFIG.PURCHASED;
            const StatusIcon = statusConfig.icon;
            const docCount = v.documents?.length || 0;

            const daysToArrival = v.deliveryEta
              ? Math.ceil((new Date(v.deliveryEta).getTime() - new Date().getTime()) / 86400000)
              : null;

            return (
              <div
                key={v.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-emerald-300 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Vehicle Main Identity */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusConfig.label}</span>
                    </span>

                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                      VIN: {v.vin}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      Origin: {v.countryOfOrigin}
                    </span>

                    {v.isPublishedAsArrivingSoon && (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Live on Marketplace
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-black text-[#0B192C]">
                    {v.yearOfManufacture} {v.make} {v.model} {v.variant || ''}
                  </h2>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500 font-medium">
                    <span>
                      Seaport: <strong className="text-slate-800">{v.portOfDischarge}</strong>
                    </span>
                    <span>
                      Border Post: <strong className="text-slate-800">{v.borderPost}</strong>
                    </span>
                    {v.vesselName && (
                      <span>
                        Vessel: <strong className="text-slate-800">{v.vesselName}</strong>
                      </span>
                    )}
                    {v.billOfLadingNumber && (
                      <span>
                        B/L: <strong className="text-slate-800">{v.billOfLadingNumber}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial & Valuation Breakdown */}
                <div className="grid grid-cols-3 gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center w-full lg:w-auto shrink-0">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total CIF</div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                      ${(v.totalCifUsd || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Est. ZIMRA Duty</div>
                    <div className="text-sm font-extrabold text-amber-700 mt-0.5">
                      ${((v.projectedDutyUsd || 0) + (v.projectedSurtaxUsd || 0) + (v.projectedVatUsd || 0)).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Market Resale</div>
                    <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
                      ${(v.projectedMarketValueUsd || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Actions & Paperwork Status */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2.5 w-full lg:w-auto shrink-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 justify-end">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{docCount} Advance Document{docCount !== 1 ? 's' : ''}</span>
                    {daysToArrival !== null && (
                      <span className="text-emerald-700 font-bold ml-1">
                        • {daysToArrival > 0 ? `${daysToArrival}d to Zim` : 'Arrived'}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/company/transit/${v.id}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-sm transition"
                  >
                    <span>Manage Paperwork & CRM</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
