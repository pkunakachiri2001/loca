'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/auth/login?redirect=/admin/bookings');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings-all'],
    queryFn: () => apiClient.get('/admin/bookings').then(r => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'ADMIN',
  });

  const bookings: any[] = data || [];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Global Bookings</h1>
        <p style={{ color: '#6B6B72' }}>All platform reservations and transaction records.</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table-dark w-full">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Customer</th>
                <th>Listing</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: any) => (
                <tr key={b.id}>
                  <td className="font-mono text-xs" style={{ color: '#E8A547' }}>{b.bookingRef}</td>
                  <td className="text-sm" style={{ color: '#F5F0E8' }}>{b.user?.firstName} {b.user?.lastName}</td>
                  <td className="text-sm" style={{ color: '#9A9A9E' }}>{b.listing?.title}</td>
                  <td className="text-sm font-semibold" style={{ color: '#F5F0E8' }}>{formatCurrency(b.totalAmount)}</td>
                  <td><span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${getStatusColor(b.status)}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
