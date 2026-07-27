'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, DollarSign, Calendar, Car, Star, ArrowUpRight } from 'lucide-react';
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
    queryFn: () => apiClient.get('/companies/me/dashboard').then(r => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'COMPANY_OWNER',
  });

  const company = data?.company;

  const metrics = [
    { label: 'Total Revenue', value: company?.totalRevenue ? formatCurrency(company.totalRevenue) : '$0', icon: DollarSign, color: '#34D399', change: '+18.4%' },
    { label: 'Total Bookings', value: company?.totalBookings || 0, icon: BarChart3, color: '#E8A547', change: '+12.5%' },
    { label: 'Active Fleet', value: company?.listings?.length || 0, icon: Car, color: '#60A5FA', change: 'Stable' },
    { label: 'Customer Rating', value: company?.rating ? `${company.rating.toFixed(1)}★` : '4.9★', icon: Star, color: '#FBBF24', change: 'Top 5%' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Business Analytics</h1>
        <p style={{ color: '#6B6B72' }}>Performance insights, revenue metrics, and booking analytics.</p>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                <m.icon className="h-5 w-5" style={{ color: m.color }} />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}>
                {m.change}
              </span>
            </div>
            <p className="font-display text-3xl font-bold mb-1" style={{ color: m.color }}>{m.value}</p>
            <p className="text-sm" style={{ color: '#6B6B72' }}>{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-8 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl font-bold" style={{ color: '#F5F0E8' }}>Monthly Revenue Overview</h2>
            <p className="text-sm" style={{ color: '#6B6B72' }}>Earnings breakdown over past 6 months</p>
          </div>
          <span className="section-badge text-xs">Live Data</span>
        </div>

        {/* Visual Bar Graph */}
        <div className="grid grid-cols-6 gap-3 items-end h-48 pt-6">
          {[
            { month: 'Mar', val: 450000, pct: 45 },
            { month: 'Apr', val: 620000, pct: 62 },
            { month: 'May', val: 890000, pct: 89 },
            { month: 'Jun', val: 780000, pct: 78 },
            { month: 'Jul', val: 1150000, pct: 100 },
            { month: 'Aug', val: 940000, pct: 82 },
          ].map((bar) => (
            <div key={bar.month} className="flex flex-col items-center gap-2 h-full justify-end group">
              <div
                className="w-full rounded-t-xl transition-all duration-500 group-hover:brightness-125"
                style={{
                  height: `${bar.pct}%`,
                  background: 'linear-gradient(to top, #E8A547 0%, #F5D78A 100%)',
                }}
              />
              <span className="text-xs font-semibold" style={{ color: '#6B6B72' }}>{bar.month}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
