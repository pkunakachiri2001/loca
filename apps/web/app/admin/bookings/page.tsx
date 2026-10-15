'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Bookmark, Search, Sparkles, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/auth/login?redirect=/admin/bookings');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings-all'],
    queryFn: () => apiClient.get('/admin/bookings').then((r) => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'ADMIN',
  });

  const bookings: any[] = (data || []).filter((b: any) =>
    !search ||
    b.bookingRef?.toLowerCase().includes(search.toLowerCase()) ||
    b.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.lastName?.toLowerCase().includes(search.toLowerCase())
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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Global Orders</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Global Bookings</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          All platform vehicle reservations, workshop bookings, and transaction records across Zimbabwe.
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ref, vehicle, or customer name..."
          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white shadow-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse h-16" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <Bookmark className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-xs font-semibold text-slate-500">No bookings found matching query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Service / Fleet</th>
                  <th className="py-3.5 px-4">Amount (USD)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Rental Window</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {bookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#008767]">
                      #{b.bookingRef || b.id.slice(0, 8).toUpperCase()}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-sm text-[#0B192C]">
                        {b.user?.firstName} {b.user?.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400">{b.user?.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-xs text-slate-800 line-clamp-1">{b.listing?.title}</p>
                      <p className="text-[10px] text-slate-400">{b.company?.name}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-sm text-[#008767]">
                        {formatCurrency(b.totalAmount)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(b.status)}`}>
                        {b.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatDate(b.startDate)} → {formatDate(b.endDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
