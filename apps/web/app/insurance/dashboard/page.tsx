'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Loader2,
  ShieldCheck,
  FileText,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Ship,
  QrCode,
  DollarSign,
  Lock,
  X,
  RefreshCw,
} from 'lucide-react';

interface PreArrivalMeta {
  portOfDischarge?: string;
  expectedArrivalDate?: string;
  vehicleValueUsd?: number | null;
}

interface PolicyRecord {
  id: string;
  policyRef?: string;
  ownerName: string;
  phone: string;
  idNumber?: string;
  vehicleReg: string;
  vehicleType: string;
  coverageType: string;
  premium: number;
  currency?: string;
  paymentStatus: 'PENDING' | 'PAID' | string;
  paynowReference?: string;
  nearestBranch?: string;
  deliveryType?: string;
  deliveryAddress?: string | null;
  qrCodeUrl?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string;
  isPreArrival?: boolean;
  preArrivalMeta?: PreArrivalMeta | null;
  isLocalDemo?: boolean;
}

const PREVIEW_UNDERWRITING_QUEUE: PolicyRecord[] = [
  {
    id: 'demo-pol-1',
    policyRef: 'ZIM-PRE-2026-8841',
    ownerName: 'Tendai Mukamba',
    phone: '+263 77 312 8840',
    idNumber: '63-****-K-42',
    vehicleReg: 'PRE-TOYOTA-2021',
    vehicleType: '2021 Toyota Hilux GD-6',
    coverageType: 'COMPREHENSIVE',
    premium: 320,
    currency: 'USD',
    paymentStatus: 'PAID',
    paynowReference: 'INS-884102',
    nearestBranch: 'ZIMNAT',
    deliveryType: 'DIGITAL_IMPORT_COVER',
    deliveryAddress: 'PRE-ARRIVAL | Port: Dar es Salaam | ETA: 2026-11-28 | CIF: $25000',
    issuedAt: null,
    isPreArrival: true,
    preArrivalMeta: {
      portOfDischarge: 'Dar es Salaam',
      expectedArrivalDate: '2026-11-28',
      vehicleValueUsd: 25000,
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    isLocalDemo: true,
  },
  {
    id: 'demo-pol-2',
    policyRef: 'ZIM-PRE-2026-8839',
    ownerName: 'Chipo Chirisa',
    phone: '+263 78 901 4412',
    idNumber: 'PRE-ARRIVAL-KYC',
    vehicleReg: 'PRE-HONDA-2020',
    vehicleType: '2020 Honda Fit Hybrid',
    coverageType: 'THIRD_PARTY',
    premium: 120,
    currency: 'USD',
    paymentStatus: 'PENDING',
    paynowReference: 'INS-883914',
    nearestBranch: 'ZIMNAT',
    deliveryType: 'DIGITAL_IMPORT_COVER',
    deliveryAddress: 'PRE-ARRIVAL | Port: Durban | ETA: 2026-12-03 | CIF: $8500',
    issuedAt: null,
    isPreArrival: true,
    preArrivalMeta: {
      portOfDischarge: 'Durban',
      expectedArrivalDate: '2026-12-03',
      vehicleValueUsd: 8500,
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    isLocalDemo: true,
  },
  {
    id: 'demo-pol-3',
    policyRef: 'ZIM-REG-2026-7710',
    ownerName: 'Kudzai Ndlovu',
    phone: '+263 71 455 9011',
    idNumber: '08-****-M-19',
    vehicleReg: 'AGD 4821',
    vehicleType: '2018 Mercedes-Benz C200',
    coverageType: 'COMPREHENSIVE',
    premium: 180,
    currency: 'USD',
    paymentStatus: 'PAID',
    paynowReference: 'INS-771033',
    nearestBranch: 'ZIMNAT',
    deliveryType: 'DIGITAL',
    deliveryAddress: 'Harare CBD',
    issuedAt: new Date(Date.now() - 86400 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 364 * 86400 * 1000).toISOString(),
    isPreArrival: false,
    createdAt: new Date(Date.now() - 86400 * 1000 * 2).toISOString(),
    isLocalDemo: true,
  },
];

const LOCAL_IMPORT_STORAGE_KEY = 'famba_simple_import_policies';
const LOCAL_OVERRIDES_KEY = 'famba_insurer_demo_overrides';

function mapSimpleImportToPolicy(item: any): PolicyRecord {
  const ref = item.ref || `PRE-${Date.now().toString().slice(-5)}`;
  const regOrVin =
    item.vin && item.vin !== 'PENDING-KYC'
      ? item.vin
      : `PRE-${(item.make || 'IMP').toUpperCase()}-${item.yearOfManufacture || '2026'}`;

  return {
    id: `local-${ref}`,
    policyRef: ref,
    ownerName: item.ownerName || 'Simple Dealer Import',
    phone: item.phone || 'N/A',
    idNumber: 'PRE-ARRIVAL-KYC',
    vehicleReg: regOrVin,
    vehicleType: `${item.yearOfManufacture || ''} ${item.make || 'Vehicle'} ${item.model || ''}`.trim(),
    coverageType: item.coverageType || 'THIRD_PARTY',
    premium: Number(item.selectedPremiumUsd ?? item.premium ?? 120),
    currency: 'USD',
    paymentStatus: item.paymentStatus === 'PAID' || item.status === 'PAID' ? 'PAID' : 'PENDING',
    paynowReference: ref,
    nearestBranch: item.insurerCode || 'ZIMNAT',
    deliveryType: 'DIGITAL_IMPORT_COVER',
    deliveryAddress: `PRE-ARRIVAL | Port: ${item.portOfDischarge || 'Dar es Salaam'} | ETA: ${item.expectedArrivalDate || 'Pending'} | CIF: $${item.vehicleValueUsd || 0}`,
    issuedAt: item.issuedAt || null,
    expiresAt: item.expiresAt || null,
    isPreArrival: true,
    preArrivalMeta: {
      portOfDischarge: item.portOfDischarge || 'Dar es Salaam',
      expectedArrivalDate: item.expectedArrivalDate || 'Pending',
      vehicleValueUsd: Number(item.vehicleValueUsd) || null,
    },
    createdAt: item.createdAt || new Date().toISOString(),
    isLocalDemo: true,
  };
}

function buildInlineSvgQr(policy: PolicyRecord): string {
  const safeRef = (policy.policyRef || policy.paynowReference || policy.id).replace(/[^a-zA-Z0-9-]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="#ffffff"/><rect x="12" y="12" width="40" height="40" fill="#0B192C"/><rect x="20" y="20" width="24" height="24" fill="#ffffff"/><rect x="26" y="26" width="12" height="12" fill="#008767"/><rect x="108" y="12" width="40" height="40" fill="#0B192C"/><rect x="116" y="20" width="24" height="24" fill="#ffffff"/><rect x="122" y="26" width="12" height="12" fill="#008767"/><rect x="12" y="108" width="40" height="40" fill="#0B192C"/><rect x="20" y="116" width="24" height="24" fill="#ffffff"/><rect x="26" y="122" width="12" height="12" fill="#008767"/><rect x="64" y="20" width="12" height="12" fill="#0B192C"/><rect x="84" y="28" width="12" height="20" fill="#008767"/><rect x="64" y="64" width="32" height="32" fill="#008767"/><rect x="72" y="72" width="16" height="16" fill="#ffffff"/><rect x="104" y="72" width="36" height="12" fill="#0B192C"/><rect x="64" y="108" width="20" height="12" fill="#0B192C"/><rect x="96" y="112" width="44" height="16" fill="#008767"/><rect x="64" y="132" width="40" height="12" fill="#0B192C"/><text x="80" y="156" font-family="monospace" font-size="8" text-anchor="middle" fill="#64748b">${safeRef}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function InsuranceDashboard() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingPreviewMode, setUsingPreviewMode] = useState(false);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PRE_ARRIVAL' | 'PENDING' | 'READY' | 'ISSUED'>('ALL');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<PolicyRecord | null>(null);

  const partnerTitle = user?.role === 'ADMIN'
    ? 'Famba Admin — Insurer Queue'
    : user?.email?.toLowerCase().includes('zimra')
    ? 'ZIMRA Customs & Import Portal'
    : 'Zimnat Insurance Underwriter Portal';

  const getLocalOverrides = (): Record<string, Partial<PolicyRecord>> => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem(LOCAL_OVERRIDES_KEY) || '{}');
    } catch {
      return {};
    }
  };

  const saveLocalOverride = (id: string, patch: Partial<PolicyRecord>) => {
    if (typeof window === 'undefined') return;
    const current = getLocalOverrides();
    localStorage.setItem(
      LOCAL_OVERRIDES_KEY,
      JSON.stringify({ ...current, [id]: { ...(current[id] || {}), ...patch } })
    );
  };

  const loadLocalMergedQueue = (): PolicyRecord[] => {
    if (typeof window === 'undefined') return PREVIEW_UNDERWRITING_QUEUE;
    let dealerImports: PolicyRecord[] = [];
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_IMPORT_STORAGE_KEY) || '[]');
      if (Array.isArray(raw)) {
        dealerImports = raw.map(mapSimpleImportToPolicy);
      }
    } catch {
      dealerImports = [];
    }
    const overrides = getLocalOverrides();
    return [...dealerImports, ...PREVIEW_UNDERWRITING_QUEUE].map((p) => ({
      ...p,
      ...(overrides[p.id] || {}),
    }));
  };

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/insurance');
      const liveRows: PolicyRecord[] = res.data?.data || [];
      setPolicies(liveRows);
      setUsingPreviewMode(false);
    } catch {
      setPolicies(loadLocalMergedQueue());
      setUsingPreviewMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace('/auth/login?redirect=/insurance/dashboard');
      return;
    }

    if (user?.role === 'COMPANY_OWNER') {
      router.replace('/company/transit');
      return;
    }

    if (user?.role !== 'INSURANCE_AGENT' && user?.role !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }

    fetchPolicies();
  }, [isHydrated, isAuthenticated, user, router]);

  const confirmPayment = async (policy: PolicyRecord) => {
    setBusyId(policy.id);
    try {
      if (!policy.isLocalDemo && !usingPreviewMode) {
        const res = await apiClient.post(`/insurance/${policy.id}/confirm-payment`);
        const updated = res.data?.data;
        setPolicies((prev) => prev.map((p) => (p.id === policy.id ? updated : p)));
      } else {
        saveLocalOverride(policy.id, { paymentStatus: 'PAID' });
        setPolicies((prev) =>
          prev.map((p) => (p.id === policy.id ? { ...p, paymentStatus: 'PAID' } : p))
        );
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to confirm payment.');
    } finally {
      setBusyId(null);
    }
  };

  const issuePolicy = async (policy: PolicyRecord) => {
    setBusyId(policy.id);
    try {
      if (!policy.isLocalDemo && !usingPreviewMode) {
        const res = await apiClient.post(`/insurance/${policy.id}/issue`);
        const updated = res.data?.data;
        setPolicies((prev) => prev.map((p) => (p.id === policy.id ? updated : p)));
        setSelectedCert(updated);
      } else {
        const issuedAt = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 365 * 86400 * 1000).toISOString();
        const qrCodeUrl = buildInlineSvgQr(policy);
        saveLocalOverride(policy.id, { paymentStatus: 'PAID', issuedAt, expiresAt, qrCodeUrl });
        const updated: PolicyRecord = {
          ...policy,
          paymentStatus: 'PAID',
          issuedAt,
          expiresAt,
          qrCodeUrl,
        };
        setPolicies((prev) => prev.map((p) => (p.id === policy.id ? updated : p)));
        setSelectedCert(updated);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to issue policy.');
    } finally {
      setBusyId(null);
    }
  };

  const downloadCertificateText = (policy: PolicyRecord) => {
    const lines = [
      '====================================================',
      'FAMBA MOBILITY x ZIMNAT UNDERWRITING CERTIFICATE',
      '====================================================',
      `Policy Reference: ${policy.policyRef || policy.paynowReference || policy.id}`,
      `Policyholder: ${policy.ownerName} (${policy.phone})`,
      `Vehicle: ${policy.vehicleType}`,
      `VIN / Reg Plate: ${policy.vehicleReg}`,
      `Coverage Tier: ${policy.coverageType.replace('_', ' ')}`,
      `Annual Premium: $${Number(policy.premium || 0).toFixed(2)} ${policy.currency || 'USD'}`,
      `Payment Status: ${policy.paymentStatus}`,
      `Issued Date: ${policy.issuedAt ? new Date(policy.issuedAt).toLocaleDateString() : 'Pending'}`,
      `Expiry Date: ${policy.expiresAt ? new Date(policy.expiresAt).toLocaleDateString() : 'Pending'}`,
      policy.isPreArrival && policy.preArrivalMeta
        ? `Border Route: ${policy.preArrivalMeta.portOfDischarge || 'Dar es Salaam'} (ETA: ${policy.preArrivalMeta.expectedArrivalDate || 'Pending'})`
        : `Branch / Channel: ${policy.nearestBranch || 'ZIMNAT'}`,
      '====================================================',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Zimnat-Policy-${policy.policyRef || policy.vehicleReg}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const total = policies.length;
    const pendingPayment = policies.filter((p) => p.paymentStatus !== 'PAID').length;
    const readyToIssue = policies.filter((p) => p.paymentStatus === 'PAID' && !p.issuedAt).length;
    const issued = policies.filter((p) => !!p.issuedAt).length;
    const totalPremiumUsd = policies
      .filter((p) => p.paymentStatus === 'PAID')
      .reduce((acc, p) => acc + (Number(p.premium) || 0), 0);
    return { total, pendingPayment, readyToIssue, issued, totalPremiumUsd };
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      const matchesTab =
        filterTab === 'ALL' ||
        (filterTab === 'PRE_ARRIVAL' && (p.isPreArrival || p.vehicleReg?.startsWith('PRE-'))) ||
        (filterTab === 'PENDING' && p.paymentStatus !== 'PAID') ||
        (filterTab === 'READY' && p.paymentStatus === 'PAID' && !p.issuedAt) ||
        (filterTab === 'ISSUED' && !!p.issuedAt);

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.ownerName?.toLowerCase().includes(q) ||
        p.vehicleReg?.toLowerCase().includes(q) ||
        p.vehicleType?.toLowerCase().includes(q) ||
        p.policyRef?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [policies, filterTab, search]);

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFCFB]">
        <Loader2 className="w-8 h-8 animate-spin text-[#008767]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex flex-col text-[#0B192C]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-28 pb-14">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#008767]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                <Lock className="w-3 h-3 text-[#008767]" /> Scoped Partner Queue • Zero Dealership Margin Access
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0B192C]">
                {partnerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Prepare quotes, reconcile Paynow payments, and issue digital QR policies for pre-arrival imports & registered vehicles.
              </p>
            </div>
          </div>

          <button
            onClick={fetchPolicies}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#008767] text-xs font-bold text-slate-700 transition self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#008767]" /> Refresh Queue
          </button>
        </div>

        {usingPreviewMode && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between gap-3">
            <span>
              Preview Sandbox Active: Showing local demo underwriting queue plus any quotes submitted from Simple Dealer Import Cover on this browser.
            </span>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>Total Queue</span>
              <FileText className="w-4 h-4 text-[#008767]" />
            </div>
            <p className="text-2xl font-display font-extrabold text-[#0B192C]">{stats.total}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Scoped insurance requests</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>Pending Settlement</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-display font-extrabold text-amber-600">{stats.pendingPayment}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting Paynow / office confirmation</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>Ready to Issue</span>
              <QrCode className="w-4 h-4 text-[#008767]" />
            </div>
            <p className="text-2xl font-display font-extrabold text-[#008767]">{stats.readyToIssue}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Paid & awaiting digital disc</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>Settled Premiums</span>
              <DollarSign className="w-4 h-4 text-[#008767]" />
            </div>
            <p className="text-2xl font-display font-extrabold text-[#0B192C]">${stats.totalPremiumUsd.toLocaleString()}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{stats.issued} active QR discs issued</p>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: `All (${policies.length})` },
              { id: 'PRE_ARRIVAL', label: 'Pre-Arrival Imports' },
              { id: 'PENDING', label: `Pending Payment (${stats.pendingPayment})` },
              { id: 'READY', label: `Ready to Issue (${stats.readyToIssue})` },
              { id: 'ISSUED', label: `Issued (${stats.issued})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                  filterTab === tab.id
                    ? 'bg-[#008767] text-white border-[#008767] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search owner, VIN, plate, or ref..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
            />
          </div>
        </div>

        {/* Policies Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-5">Policy & Holder</th>
                  <th className="py-4 px-5">Vehicle / Import Route</th>
                  <th className="py-4 px-5">Cover & Premium</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Underwriter Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPolicies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 text-xs font-semibold">
                      No insurance requests match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredPolicies.map((policy) => (
                    <tr key={policy.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5 align-top">
                        <p className="font-bold text-[#0B192C]">{policy.ownerName}</p>
                        <p className="text-xs text-slate-500">{policy.phone}</p>
                        <p className="text-[11px] font-mono text-slate-400 mt-1">
                          Ref: {policy.policyRef || policy.paynowReference || policy.id}
                        </p>
                      </td>

                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0B192C]">{policy.vehicleReg}</span>
                          {policy.isPreArrival && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold">
                              <Ship className="w-3 h-3" /> Pre-Arrival
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{policy.vehicleType}</p>
                        {policy.preArrivalMeta && (
                          <p className="text-[11px] text-slate-400 mt-1">
                            Port: {policy.preArrivalMeta.portOfDischarge} • ETA: {policy.preArrivalMeta.expectedArrivalDate}
                            {policy.preArrivalMeta.vehicleValueUsd ? ` • CIF $${policy.preArrivalMeta.vehicleValueUsd.toLocaleString()}` : ''}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-5 align-top">
                        <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full">
                          {policy.coverageType.replace('_', ' ')}
                        </span>
                        <p className="text-sm font-extrabold text-[#0B192C] mt-1.5">
                          ${Number(policy.premium || 0).toFixed(2)} {policy.currency || 'USD'}
                        </p>
                      </td>

                      <td className="py-4 px-5 align-top">
                        <div className="flex flex-col items-start gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                              policy.paymentStatus === 'PAID'
                                ? 'bg-[#E6F4F1] text-[#008767] border-[#B2E3D8]'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {policy.paymentStatus}
                          </span>
                          {policy.issuedAt && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#008767]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Disc Issued
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          {policy.paymentStatus !== 'PAID' && (
                            <button
                              onClick={() => confirmPayment(policy)}
                              disabled={busyId === policy.id}
                              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition disabled:opacity-50"
                            >
                              {busyId === policy.id ? 'Updating...' : 'Confirm Payment'}
                            </button>
                          )}

                          {policy.paymentStatus === 'PAID' && !policy.issuedAt && (
                            <button
                              onClick={() => issuePolicy(policy)}
                              disabled={busyId === policy.id}
                              className="px-3.5 py-1.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white text-xs font-bold transition disabled:opacity-50"
                            >
                              {busyId === policy.id ? 'Issuing...' : 'Issue Policy & QR'}
                            </button>
                          )}

                          {policy.issuedAt && (
                            <button
                              onClick={() => setSelectedCert(policy)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6F4F1] hover:bg-[#d5ece7] text-[#008767] text-xs font-bold transition"
                            >
                              <QrCode className="w-3.5 h-3.5" /> Certificate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Digital Policy Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#008767] bg-[#E6F4F1] px-2.5 py-0.5 rounded-full">
                  Digital Policy Disc
                </span>
                <h2 className="text-lg font-display font-extrabold text-[#0B192C] mt-1.5">
                  {selectedCert.vehicleType}
                </h2>
                <p className="text-xs text-slate-500">Ref: {selectedCert.policyRef || selectedCert.paynowReference}</p>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <img
                src={selectedCert.qrCodeUrl || buildInlineSvgQr(selectedCert)}
                alt="Policy QR Code"
                className="w-40 h-40 object-contain rounded-xl bg-white p-2 border border-slate-100"
              />
            </div>

            <div className="text-xs space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Policyholder</span>
                <span className="font-bold text-[#0B192C]">{selectedCert.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">VIN / Reg</span>
                <span className="font-bold text-[#0B192C]">{selectedCert.vehicleReg}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coverage</span>
                <span className="font-bold text-[#008767]">{selectedCert.coverageType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Premium Settled</span>
                <span className="font-bold text-[#0B192C]">${Number(selectedCert.premium || 0).toFixed(2)} USD</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadCertificateText(selectedCert)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white text-xs font-bold transition"
              >
                <Download className="w-4 h-4" /> Download Schedule
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
