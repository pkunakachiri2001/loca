'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Bookmark, CheckCircle, XCircle, Clock, Calendar, Search, Sparkles
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CompanyBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'COMPANY_OWNER') {
      router.push('/auth/login?redirect=/company/bookings');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['company-bookings-all'],
    queryFn: () => apiClient.get('/companies/me/dashboard').then((r) => r.data.data.recentBookings || []),
    enabled: !!isAuthenticated && user?.role === 'COMPANY_OWNER',
  });

  const handleAction = async (id: string, status: string) => {
    await apiClient.put(`/bookings/${id}/status`, { status });
    queryClient.invalidateQueries({ queryKey: ['company-bookings-all'] });
    queryClient.invalidateQueries({ queryKey: ['company-dashboard'] });
  };

  const bookings: any[] = (data || []).filter((b: any) =>
    filterStatus === 'ALL' || b.status === filterStatus
  );

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

  return (
    <div className="max-w-6xl mx-auto text-[#0B192C]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reservations Ledger</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Customer Bookings</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Review, confirm, or decline incoming customer vehicle reservations and service requests.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-[#008767] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse h-24" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mx-auto mb-3">
            <Bookmark className="h-8 w-8" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#0B192C] mb-1">
            No {filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''} bookings
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            New customer reservations placed on the marketplace will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any, i: number) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center font-display font-extrabold text-sm shrink-0">
                    {booking.user?.firstName?.[0] || 'C'}
                    {booking.user?.lastName?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-base text-[#0B192C]">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">{booking.listing?.title}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-[11px]">Ref: #{booking.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Price</p>
                    <p className="font-display text-xl font-extrabold text-[#008767] mt-0.5">
                      {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>

                  {booking.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(booking.id, 'CONFIRMED')}
                        className="px-3.5 py-2 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Confirm
                      </button>
                      <button
                        onClick={() => handleAction(booking.id, 'CANCELLED')}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Decline
                      </button>
                    </div>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleAction(booking.id, 'COMPLETED')}
                      className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center gap-1.5 transition"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
