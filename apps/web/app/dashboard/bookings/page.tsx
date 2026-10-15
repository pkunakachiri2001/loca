'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bookmark, Clock, CheckCircle, XCircle, Car, Calendar, ArrowRight, Search, Sparkles } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login?redirect=/dashboard/bookings');
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings-all', activeTab],
    queryFn: async () => {
      try {
        const query = activeTab !== 'ALL' ? `?status=${activeTab}&limit=50` : '?limit=50';
        const res = await apiClient.get(`/users/me/bookings${query}`);
        return Array.isArray(res.data?.data) ? res.data.data : [];
      } catch (e) {
        return [];
      }
    },
    enabled: !!isAuthenticated,
  });

  const bookings: any[] = data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-[#008767] border-emerald-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto text-[#0B192C]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vehicle Reservations</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">My Bookings</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Track and manage your vehicle rentals, workshop appointments, and chauffeur bookings across Zimbabwe.
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab
                ? 'bg-[#008767] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mx-auto mb-4">
            <Car className="h-8 w-8" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#0B192C] mb-2">No bookings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            {activeTab === 'ALL'
              ? 'Your booking history will appear here once you reserve a vehicle or service.'
              : `You have no bookings matching the "${activeTab.toLowerCase()}" status.`}
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-sm transition"
          >
            <Search className="h-4 w-4" /> Find a vehicle in Zimbabwe
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any, i: number) => {
            const rawImg = booking.listing?.images?.[0];
            const imgUrl = typeof rawImg === 'string' ? rawImg : rawImg?.url;

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm overflow-hidden transition"
              >
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 p-5">
                  {/* Image */}
                  <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                    {imgUrl ? (
                      <img src={imgUrl} alt={booking.listing?.title || 'Vehicle'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Car className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-bold text-base text-[#0B192C] truncate">
                        {booking.listing?.title || 'Booking'}
                      </h3>
                      <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-500 mb-3">
                      {booking.listing?.company?.name || 'Famba Verified Provider'}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                      </span>
                      <span className="flex items-center gap-1.5 font-bold text-[#008767]">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50/70 border-t border-slate-100">
                  <span className="text-[11px] font-mono text-slate-400">
                    Ref: #{booking.bookingRef || booking.id.slice(0, 8).toUpperCase()}
                  </span>
                  <Link
                    href={`/listing/${booking.listing?.slug || booking.listingId}`}
                    className="flex items-center gap-1 text-xs font-bold text-[#008767] hover:underline"
                  >
                    View listing details <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
