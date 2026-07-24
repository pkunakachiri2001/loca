'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Download, CreditCard, ArrowUpRight } from 'lucide-react';
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

  const { data } = useQuery({
    queryKey: ['company-revenue'],
    queryFn: () => apiClient.get('/companies/me/dashboard').then(r => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'COMPANY_OWNER',
  });

  const totalRevenue = data?.company?.totalRevenue || 0;

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Revenue Report</h1>
          <p style={{ color: '#6B6B72' }}>Track payouts, transaction history, and platform earnings.</p>
        </div>
        <button className="btn-secondary text-sm">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </motion.div>

      {/* Hero Revenue Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-8 mb-8"
        style={{ background: 'linear-gradient(135deg, #1A1A1C 0%, rgba(232,165,71,0.1) 100%)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: '#E8A547' }}>Total Earnings Payout</p>
            <p className="font-display text-5xl font-bold" style={{ color: '#F5F0E8' }}>{formatCurrency(totalRevenue)}</p>
            <p className="text-sm mt-2" style={{ color: '#6B6B72' }}>5% platform commission deducted automatically at payout</p>
          </div>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <TrendingUp className="h-8 w-8" style={{ color: '#34D399' }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
