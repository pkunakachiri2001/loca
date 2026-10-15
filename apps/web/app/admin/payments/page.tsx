'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Sparkles, Wallet, Building2, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/auth/login?redirect=/admin/payments');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  return (
    <div className="max-w-5xl mx-auto text-[#0B192C]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Settlement Console</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Platform Financials & Settlements</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Track Zimbabwean marketplace commissions, Paynow integration transactions, and merchant disbursements.
        </p>
      </motion.div>

      {/* Hero Financial Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8 text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mx-auto mb-4">
          <CreditCard className="h-8 w-8" />
        </div>
        <h3 className="font-display text-xl font-bold text-[#0B192C] mb-2">Zimbabwe Payment Gateway Pipeline</h3>
        <p className="max-w-lg mx-auto text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
          Customer transactions are routed via <strong>Paynow Zimbabwe</strong> (supporting EcoCash, OneMoney, Zimswitch/Zipit) and direct <strong>USD Cash on Handover</strong> with a standard 5% platform commission settlement.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#008767] text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Encrypted Paynow Webhook Receiver Active</span>
        </div>
      </div>

      {/* Gateway Settlement Breakdown */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mb-3">
            <Wallet className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-sm text-[#0B192C] mb-1">EcoCash USSD Push</h4>
          <p className="text-xs text-slate-500">Direct mobile prompt for 077/078 subscribers across Zimbabwe.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-3">
            <Building2 className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-sm text-[#0B192C] mb-1">Zimswitch / Zipit Online</h4>
          <p className="text-xs text-slate-500">Interbank digital checkout for local bank card and mobile banking holders.</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-3">
            <DollarSign className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-sm text-[#0B192C] mb-1">USD Cash & Cards</h4>
          <p className="text-xs text-slate-500">Handover cash collection with digital deposit ledger and verified status logs.</p>
        </div>
      </div>
    </div>
  );
}
