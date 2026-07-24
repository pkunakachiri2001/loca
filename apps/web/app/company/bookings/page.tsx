'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Bookmark, CheckCircle, XCircle, Clock, Calendar, Search, Filter, Car, ArrowRight
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

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
    queryFn: () => apiClient.get('/companies/me/dashboard').then(r => r.data.data.recentBookings || []),
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

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Customer Bookings</h1>
          <p style={{ color: '#6B6B72' }}>Review, confirm, or manage incoming reservations for your listings.</p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: filterStatus === st ? '#E8A547' : '#1A1A1C',
                color: filterStatus === st ? '#0E0E10' : '#9A9A9E',
                border: filterStatus === st ? 'none' : '1px solid #2E2E34',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-20 p-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#242428', border: '1px solid #2E2E34' }}>
            <Bookmark className="h-8 w-8" style={{ color: '#3A3A3E' }} />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: '#F5F0E8' }}>No {filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''} bookings</h3>
          <p style={{ color: '#6B6B72' }}>Reservations placed by customers will be listed here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any, i: number) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0"
                    style={{ background: 'rgba(232,165,71,0.12)', border: '1px solid rgba(232,165,71,0.3)', color: '#E8A547' }}>
                    {booking.user?.firstName?.[0]}{booking.user?.lastName?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold" style={{ color: '#F5F0E8' }}>
                        {booking.user?.firstName} {booking.user?.lastName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#E8A547' }}>{booking.listing?.title}</p>
                    <p className="text-xs flex items-center gap-1.5" style={{ color: '#6B6B72' }}>
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0" style={{ borderTop: '1px solid #1E1E22' }}>
                  <div className="text-left md:text-right">
                    <p className="text-xs" style={{ color: '#6B6B72' }}>Total Amount</p>
                    <p className="font-display font-bold text-lg" style={{ color: '#F5F0E8' }}>{formatCurrency(booking.totalAmount)}</p>
                  </div>

                  {booking.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(booking.id, 'CONFIRMED')}
                        className="btn-primary text-xs py-2 px-4"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Confirm
                      </button>
                      <button
                        onClick={() => handleAction(booking.id, 'REJECTED')}
                        className="btn-secondary text-xs py-2 px-4"
                        style={{ color: '#F87171', borderColor: 'rgba(248,113,113,0.3)' }}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Decline
                      </button>
                    </div>
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
