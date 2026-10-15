'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users, Building2, Car, Bookmark, CreditCard, Star,
  TrendingUp, Clock, AlertCircle, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

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
      label: 'Registered Users',
      value: stats?.users?.total ?? '—',
      sub: `+${stats?.users?.new ?? 0} this month`,
      icon: Users,
      color: '#008767',
      bg: '#E6F4F1',
      href: '/admin/users',
    },
    {
      label: 'Partner Companies',
      value: stats?.companies?.total ?? '—',
      sub: `${stats?.companies?.pending ?? 0} pending review`,
      icon: Building2,
      color: '#2563EB',
      bg: '#EFF6FF',
      href: '/admin/companies',
    },
    {
      label: 'Marketplace Listings',
      value: stats?.listings?.total ?? '—',
      sub: `${stats?.listings?.pending ?? 0} awaiting approval`,
      icon: Car,
      color: '#0D9488',
      bg: '#F0FDFA',
      href: '/admin/listings',
    },
    {
      label: 'Total Bookings',
      value: stats?.bookings?.total ?? '—',
      sub: `+${stats?.bookings?.recent ?? 0} this month`,
      icon: Bookmark,
      color: '#D97706',
      bg: '#FEF3C7',
      href: '/admin/bookings',
    },
    {
      label: 'Marketplace Revenue',
      value: stats?.revenue?.total ? formatCurrency(stats.revenue.total) : '$0',
      sub: 'Platform gross revenue',
      icon: CreditCard,
      color: '#059669',
      bg: '#ECFDF5',
      href: '/admin/payments',
    },
    {
      label: 'Customer Reviews',
      value: stats?.reviews?.total ?? '—',
      sub: 'Verified customer feedback',
      icon: Star,
      color: '#F59E0B',
      bg: '#FFFBEB',
      href: '/admin/reviews',
    },
  ];

  const quickActions = [
    { label: 'Pending Companies to Review', count: stats?.companies?.pending ?? 0, href: '/admin/companies', icon: AlertCircle },
    { label: 'Listings Awaiting Approval', count: stats?.listings?.pending ?? 0, href: '/admin/listings', icon: Clock },
  ];

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto text-[#0B192C]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Super Admin Console</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Admin Control Center</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Global platform metrics, Zimbabwean partner verification, and listing quality control.
        </p>
      </motion.div>

      {/* Quick Action Moderation Alerts */}
      {quickActions.some((a) => a.count > 0) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-3 mb-6">
          {quickActions.filter((a) => a.count > 0).map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-sm hover:bg-amber-100 transition"
            >
              <action.icon className="h-4 w-4 text-amber-600 shrink-0" />
              <span><strong>{action.count}</strong> {action.label}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 text-amber-600" />
            </Link>
          ))}
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link href={card.href} className="block group">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-sm transition hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: card.bg }}
                  >
                    <card.icon className="h-5 w-5" style={{ color: card.color }} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#008767] group-hover:translate-x-1 transition" />
                </div>
                <p className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">{card.value}</p>
                <p className="font-bold text-sm text-slate-800 mb-0.5">{card.label}</p>
                <p className="text-xs font-semibold text-slate-400">{card.sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Navigation Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
      >
        <h2 className="font-display font-bold text-base text-[#0B192C] mb-4">Administration Workflows</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: '/admin/companies', label: 'Company Verification', desc: 'Approve & verify partner fleets' },
            { href: '/admin/listings', label: 'Listings Moderation', desc: 'Approve inventory & services' },
            { href: '/admin/users', label: 'User Directory', desc: 'Manage customers & accounts' },
            { href: '/admin/bookings', label: 'Bookings Oversight', desc: 'Inspect platform bookings' },
          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="p-4 rounded-xl border border-slate-200 hover:border-[#008767] hover:bg-emerald-50/20 transition group"
            >
              <p className="font-bold text-sm text-[#0B192C] group-hover:text-[#008767] mb-1">{tool.label}</p>
              <p className="text-xs text-slate-500">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
