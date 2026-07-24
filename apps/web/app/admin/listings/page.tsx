'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Car, Star, MapPin } from 'lucide-react';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';

export default function AdminListingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/auth/login?redirect=/admin/listings');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings-all'],
    queryFn: () => apiClient.get('/admin/listings').then(r => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'ADMIN',
  });

  const listings: any[] = data || [];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Listings Moderation</h1>
        <p style={{ color: '#6B6B72' }}>Monitor and manage all active listings across providers.</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table-dark w-full">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l: any) => (
                <tr key={l.id}>
                  <td>
                    <p className="font-medium text-sm" style={{ color: '#F5F0E8' }}>{l.title}</p>
                    <p className="text-xs" style={{ color: '#6B6B72' }}>{l.company?.name || l.city}</p>
                  </td>
                  <td><span className="badge-info text-[10px]">{getCategoryLabel(l.category)}</span></td>
                  <td className="text-sm font-semibold" style={{ color: '#F5F0E8' }}>{formatCurrency(l.pricePerDay)}/day</td>
                  <td><span className="badge-success text-[10px]">{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
