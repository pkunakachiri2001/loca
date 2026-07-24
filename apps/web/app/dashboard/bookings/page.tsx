'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bookmark, Clock, CheckCircle, XCircle, Car, Calendar, ArrowRight, Search } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

const STATUS_TABS = ['All', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function BookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login?redirect=/dashboard/bookings');
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings-all'],
    queryFn: () => apiClient.get('/users/me/bookings?limit=50').then(r => r.data.data),
    enabled: !!isAuthenticated,
  });

  const bookings: any[] = data || [];

  const [activeTab, setActiveTab] = [
    'All',
    (v: string) => {}
  ];
  const [tab, setTab] = ([
    'All',
    (v: string) => {}
  ] as any);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>My Bookings</h1>
        <p style={{ color: '#6B6B72' }}>Track and manage all your vehicle and service bookings.</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: '#1A1A1C', border: '1px solid #2E2E34' }}>
            <Car className="h-8 w-8" style={{ color: '#3A3A3E' }} />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: '#F5F0E8' }}>No bookings yet</h3>
          <p className="mb-6" style={{ color: '#6B6B72' }}>Your booking history will appear here once you make your first reservation.</p>
          <Link href="/search" className="btn-primary">
            <Search className="h-4 w-4" /> Find a vehicle
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any, i: number) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              <div className="flex items-start gap-5 p-5">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ background: '#242428' }}>
                  {booking.listing?.images?.[0]?.url ? (
                    <img src={booking.listing.images[0].url} alt={booking.listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-8 w-8" style={{ color: '#3A3A3E' }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-semibold truncate" style={{ color: '#F5F0E8' }}>{booking.listing?.title}</h3>
                    <span className={`shrink-0 ${getStatusColor(booking.status)}`} style={{ fontSize: 11, fontWeight: 600 }}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: '#6B6B72' }}>{booking.listing?.company?.name}</p>
                  <div className="flex flex-wrap gap-4 text-sm" style={{ color: '#6B6B72' }}>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold" style={{ color: '#E8A547' }}>{formatCurrency(booking.totalAmount)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #1E1E22' }}>
                <span className="text-xs font-mono" style={{ color: '#5A5A60' }}>Ref: {booking.bookingRef}</span>
                <Link
                  href={`/listing/${booking.listing?.slug || booking.listingId}`}
                  className="flex items-center gap-1 text-sm font-medium transition-colors"
                  style={{ color: '#E8A547' }}
                >
                  View listing <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
