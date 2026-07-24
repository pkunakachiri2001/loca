'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, Building2, Car, Bookmark, CreditCard, Star,
  TrendingUp, Clock, AlertCircle, ArrowRight, ShieldCheck
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  // Role guard
  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/admin');
    } else if (user?.role === 'CUSTOMER') {
      router.push('/dashboard');
    } else if (user?.role === 'COMPANY_OWNER') {
      router.push('/company/dashboard');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.get('/admin/stats').then((r) => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'ADMIN',
  });

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.users?.total ?? '—',
      sub: `+${stats?.users?.new ?? 0} this month`,
      icon: Users,
      color: '#60A5FA',
      bg: 'rgba(96,165,250,0.1)',
      href: '/admin/users',
    },
    {
      label: 'Companies',
      value: stats?.companies?.total ?? '—',
      sub: `${stats?.companies?.pending ?? 0} pending review`,
      icon: Building2,
      color: '#A78BFA',
      bg: 'rgba(167,139,250,0.1)',
      href: '/admin/companies',
    },
    {
      label: 'Listings',
      value: stats?.listings?.total ?? '—',
      sub: `${stats?.listings?.pending ?? 0} awaiting approval`,
      icon: Car,
      color: '#34D399',
      bg: 'rgba(52,211,153,0.1)',
      href: '/admin/listings',
    },
    {
      label: 'Bookings',
      value: stats?.bookings?.total ?? '—',
      sub: `+${stats?.bookings?.recent ?? 0} this month`,
      icon: Bookmark,
      color: '#FBBF24',
      bg: 'rgba(251,191,36,0.1)',
      href: '/admin/bookings',
    },
    {
      label: 'Total Revenue',
      value: stats?.revenue?.total ? formatCurrency(stats.revenue.total) : '—',
      sub: 'Platform gross revenue',
      icon: CreditCard,
      color: '#E8A547',
      bg: 'rgba(232,165,71,0.1)',
      href: '/admin/payments',
    },
    {
      label: 'Reviews',
      value: stats?.reviews?.total ?? '—',
      sub: 'Verified customer reviews',
      icon: Star,
      color: '#F472B6',
      bg: 'rgba(244,114,182,0.1)',
      href: '/admin/reviews',
    },
  ];

  const quickActions = [
    { label: 'Pending Companies to Review', count: stats?.companies?.pending ?? 0, href: '/admin/companies?status=PENDING', icon: AlertCircle },
    { label: 'Listings Awaiting Approval', count: stats?.listings?.pending ?? 0, href: '/admin/listings?status=PENDING_APPROVAL', icon: Clock },
  ];

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null; // Prevents flash before redirecting
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-error text-xs flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> System Administration
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Admin Control Center</h1>
        <p style={{ color: '#6B6B72' }}>FleetNest global platform metrics, user moderation, and management.</p>
      </motion.div>

      {/* Quick Action Moderation Alerts */}
      {quickActions.some((a) => a.count > 0) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-3 mb-6">
          {quickActions.filter((a) => a.count > 0).map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-2 rounded-xl p-3 text-sm transition-colors"
              style={{ background: 'rgba(232,165,71,0.1)', border: '1px solid rgba(232,165,71,0.25)', color: '#E8A547' }}
            >
              <action.icon className="h-4 w-4 shrink-0" />
              <span><strong className="font-display font-bold">{action.count}</strong> {action.label}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          ))}
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link href={card.href}>
              <div className="card p-5 transition-all hover:-translate-y-1 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: card.bg, border: `1px solid ${card.color}33` }}>
                    <card.icon className="h-5 w-5" style={{ color: card.color }} />
                  </div>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: '#5A5A60' }} />
                </div>
                <p className="font-display text-3xl font-bold mb-1" style={{ color: card.color }}>{card.value}</p>
                <p className="font-semibold text-sm mb-0.5" style={{ color: '#F5F0E8' }}>{card.label}</p>
                <p className="text-xs" style={{ color: '#6B6B72' }}>{card.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Navigation Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h2 className="font-display font-semibold text-lg mb-4" style={{ color: '#F5F0E8' }}>Administration Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: '/admin/companies', label: 'Companies', desc: 'Approve & manage providers' },
            { href: '/admin/listings', label: 'Listings', desc: 'Moderate service listings' },
            { href: '/admin/users', label: 'User Directory', desc: 'Manage registered accounts' },
            { href: '/admin/payments', label: 'Financials', desc: 'Platform transactions & payouts' },
          ].map((tool) => (
            <Link key={tool.href} href={tool.href} className="p-4 rounded-xl transition-all"
              style={{ background: '#242428', border: '1px solid #2E2E34' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#E8A547')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#2E2E34')}
            >
              <p className="font-semibold text-sm mb-0.5" style={{ color: '#F5F0E8' }}>{tool.label}</p>
              <p className="text-xs" style={{ color: '#6B6B72' }}>{tool.desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
