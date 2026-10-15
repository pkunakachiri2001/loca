'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Download, CreditCard, ArrowUpRight, Sparkles, Building2, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CompanyRevenuePage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'COMPANY_OWNER') {
      router.push('/auth/login?redirect=/company/revenue');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['company-revenue'],
    queryFn: () => apiClient.get('/companies/me/dashboard').then((r) => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'COMPANY_OWNER',
  });

  const totalRevenue = data?.company?.totalRevenue || 0;
  const netEarnings = Math.max(0, totalRevenue * 0.95); // 5% platform commission

  return (
    <div className="max-w-5xl mx-auto text-[#0B192C]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Financial Settlements</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Revenue & Payouts</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Track gross earnings, marketplace commission deductions, and Zimbabwean bank/EcoCash settlements.
          </p>
        </div>

        <button
          onClick={() => alert('Payout ledger exported as CSV.')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 shadow-sm transition"
        >
          <Download className="h-4 w-4 text-[#008767]" /> Export CSV
        </button>
      </motion.div>

      {/* Hero Revenue Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-3xl p-8 border border-emerald-200 shadow-sm mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#008767] mb-2 block">
              Estimated Net Payout (USD)
            </span>
            <p className="font-display text-5xl font-extrabold text-[#0B192C]">
              {formatCurrency(netEarnings)}
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-2">
              Gross: {formatCurrency(totalRevenue)} • 5% platform commission deducted automatically at settlement
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#008767] text-white flex items-center justify-center shrink-0 shadow-md">
            <TrendingUp className="h-8 w-8" />
          </div>
        </div>
      </motion.div>

      {/* Payout Channels in Zimbabwe */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mb-3">
            <Wallet className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-[#0B192C] mb-1">EcoCash Merchant</h3>
          <p className="text-xs text-slate-500">Direct weekly settlement to corporate EcoCash lines.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-3">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-[#0B192C] mb-1">Zipit / Bank Transfer</h3>
          <p className="text-xs text-slate-500">Direct RTGS / USD FCA settlements to CABS, Stanbic, Steward.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-3">
            <DollarSign className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-[#0B192C] mb-1">USD Cash Handover</h3>
          <p className="text-xs text-slate-500">Direct cash collection from customers upon vehicle handover.</p>
        </div>
      </div>
    </div>
  );
}
