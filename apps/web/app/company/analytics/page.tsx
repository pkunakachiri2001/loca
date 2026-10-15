'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Calendar, Car, Star, ArrowUpRight, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CompanyAnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'COMPANY_OWNER') {
      router.push('/auth/login?redirect=/company/analytics');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data } = useQuery({
    queryKey: ['company-analytics'],
    queryFn: () => apiClient.get('/companies/me/dashboard').then((r) => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'COMPANY_OWNER',
  });

  const company = data?.company;

  const metrics = [
    { label: 'Total Revenue', value: company?.totalRevenue ? formatCurrency(company.totalRevenue) : '$0', icon: DollarSign, color: '#008767', change: '+18.4%' },
    { label: 'Total Bookings', value: company?.totalBookings || 0, icon: BarChart3, color: '#2563EB', change: '+12.5%' },
    { label: 'Active Fleet', value: company?.listings?.length || 0, icon: Car, color: '#0D9488', change: 'Stable' },
    { label: 'Customer Rating', value: company?.rating ? `${company.rating.toFixed(1)}★` : '4.9★', icon: Star, color: '#D97706', change: 'Top Tier' },
  ];

  return (
    <div className="max-w-6xl mx-auto text-[#0B192C]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fleet Performance</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Business Analytics</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Monthly vehicle rental utilization, turnover metrics, and customer satisfaction ratings in Zimbabwe.
        </p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100"
              >
                <m.icon className="h-5 w-5" style={{ color: m.color }} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#008767] border border-emerald-200">
                {m.change}
              </span>
            </div>
            <p className="font-display text-2xl font-extrabold text-[#0B192C] mb-1">{m.value}</p>
            <p className="text-xs font-semibold text-slate-500">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0B192C]">Monthly Revenue Overview (USD)</h2>
            <p className="text-xs font-semibold text-slate-400">Past 6 months booking turnover</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E6F4F1] text-[#008767] border border-[#B2E3D8]">
            Marketplace Trend
          </span>
        </div>

        {/* Visual Bar Graph */}
        <div className="grid grid-cols-6 gap-3 sm:gap-6 items-end h-48 pt-6">
          {[
            { month: 'May', val: '$1,200', pct: 45 },
            { month: 'Jun', val: '$1,850', pct: 60 },
            { month: 'Jul', val: '$2,400', pct: 75 },
            { month: 'Aug', val: '$2,100', pct: 68 },
            { month: 'Sep', val: '$3,150', pct: 95 },
            { month: 'Oct', val: '$3,400', pct: 100 },
          ].map((bar) => (
            <div key={bar.month} className="flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition">
                {bar.val}
              </span>
              <div
                className="w-full rounded-t-xl transition-all duration-500 bg-gradient-to-t from-[#008767] to-[#34D399] group-hover:brightness-110 shadow-sm"
                style={{ height: `${bar.pct}%` }}
              />
              <span className="text-xs font-bold text-slate-500">{bar.month}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
