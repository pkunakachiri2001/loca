'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Car, Bookmark, Star, TrendingUp, Clock, CheckCircle,
  XCircle, ArrowRight, Plus, AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function CompanyDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/company/dashboard');
    } else if (user?.role === 'CUSTOMER') {
      router.push('/dashboard');
    } else if (user?.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['company-dashboard'],
    queryFn: () => apiClient.get('/companies/me/dashboard').then((r) => r.data.data),
    enabled: !!isAuthenticated && !!user,
  });

  const handleBookingAction = async (id: string, status: string, rejectionReason?: string) => {
    await apiClient.put(`/bookings/${id}/status`, { status, rejectionReason });
    queryClient.invalidateQueries({ queryKey: ['company-dashboard'] });
  };

  const stats = [
    { label: 'Active Listings', value: data?.company?.listings?.length ?? '—', icon: Car, color: '#60A5FA' },
    { label: 'Pending', value: data?.pendingBookings ?? '—', icon: Clock, color: '#FBBF24' },
    { label: 'Total Bookings', value: data?.company?.totalBookings ?? '—', icon: Bookmark, color: '#A78BFA' },
    { label: 'Rating', value: data?.company?.rating ? `${data.company.rating.toFixed(1)}★` : '—', icon: Star, color: '#34D399' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>
            {data?.company?.name || 'Company Dashboard'}
          </h1>
          <p style={{ color: '#6B6B72' }}>Manage your listings, bookings, and grow your business on FleetNest.</p>
        </div>
        <Link href="/company/listings/new" className="btn-primary text-sm shrink-0">
          <Plus className="h-4 w-4" /> Add Listing
        </Link>
      </motion.div>

      {/* Verification banner */}
      {data?.company?.status === 'PENDING' && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-6 rounded-xl p-4 flex items-center gap-3 text-sm"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#FBBF24' }}
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Your company is pending verification</p>
            <p style={{ color: 'rgba(251,191,36,0.7)', marginTop: 2 }}>Our team will review your details within 48–72 hours. Listings will go live once verified.</p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-5"
          >
            <stat.icon className="h-5 w-5 mb-3" style={{ color: stat.color }} />
            <p className="font-display text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm" style={{ color: '#6B6B72' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Banner */}
      {data?.company?.totalRevenue !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card p-6 mb-8 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #1A1A1C 0%, rgba(232,165,71,0.06) 100%)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
              <TrendingUp className="h-6 w-6" style={{ color: '#34D399' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: '#6B6B72' }}>Total Revenue Earned</p>
              <p className="font-display text-3xl font-bold" style={{ color: '#F5F0E8' }}>
                {formatCurrency(data.company.totalRevenue)}
              </p>
            </div>
          </div>
          <Link href="/company/analytics" className="btn-secondary text-sm">
            Revenue Report <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="card"
      >
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #1E1E22' }}>
          <h2 className="font-display font-semibold" style={{ color: '#F5F0E8' }}>Recent Bookings</h2>
          <Link href="/company/bookings" className="flex items-center gap-1 text-sm" style={{ color: '#E8A547' }}>
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {!data?.recentBookings?.length ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#242428', border: '1px solid #2E2E34' }}>
              <Bookmark className="h-7 w-7" style={{ color: '#3A3A3E' }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: '#F5F0E8' }}>No bookings yet</p>
            <p className="text-sm" style={{ color: '#6B6B72' }}>Bookings will appear here once customers book your listings.</p>
          </div>
        ) : (
          <div>
            {data.recentBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="flex items-center gap-4 p-4 transition-colors"
                style={{ borderBottom: '1px solid #1E1E22' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-display font-bold text-sm"
                  style={{ background: 'rgba(232,165,71,0.1)', border: '1px solid rgba(232,165,71,0.2)', color: '#E8A547' }}>
                  {booking.user?.firstName?.[0]}{booking.user?.lastName?.[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: '#F5F0E8' }}>
                    {booking.user?.firstName} {booking.user?.lastName}
                  </p>
                  <p className="text-xs" style={{ color: '#6B6B72' }}>{booking.listing?.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#5A5A60' }}>
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                  </p>
                </div>

                {/* Amount + status */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold" style={{ color: '#F5F0E8' }}>{formatCurrency(booking.totalAmount)}</p>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold mt-1 ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                {/* Accept / Reject buttons */}
                {booking.status === 'PENDING' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleBookingAction(booking.id, 'CONFIRMED')}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}
                      title="Confirm"
                    >
                      <CheckCircle className="h-4 w-4" style={{ color: '#34D399' }} />
                    </button>
                    <button
                      onClick={() => handleBookingAction(booking.id, 'REJECTED', 'Not available')}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}
                      title="Reject"
                    >
                      <XCircle className="h-4 w-4" style={{ color: '#F87171' }} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
