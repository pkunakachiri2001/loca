'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Car, Bookmark, Star, TrendingUp, Clock, CheckCircle,
  XCircle, ArrowRight, Plus, AlertCircle, Sparkles
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-[#008767] border-emerald-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const stats = [
    { label: 'Active Listings', value: data?.company?.listings?.length ?? '—', icon: Car, color: '#008767' },
    { label: 'Pending Bookings', value: data?.pendingBookings ?? '—', icon: Clock, color: '#D97706' },
    { label: 'Total Bookings', value: data?.company?.totalBookings ?? '—', icon: Bookmark, color: '#2563EB' },
    { label: 'Customer Rating', value: data?.company?.rating ? `${data.company.rating.toFixed(1)}★` : '5.0★', icon: Star, color: '#F59E0B' },
  ];

  return (
    <div className="max-w-6xl mx-auto text-[#0B192C]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vendor Operations Hub</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">
            {data?.company?.name || 'Company Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Manage your fleet, confirm reservations, and scale your automotive business in Zimbabwe.
          </p>
        </div>
        <Link
          href="/company/listings/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-sm transition shrink-0"
        >
          <Plus className="h-4 w-4" /> Add New Listing
        </Link>
      </motion.div>

      {/* Verification Banner */}
      {data?.company?.status === 'PENDING' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 rounded-2xl p-4.5 bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 text-sm">Your business profile is pending verification</p>
            <p className="text-amber-800/80 mt-1">
              Famba administrators are reviewing your Zimbabwe corporate details. Once verified, all your published vehicles and workshop services will go live immediately on the marketplace.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <p className="font-display text-2xl font-extrabold text-[#0B192C] mb-1">{stat.value}</p>
            <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Card */}
      {data?.company?.totalRevenue !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-2xl p-6 border border-emerald-200 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#008767] text-white flex items-center justify-center shrink-0 shadow-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Marketplace Revenue</p>
              <p className="font-display text-3xl font-extrabold text-[#008767] mt-0.5">
                {formatCurrency(data.company.totalRevenue || 0)}
              </p>
            </div>
          </div>
          <Link
            href="/company/revenue"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 shadow-sm transition"
          >
            Revenue Report <ArrowRight className="h-3.5 w-3.5 text-[#008767]" />
          </Link>
        </motion.div>
      )}

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0B192C]">Recent Customer Bookings</h2>
            <p className="text-xs font-semibold text-slate-400">Incoming reservations and service requests</p>
          </div>
          <Link
            href="/company/bookings"
            className="text-xs font-bold text-[#008767] hover:underline flex items-center gap-1"
          >
            View all bookings <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {!data?.recentBookings?.length ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mx-auto mb-3">
              <Bookmark className="h-7 w-7" />
            </div>
            <p className="font-bold text-sm text-[#0B192C] mb-1">No bookings yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Incoming bookings from customers searching for vehicles or workshops in Zimbabwe will show up here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.recentBookings.map((booking: any) => (
              <div
                key={booking.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/70 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] font-bold text-xs flex items-center justify-center shrink-0">
                    {booking.user?.firstName?.[0] || 'C'}
                    {booking.user?.lastName?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#0B192C]">
                      {booking.user?.firstName} {booking.user?.lastName}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">{booking.listing?.title}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:justify-end">
                  <div className="text-right">
                    <p className="font-bold text-sm text-[#008767]">{formatCurrency(booking.totalAmount)}</p>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold mt-1 ${getStatusBadge(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  {booking.status === 'PENDING' && (
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleBookingAction(booking.id, 'CONFIRMED')}
                        className="px-3 py-1.5 rounded-lg bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs flex items-center gap-1 transition"
                        title="Confirm Booking"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Confirm
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Rejection reason:') || 'Unavailable dates';
                          handleBookingAction(booking.id, 'REJECTED', reason);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition"
                        title="Decline"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
