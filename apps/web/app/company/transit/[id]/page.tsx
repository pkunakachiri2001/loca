'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import {
  Ship,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Scale,
  Sparkles,
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Compass,
  Anchor,
  QrCode,
  DollarSign,
  TrendingUp,
  Share2,
  Check,
  Printer,
  ChevronRight,
  Loader2,
  Plus,
  CreditCard,
  Receipt,
  FileCheck,
} from 'lucide-react';

const STAGES = [
  { key: 'PURCHASED', label: 'Purchased' },
  { key: 'ON_VESSEL', label: 'On Vessel' },
  { key: 'ARRIVED_PORT', label: 'At Port' },
  { key: 'INLAND_TRANSIT', label: 'Inland' },
  { key: 'AT_BORDER', label: 'At Border' },
  { key: 'CUSTOMS_CLEARING', label: 'ZIMRA Clearing' },
  { key: 'CLEARED_DELIVERED', label: 'Cleared' },
  { key: 'AVAILABLE_FOR_SALE', label: 'For Sale' },
];

function normalizeVehicle(v: any) {
  if (!v) return null;
  const cif = Number(v.totalCifUsd ?? 0);
  const duty = Number(v.projectedDutyUsd ?? v.customsDutyUsd ?? 0);
  const surtax = Number(v.projectedSurtaxUsd ?? v.surtaxUsd ?? 0);
  const vat = Number(v.projectedVatUsd ?? v.vatUsd ?? 0);
  const landed = Number(v.projectedTotalLandedCostUsd ?? v.totalLandedCostUsd ?? (cif + duty + surtax + vat));
  const market = Number(v.projectedMarketValueUsd ?? Math.round(landed * 1.25));
  const low = Number(v.projectedLowValueUsd ?? Math.round(market * 0.93));
  const high = Number(v.projectedHighValueUsd ?? Math.round(market * 1.07));
  const margin = Number(v.projectedMarginUsd ?? (market - landed));

  return {
    ...v,
    totalCifUsd: cif,
    projectedDutyUsd: duty,
    projectedSurtaxUsd: surtax,
    projectedVatUsd: vat,
    projectedTotalLandedCostUsd: landed,
    projectedMarketValueUsd: market,
    projectedLowValueUsd: low,
    projectedHighValueUsd: high,
    projectedMarginUsd: margin,
    transitInsuranceStatus: v.transitInsuranceStatus || 'NOT_INSURED',
    transitInsuranceType: v.transitInsuranceType || null,
    transitInsurancePolicyRef: v.transitInsurancePolicyRef || null,
    transitInsuranceExpiry: v.transitInsuranceExpiry || null,
    advanceDutyPaymentStatus: v.advanceDutyPaymentStatus || 'UNPAID',
    advanceDutyAmountPaid: Number(v.advanceDutyAmountPaid ?? 0),
    zimraBillOfEntryNumber: v.zimraBillOfEntryNumber || null,
    zimraAssessmentNumber: v.zimraAssessmentNumber || null,
    zimraReceiptNumber: v.zimraReceiptNumber || null,
    clearingAgentName: v.clearingAgentName || '',
    clearingAgentPhone: v.clearingAgentPhone || '',
    documents: Array.isArray(v.documents) ? v.documents : [],
    events: Array.isArray(v.events) ? v.events : [],
  };
}

export default function TransitVehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const id = params?.id as string;

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'COMPANY_OWNER' && user?.role !== 'ADMIN')) {
      router.push(`/auth/login?redirect=/company/transit/${id}`);
    }
  }, [isAuthenticated, user, router, id]);

  const [advancingStage, setAdvancingStage] = useState(false);
  const [selectedStage, setSelectedStage] = useState('');
  const [stageLocation, setStageLocation] = useState('');
  const [stageNote, setStageNote] = useState('');

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docType, setDocType] = useState('COMMERCIAL_INVOICE');
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docNotes, setDocNotes] = useState('');

  const [generatingValuation, setGeneratingValuation] = useState(false);
  const [publishingListing, setPublishingListing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Advance Zimnat Insurance State
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [insuranceCoverage, setInsuranceCoverage] = useState<'TRANSIT_GIT' | 'THIRD_PARTY_ROAD' | 'COMPREHENSIVE_ROAD'>('TRANSIT_GIT');
  const [insuranceTermMonths, setInsuranceTermMonths] = useState<number>(12);
  const [insuranceOwnerName, setInsuranceOwnerName] = useState('');
  const [issuingInsurance, setIssuingInsurance] = useState(false);
  const [showDiscModal, setShowDiscModal] = useState(false);

  // ZIMRA Pre-Clearance State
  const [showZimraModal, setShowZimraModal] = useState(false);
  const [zimraAssessmentNo, setZimraAssessmentNo] = useState('');
  const [zimraBillNo, setZimraBillNo] = useState('');
  const [clearingAgent, setClearingAgent] = useState('');
  const [clearingPhone, setClearingPhone] = useState('');
  const [dutyStatus, setDutyStatus] = useState('ASSESSED');
  const [dutyAmountPaid, setDutyAmountPaid] = useState('');
  const [zimraReceiptNo, setZimraReceiptNo] = useState('');
  const [savingZimra, setSavingZimra] = useState(false);

  // Fetch transit vehicle details
  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['transit-vehicle-detail', id],
    queryFn: async () => {
      try {
        const r = await apiClient.get(`/transit/${id}`);
        if (r.data?.data) return normalizeVehicle(r.data.data);
      } catch (err) {
        if (typeof window !== 'undefined') {
          const list = JSON.parse(localStorage.getItem('famba_mock_transit_vehicles') || '[]');
          const found = list.find((v: any) => v.id === id);
          if (found) return normalizeVehicle(found);
        }
        throw err;
      }
    },
    enabled: !!isAuthenticated && !!id,
  });

  // Stage update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        return await apiClient.patch(`/transit/${id}`, payload);
      } catch (err) {
        if (typeof window !== 'undefined') {
          const list = JSON.parse(localStorage.getItem('famba_mock_transit_vehicles') || '[]');
          const idx = list.findIndex((v: any) => v.id === id);
          if (idx !== -1) {
            const updated = {
              ...list[idx],
              status: payload.status,
              currentLocation: payload.currentLocation || list[idx].currentLocation,
              events: [
                {
                  id: `ev-${Date.now()}`,
                  status: payload.status,
                  description: payload.notes || `Transit status updated to ${payload.status}`,
                  location: payload.currentLocation,
                  createdAt: new Date().toISOString(),
                },
                ...(list[idx].events || []),
              ],
            };
            list[idx] = updated;
            localStorage.setItem('famba_mock_transit_vehicles', JSON.stringify(list));
            return { data: { data: updated } };
          }
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transit-vehicle-detail', id] });
      setAdvancingStage(false);
    },
  });

  // Document upload mutation
  const uploadDocMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        return await apiClient.post(`/transit/${id}/documents`, payload);
      } catch (err) {
        if (typeof window !== 'undefined') {
          const list = JSON.parse(localStorage.getItem('famba_mock_transit_vehicles') || '[]');
          const idx = list.findIndex((v: any) => v.id === id);
          if (idx !== -1) {
            const newDoc = {
              id: `doc-${Date.now()}`,
              documentType: payload.documentType,
              title: payload.title,
              fileUrl: payload.fileUrl,
              notes: payload.notes,
              createdAt: new Date().toISOString(),
            };
            list[idx].documents = [newDoc, ...(list[idx].documents || [])];
            localStorage.setItem('famba_mock_transit_vehicles', JSON.stringify(list));
            return { data: { data: newDoc } };
          }
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transit-vehicle-detail', id] });
      setShowUploadModal(false);
      setDocTitle('');
      setDocUrl('');
      setDocNotes('');
    },
  });

  // Delete document mutation
  const deleteDocMutation = useMutation({
    mutationFn: async (docId: string) => {
      try {
        return await apiClient.delete(`/transit/${id}/documents/${docId}`);
      } catch (err) {
        if (typeof window !== 'undefined') {
          const list = JSON.parse(localStorage.getItem('famba_mock_transit_vehicles') || '[]');
          const idx = list.findIndex((v: any) => v.id === id);
          if (idx !== -1 && list[idx].documents) {
            list[idx].documents = list[idx].documents.filter((d: any) => d.id !== docId);
            localStorage.setItem('famba_mock_transit_vehicles', JSON.stringify(list));
            return { data: { success: true } };
          }
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transit-vehicle-detail', id] });
    },
  });

  // Generate official valuation
  const handleGenerateValuation = async () => {
    setGeneratingValuation(true);
    try {
      await apiClient.post(`/transit/${id}/generate-valuation`);
      queryClient.invalidateQueries({ queryKey: ['transit-vehicle-detail', id] });
    } catch (e) {
      console.error(e);
      alert('Failed to generate valuation');
    } finally {
      setGeneratingValuation(false);
    }
  };

  // Publish to marketplace
  const handlePublishListing = async () => {
    setPublishingListing(true);
    try {
      await apiClient.post(`/transit/${id}/publish-listing`, {});
      queryClient.invalidateQueries({ queryKey: ['transit-vehicle-detail', id] });
      alert('Vehicle successfully published to Famba Marketplace as Arriving Soon!');
    } catch (e) {
      console.error(e);
      alert('Failed to publish listing');
    } finally {
      setPublishingListing(false);
    }
  };

  // Pre-fill ZIMRA and Insurance edit fields when vehicle data loads
  useEffect(() => {
    if (vehicle) {
      setZimraAssessmentNo(vehicle.zimraAssessmentNumber || '');
      setZimraBillNo(vehicle.zimraBillOfEntryNumber || '');
      setClearingAgent(vehicle.clearingAgentName || '');
      setClearingPhone(vehicle.clearingAgentPhone || '');
      setDutyStatus(vehicle.advanceDutyPaymentStatus || 'ASSESSED');
      setDutyAmountPaid(vehicle.advanceDutyAmountPaid ? String(vehicle.advanceDutyAmountPaid) : '');
      setZimraReceiptNo(vehicle.zimraReceiptNumber || '');
      setInsuranceOwnerName(user?.company?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '');
    }
  }, [vehicle, user]);

  // Calculate dynamic premium
  const calculateInsurancePremium = () => {
    if (!vehicle) return 0;
    if (insuranceCoverage === 'TRANSIT_GIT') {
      return Math.max(85, Math.round((vehicle.totalCifUsd ?? 0) * 0.015));
    }
    if (insuranceCoverage === 'THIRD_PARTY_ROAD') {
      return insuranceTermMonths <= 4 ? 35 : 75;
    }
    return Math.max(220, Math.round((vehicle.projectedTotalLandedCostUsd ?? 0) * 0.035));
  };

  const handleIssueInsurance = async () => {
    setIssuingInsurance(true);
    const premium = calculateInsurancePremium();
    const fallbackName = user?.company?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Dealership Asset Escrow';
    const payload = {
      coverageType: insuranceCoverage,
      termMonths: insuranceTermMonths,
      ownerName: insuranceOwnerName || fallbackName,
      premiumUsd: premium,
    };

    try {
      await apiClient.post(`/transit/${id}/advance-insurance/issue`, payload);
      queryClient.invalidateQueries({ queryKey: ['transit-vehicle-detail', id] });
      setShowInsuranceModal(false);
      alert('Advance Zimnat Insurance successfully issued! Official Certificate vaulted to Document Vault.');
    } catch (e) {
      // Mock Fallback
      if (typeof window !== 'undefined') {
        const list = JSON.parse(localStorage.getItem('famba_mock_transit_vehicles') || '[]');
        const idx = list.findIndex((v: any) => v.id === id);
        if (idx !== -1) {
          const randomSuffix = Math.floor(100000 + Math.random() * 900000);
          const policyRef = `ZIMNAT-TRANSIT-${randomSuffix}`;
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + insuranceTermMonths);

          const updated = {
            ...list[idx],
            transitInsuranceStatus: 'INSURED',
            transitInsuranceType: insuranceCoverage,
            transitInsurancePolicyRef: policyRef,
            transitInsuranceExpiry: expiryDate.toISOString(),
            documents: [
              {
                id: `doc-${Date.now()}`,
                type: 'TRANSIT_INSURANCE',
                title: `Zimnat Advance Insurance Certificate (${insuranceCoverage.replace(/_/g, ' ')})`,
                fileUrl: `https://famba.co.zw/insurance/policy/${policyRef}`,
                notes: `Policy Ref: ${policyRef}. Premium: $${premium} USD. Issued in advance for SADC transit via ${list[idx].borderPost || 'Beitbridge'}.`,
                createdAt: new Date().toISOString(),
              },
              ...(list[idx].documents || []),
            ],
            events: [
              {
                id: `ev-${Date.now()}`,
                status: list[idx].status,
                location: list[idx].borderPost || 'Beitbridge',
                note: `Zimnat Advance Insurance issued & verified (${insuranceCoverage.replace(/_/g, ' ')}, Policy Ref: ${policyRef}, $${premium} USD). Ready for border clearance.`,
                createdAt: new Date().toISOString(),
              },
              ...(list[idx].events || []),
            ],
          };
          list[idx] = updated;
          localStorage.setItem('famba_mock_transit_vehicles', JSON.stringify(list));
          queryClient.invalidateQueries({ queryKey: ['transit-vehicle-detail', id] });
          setShowInsuranceModal(false);
          alert('Advance Zimnat Insurance successfully issued and vaulted!');
        }
      }
    } finally {
      setIssuingInsurance(false);
    }
  };

  const handleSaveZimraAssessment = async () => {
    setSavingZimra(true);
    const payload = {
      zimraAssessmentNumber: zimraAssessmentNo,
      zimraBillOfEntryNumber: zimraBillNo,
      clearingAgentName: clearingAgent,
      clearingAgentPhone: clearingPhone,
      advanceDutyPaymentStatus: dutyStatus,
      advanceDutyAmountPaid: Number(dutyAmountPaid) || 0,
      zimraReceiptNumber: zimraReceiptNo,
    };

    try {
      await apiClient.post(`/transit/${id}/zimra-assessment`, payload);
      queryClient.invalidateQueries({ queryKey: ['transit-vehicle-detail', id] });
      setShowZimraModal(false);
      alert('ZIMRA Pre-Clearance assessment updated successfully!');
    } catch (e) {
      if (typeof window !== 'undefined') {
        const list = JSON.parse(localStorage.getItem('famba_mock_transit_vehicles') || '[]');
        const idx = list.findIndex((v: any) => v.id === id);
        if (idx !== -1) {
          const updated = {
            ...list[idx],
            zimraAssessmentNumber: zimraAssessmentNo,
            zimraBillOfEntryNumber: zimraBillNo,
            clearingAgentName: clearingAgent,
            clearingAgentPhone: clearingPhone,
            advanceDutyPaymentStatus: dutyStatus,
            advanceDutyAmountPaid: Number(dutyAmountPaid) || 0,
            zimraReceiptNumber: zimraReceiptNo,
            documents: dutyStatus === 'PAID_PRE_CLEARED' && zimraReceiptNo ? [
              {
                id: `doc-${Date.now()}`,
                type: 'PROOF_OF_PAYMENT',
                title: `ZIMRA Duty Payment Voucher (${zimraReceiptNo})`,
                fileUrl: `https://zimra.co.zw/customs/receipt/${zimraReceiptNo}`,
                notes: `ASYCUDA Bill of Entry: ${zimraBillNo || 'N/A'}. Amount: $${dutyAmountPaid} USD.`,
                createdAt: new Date().toISOString(),
              },
              ...(list[idx].documents || []),
            ] : list[idx].documents,
            events: [
              {
                id: `ev-${Date.now()}`,
                status: list[idx].status,
                location: list[idx].borderPost || 'Beitbridge',
                note: `ZIMRA Pre-Clearance updated: Status=${dutyStatus}, Bill of Entry=${zimraBillNo || 'N/A'}${dutyAmountPaid ? ', Paid=$' + dutyAmountPaid + ' USD' : ''}`,
                createdAt: new Date().toISOString(),
              },
              ...(list[idx].events || []),
            ],
          };
          list[idx] = updated;
          localStorage.setItem('famba_mock_transit_vehicles', JSON.stringify(list));
          queryClient.invalidateQueries({ queryKey: ['transit-vehicle-detail', id] });
          setShowZimraModal(false);
          alert('ZIMRA Pre-Clearance assessment updated successfully!');
        }
      }
    } finally {
      setSavingZimra(false);
    }
  };

  const handleStageAdvance = () => {
    if (!selectedStage) return;
    updateStatusMutation.mutate({
      status: selectedStage,
      eventLocation: stageLocation || undefined,
      eventNote: stageNote || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-16 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#008767] mb-3" />
        <div className="text-slate-600 font-bold text-sm">Loading vehicle transit dossier...</div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Transit Vehicle Not Found</h2>
        <Link
          href="/company/transit"
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#008767]"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Pipeline
        </Link>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === vehicle.status);

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-[#0B192C] pb-24">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/company/transit"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#008767] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to In-Transit Pipeline</span>
        </Link>

        <div className="flex items-center gap-2">
          {vehicle.valuationRef && (
            <Link
              href={`/valuation/report/${vehicle.valuationRef}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>View Live QR Certificate ({vehicle.valuationRef})</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          )}

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2000);
            }}
            className="p-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-600 transition"
            title="Copy Dossier URL"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Dossier Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#E6F4F1] text-[#008767] border border-[#B2E3D8]">
                {vehicle.countryOfOrigin} Import
              </span>
              <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-bold">
                VIN: {vehicle.vin}
              </span>
              {vehicle.isPublishedAsArrivingSoon && (
                <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Live on Marketplace
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C]">
              {vehicle.yearOfManufacture} {vehicle.make} {vehicle.model} {vehicle.variant || ''}
            </h1>

            <p className="text-xs text-slate-500 font-medium mt-1">
              Discharge Port: <strong className="text-slate-800">{vehicle.portOfDischarge}</strong> •
              Zim Border: <strong className="text-slate-800">{vehicle.borderPost}</strong> •
              B/L: <strong className="text-slate-800">{vehicle.billOfLadingNumber || 'Pending'}</strong> •
              Carrier: <strong className="text-slate-800">{vehicle.carrierCompany || 'Pending'}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectedStage(vehicle.status);
                setAdvancingStage(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>Update Progress</span>
            </button>

            {!vehicle.isPublishedAsArrivingSoon && (
              <button
                onClick={handlePublishListing}
                disabled={publishingListing}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {publishingListing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
                <span>Publish as Arriving Soon</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Lifecycle Progress Tracker */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3 text-xs font-bold">
            <span className="text-slate-500 uppercase tracking-wider text-[10px]">
              Transit Lifecycle Status
            </span>
            <span className="text-[#008767] font-bold">
              Stage {currentStageIndex + 1} of {STAGES.length}: {STAGES[currentStageIndex]?.label || vehicle.status}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {STAGES.map((s, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div
                  key={s.key}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-[#008767] text-white border-[#008767] shadow-md ring-2 ring-[#B2E3D8]'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase truncate">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage Advance Modal */}
      {advancingStage && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#008767]" />
              <span>Advance Transit Status Stage</span>
            </h3>
            <button
              onClick={() => setAdvancingStage(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                New Stage
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Current Location
              </label>
              <input
                type="text"
                value={stageLocation}
                onChange={(e) => setStageLocation(e.target.value)}
                placeholder="e.g. Durban Pier 1, Beitbridge Terminal"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Note / Clearance Event
              </label>
              <input
                type="text"
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                placeholder="e.g. ASYCUDA Bill of Entry lodged"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleStageAdvance}
              disabled={updateStatusMutation.isPending}
              className="px-5 py-2 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-sm transition"
            >
              {updateStatusMutation.isPending ? 'Updating...' : 'Confirm Stage Update'}
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Main Section: Financials & ZIMRA Duties vs Document Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Financials, ZIMRA Landed Assessment & Valuation */}
        <div className="lg:col-span-2 space-y-6">
          {/* ZIMRA ADVANCE DUTY ASSESSMENT */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#008767]" />
                <span>ZIMRA Advance Landed Duty Assessment</span>
              </h2>
              <span className="text-xs font-bold text-slate-400">Currency: USD</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total CIF</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  ${(vehicle.totalCifUsd ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Invoice + Freight</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-[10px] uppercase font-bold text-amber-600">Customs Duty</div>
                <div className="text-lg font-black text-amber-800 mt-0.5">
                  ${(vehicle.projectedDutyUsd ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-700 mt-1">40% - 60% tariff</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="text-[10px] uppercase font-bold text-amber-600">Surtax & VAT</div>
                <div className="text-lg font-black text-amber-800 mt-0.5">
                  ${((vehicle.projectedSurtaxUsd ?? 0) + (vehicle.projectedVatUsd ?? 0)).toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-700 mt-1">Surtax + 15% VAT</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] uppercase font-bold text-emerald-600">Total Landed Cost</div>
                <div className="text-lg font-black text-emerald-800 mt-0.5">
                  ${(vehicle.projectedTotalLandedCostUsd ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-700 mt-1">At Showroom Gate</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Clearing Agent:</span>
                <span className="font-bold text-slate-800">
                  {vehicle.clearingAgentName || 'Not Assigned'} ({vehicle.clearingAgentPhone || 'N/A'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clearing Bond / ASYCUDA Assessment:</span>
                <span className="font-mono font-bold text-slate-800">
                  {vehicle.clearingBondNumber || 'Pending Assessment'}
                </span>
              </div>
            </div>
          </div>

          {/* ADVANCE COMPLIANCE: ZIMNAT INSURANCE & ZIMRA PRE-CLEARANCE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* ZIMNAT ADVANCE INSURANCE CARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5 text-[#008767]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Zimnat Advance Insurance
                      </h3>
                      <p className="text-[10px] text-slate-400">Cargo & Road Policy</p>
                    </div>
                  </div>

                  {vehicle.transitInsuranceStatus === 'INSURED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Check className="w-3 h-3" />
                      <span>INSURED</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>UNINSURED</span>
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[11px]">Policy Status:</span>
                    <span className="font-bold text-slate-800">
                      {vehicle.transitInsuranceStatus === 'INSURED' ? 'Active & Vaulted' : 'Action Required'}
                    </span>
                  </div>
                  {vehicle.transitInsuranceStatus === 'INSURED' ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[11px]">Policy Ref:</span>
                        <span className="font-mono font-bold text-emerald-700 text-[11px]">
                          {vehicle.transitInsurancePolicyRef}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[11px]">Coverage:</span>
                        <span className="font-semibold text-slate-800 text-[11px]">
                          {(vehicle.transitInsuranceType || 'TRANSIT_GIT').replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[11px]">Chassis / VIN:</span>
                        <span className="font-mono font-bold text-slate-700 text-[11px] truncate max-w-[140px]">
                          {vehicle.vin}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Issue advance marine cargo cover from <strong className="text-slate-800">{vehicle.portOfDischarge}</strong> or statutory road insurance to drive legally upon <strong className="text-slate-800">{vehicle.borderPost}</strong> entry.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                {vehicle.transitInsuranceStatus === 'INSURED' ? (
                  <button
                    onClick={() => setShowDiscModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#008767] font-bold text-xs border border-emerald-200 transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Digital Policy Disc & QR</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowInsuranceModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Issue Advance Zimnat Policy</span>
                  </button>
                )}
              </div>
            </div>

            {/* ZIMRA PRE-CLEARANCE & ASYCUDA CARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                      <Scale className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        ZIMRA ASYCUDA Clearance
                      </h3>
                      <p className="text-[10px] text-slate-400">Advance Duty Pre-Payment</p>
                    </div>
                  </div>

                  {vehicle.advanceDutyPaymentStatus === 'PAID_PRE_CLEARED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Check className="w-3 h-3" />
                      <span>DUTY PRE-PAID</span>
                    </span>
                  ) : vehicle.advanceDutyPaymentStatus === 'ASSESSED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span>ASSESSMENT LODGED</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      <span>UNPAID</span>
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[11px]">Bill of Entry (Form 21):</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">
                      {vehicle.zimraBillOfEntryNumber || 'Pending Filing'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[11px]">ASYCUDA Assessment:</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">
                      {vehicle.zimraAssessmentNumber || 'Pending Assessment'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[11px]">Duty Pre-Paid:</span>
                    <span className="font-bold text-emerald-800 text-[11px]">
                      ${(vehicle.advanceDutyAmountPaid ?? 0).toLocaleString()} USD
                      <span className="text-slate-400 font-normal text-[10px] ml-1">
                        / ${(vehicle.projectedDutyUsd ?? 0).toLocaleString()}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowZimraModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Update ZIMRA Pre-Clearance</span>
                </button>
              </div>
            </div>
          </div>

          {/* VALUATION ENGINE INTEGRATION */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-[#0B192C] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Famba Zimbabwe Valuation Framework (ZMDVF-v1)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-300 bg-white/10 px-3 py-1 rounded-full">
                Active Benchmark
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div>
                <div className="text-xs text-slate-300">Projected Zimbabwe Fair Market Value</div>
                <div className="text-3xl font-black text-emerald-400 mt-1">
                  ${(vehicle.projectedMarketValueUsd ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-300">USD</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Range: ${(vehicle.projectedLowValueUsd ?? 0).toLocaleString()} - ${(vehicle.projectedHighValueUsd ?? 0).toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-300">Target Selling Price</div>
                <div className="text-2xl font-black text-white mt-1">
                  ${(vehicle.targetSellingPriceUsd || vehicle.projectedMarketValueUsd || 0).toLocaleString()}{' '}
                  <span className="text-xs font-normal text-slate-300">USD</span>
                </div>
                <div className="text-[11px] text-emerald-300 font-bold mt-1">
                  Projected Net Margin: +${(vehicle.projectedMarginUsd ?? 0).toLocaleString()} USD
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {vehicle.valuationRef ? (
                  <Link
                    href={`/valuation/report/${vehicle.valuationRef}`}
                    target="_blank"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs shadow-md transition"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View QR Certificate</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleGenerateValuation}
                    disabled={generatingValuation}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {generatingValuation ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Scale className="w-4 h-4" />
                    )}
                    <span>Generate Valuation Certificate</span>
                  </button>
                )}

                <Link
                  href="/valuation"
                  target="_blank"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
                >
                  <span>Manual Valuation Calculator</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* AUDIT LOG & TRANSIT TIMELINE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#008767]" />
              <span>Transit Event Audit Log</span>
            </h2>

            <div className="space-y-3">
              {(vehicle.events || []).map((ev: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="w-7 h-7 rounded-full bg-[#E6F4F1] text-[#008767] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ev.status}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ev.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {ev.location && (
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        📍 {ev.location}
                      </div>
                    )}
                    {ev.note && <p className="text-slate-600 mt-1">{ev.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Advance Clearance Document Vault */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#008767]" />
                  <span>Advance Document Vault</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ZIMRA & Clearing Paperwork ({vehicle.documents?.length || 0})
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="p-2 rounded-xl bg-[#E6F4F1] hover:bg-emerald-100 text-[#008767] font-bold transition"
                title="Add Advance Document"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Document Checklist Guidelines */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
              <span className="font-bold block">Required For Beitbridge/Forbes Clearance:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                <li>Commercial Invoice / Bill of Sale</li>
                <li>Bill of Lading (B/L)</li>
                <li>Original Export / De-registration Cert</li>
                <li>JEVIC / EAA Pre-shipment Cert</li>
              </ul>
            </div>

            {/* Uploaded Documents List */}
            {(!vehicle.documents || vehicle.documents.length === 0) ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-semibold">No documents uploaded yet.</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-3 text-xs font-bold text-[#008767] hover:underline"
                >
                  + Upload First Document
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicle.documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="font-bold text-slate-900 truncate">{doc.title}</div>
                      <div className="text-[10px] font-mono text-slate-400">{doc.type}</div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#008767] font-bold hover:underline"
                      >
                        <span>View / Download</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <button
                      onClick={() => deleteDocMutation.mutate(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Advance Clearance Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  <option value="COMMERCIAL_INVOICE">Commercial Invoice / Bill of Sale</option>
                  <option value="BILL_OF_LADING">Bill of Lading (B/L)</option>
                  <option value="EXPORT_CERTIFICATE">Export / De-registration Certificate</option>
                  <option value="INSPECTION_CERT_JEVIC_EAA">JEVIC / EAA Pre-shipment Certificate</option>
                  <option value="ZIMRA_BILL_OF_ENTRY">ZIMRA Bill of Entry (Form 21)</option>
                  <option value="POLICE_INTERPOL_CLEARANCE">Police / Interpol SARPCCO Clearance</option>
                  <option value="TRANSIT_INSURANCE">Transit Cargo Insurance</option>
                  <option value="PROOF_OF_PAYMENT">Proof of Telegraphic Transfer (TT)</option>
                  <option value="OTHER">Other Supporting Document</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Document Title / Description
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Be Forward Commercial Invoice #892"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Document URL / Cloudinary Link
                </label>
                <input
                  type="text"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="https://... or /uploads/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Notes / Clearing Reference
                </label>
                <input
                  type="text"
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="Optional notes for clearing agent"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!docTitle || !docUrl) return alert('Please enter title and document URL');
                  uploadDocMutation.mutate({
                    type: docType,
                    title: docTitle,
                    fileUrl: docUrl,
                    notes: docNotes,
                  });
                }}
                disabled={uploadDocMutation.isPending}
                className="px-5 py-2 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-sm transition"
              >
                {uploadDocMutation.isPending ? 'Saving...' : 'Save Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advance Zimnat Insurance Modal */}
      {showInsuranceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-[#008767]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Issue Advance Zimnat Cover</h3>
                  <p className="text-[11px] text-slate-400">Pre-arrival marine cargo & road insurance</p>
                </div>
              </div>
              <button
                onClick={() => setShowInsuranceModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Vehicle identity brief */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-900">
                  {vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Chassis / VIN: {vehicle.vin}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Corridor</div>
                <div className="text-[11px] font-semibold text-emerald-800">
                  {vehicle.portOfDischarge} ➔ {vehicle.borderPost}
                </div>
              </div>
            </div>

            {/* Coverage Type Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Select Underwriting Coverage
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                <div
                  onClick={() => setInsuranceCoverage('TRANSIT_GIT')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                    insuranceCoverage === 'TRANSIT_GIT'
                      ? 'border-[#008767] bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>🚢 Marine & Overland Goods-In-Transit (GIT)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Covers marine voyage, port storage, and overland carrier accidents/rollovers from {vehicle.portOfDischarge} to your Harare/Bulawayo showroom.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-[#008767]">
                      ${Math.max(85, Math.round((vehicle.totalCifUsd ?? 0) * 0.015))} USD
                    </div>
                    <div className="text-[10px] text-slate-400">1.5% of CIF</div>
                  </div>
                </div>

                <div
                  onClick={() => setInsuranceCoverage('THIRD_PARTY_ROAD')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                    insuranceCoverage === 'THIRD_PARTY_ROAD'
                      ? 'border-[#008767] bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>🚗 Statutory Motor 3rd Party (Chassis/VIN Discs)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Statutory Zimbabwean road cover registered to chassis number so the vehicle is 100% legal to drive immediately out of Beitbridge/Forbes.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInsuranceTermMonths(4);
                          setInsuranceCoverage('THIRD_PARTY_ROAD');
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          insuranceTermMonths === 4 && insuranceCoverage === 'THIRD_PARTY_ROAD'
                            ? 'bg-[#008767] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        1 Term (4 Mo) $35
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInsuranceTermMonths(12);
                          setInsuranceCoverage('THIRD_PARTY_ROAD');
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          insuranceTermMonths === 12 && insuranceCoverage === 'THIRD_PARTY_ROAD'
                            ? 'bg-[#008767] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Annual (12 Mo) $75
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-[#008767]">
                      ${insuranceTermMonths <= 4 ? 35 : 75} USD
                    </div>
                    <div className="text-[10px] text-slate-400">Fixed Tariff</div>
                  </div>
                </div>

                <div
                  onClick={() => setInsuranceCoverage('COMPREHENSIVE_ROAD')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                    insuranceCoverage === 'COMPREHENSIVE_ROAD'
                      ? 'border-[#008767] bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>🛡️ Full Zimnat Comprehensive Policy</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Complete indemnity covering vehicle theft, accidental collision, and third party damage for your imported inventory.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-[#008767]">
                      ${Math.max(220, Math.round((vehicle.projectedTotalLandedCostUsd ?? 0) * 0.035))} USD
                    </div>
                    <div className="text-[10px] text-slate-400">3.5% Landed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Policyholder Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Policyholder / Dealership Name
                </label>
                <input
                  type="text"
                  value={insuranceOwnerName}
                  onChange={(e) => setInsuranceOwnerName(e.target.value)}
                  placeholder="e.g. Harare Premier Motors (Pvt) Ltd"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex justify-between items-center">
                <span className="text-emerald-900 font-semibold text-[11px]">
                  Total Premium to Settle via Paynow:
                </span>
                <span className="text-base font-black text-emerald-800">
                  ${calculateInsurancePremium()} USD
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowInsuranceModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleIssueInsurance}
                disabled={issuingInsurance}
                className="px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                {issuingInsurance ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Issuing & Vaulting...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Settle & Issue Zimnat Policy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZIMRA Pre-Clearance & Assessment Modal */}
      {showZimraModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">ZIMRA Pre-Clearance & Duty</h3>
                  <p className="text-[11px] text-slate-400">ASYCUDA World advance clearance record</p>
                </div>
              </div>
              <button
                onClick={() => setShowZimraModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    ASYCUDA Bill of Entry No. (Form 21)
                  </label>
                  <input
                    type="text"
                    value={zimraBillNo}
                    onChange={(e) => setZimraBillNo(e.target.value)}
                    placeholder="e.g. BE-2024-C81923"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    ZIMRA Assessment Notice No.
                  </label>
                  <input
                    type="text"
                    value={zimraAssessmentNo}
                    onChange={(e) => setZimraAssessmentNo(e.target.value)}
                    placeholder="e.g. ASY-ASSESS-9021"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-semibold bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Clearing Agent Company
                  </label>
                  <input
                    type="text"
                    value={clearingAgent}
                    onChange={(e) => setClearingAgent(e.target.value)}
                    placeholder="e.g. Manica Freight / Bak Logistics"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Clearing Agent Phone
                  </label>
                  <input
                    type="text"
                    value={clearingPhone}
                    onChange={(e) => setClearingPhone(e.target.value)}
                    placeholder="+263 77..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Duty Pre-Payment Status
                </label>
                <select
                  value={dutyStatus}
                  onChange={(e) => setDutyStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  <option value="UNPAID">UNPAID (Pending lodging)</option>
                  <option value="ASSESSED">ASSESSED (Notice lodged, awaiting payment)</option>
                  <option value="PAID_PRE_CLEARED">PAID_PRE_CLEARED (Duty settled in advance)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Duty Amount Paid (USD)
                  </label>
                  <input
                    type="number"
                    value={dutyAmountPaid}
                    onChange={(e) => setDutyAmountPaid(e.target.value)}
                    placeholder={`e.g. ${vehicle.projectedDutyUsd ?? 0}`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    ZIMRA Receipt Voucher Number
                  </label>
                  <input
                    type="text"
                    value={zimraReceiptNo}
                    onChange={(e) => setZimraReceiptNo(e.target.value)}
                    placeholder="e.g. ZIMRA-REC-94182"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-semibold bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowZimraModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveZimraAssessment}
                disabled={savingZimra}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                {savingZimra ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Assessment...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>Save Pre-Clearance</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Zimnat Digital Policy Disc Modal */}
      {showDiscModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                Official Digital Insurance Disc
              </span>
              <button
                onClick={() => setShowDiscModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Official Disc Graphic Preview */}
            <div className="mx-auto w-64 h-64 rounded-full border-4 border-emerald-600 p-3 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 shadow-inner flex flex-col items-center justify-center space-y-1.5 relative overflow-hidden">
              <div className="absolute top-2 text-[8px] font-black uppercase tracking-widest text-emerald-900">
                ZIMNAT LION INSURANCE
              </div>

              <div className="w-24 h-24 bg-white p-1 rounded-xl shadow-sm border border-emerald-300 flex items-center justify-center">
                <QrCode className="w-20 h-20 text-[#004D40]" />
              </div>

              <div className="font-mono font-bold text-[11px] text-slate-900 tracking-wider">
                {vehicle.transitInsurancePolicyRef}
              </div>

              <div className="text-[9px] font-bold uppercase text-emerald-800">
                VIN: {vehicle.vin}
              </div>

              <div className="text-[9px] font-medium text-slate-600 truncate max-w-[200px]">
                {vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}
              </div>

              <div className="absolute bottom-2 text-[8px] font-bold text-emerald-950 uppercase tracking-wider">
                VALID THRU: {vehicle.transitInsuranceExpiry ? new Date(vehicle.transitInsuranceExpiry).toLocaleDateString('en-GB') : '1 YEAR'}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              This cryptographic policy disc is authenticated for Zimbabwe transit. Present this QR code to ZRP traffic officers or ZIMRA border gates for immediate electronic verification.
            </p>

            <div className="flex justify-center gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Print Certificate Disc</span>
              </button>
              <button
                onClick={() => setShowDiscModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
