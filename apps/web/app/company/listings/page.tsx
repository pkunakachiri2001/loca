'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus, Edit3, Trash2, Eye, EyeOff, Car, Star, MapPin, MoreHorizontal,
  CheckCircle, XCircle, Clock, Search
} from 'lucide-react';
import { formatCurrency, getCategoryLabel, getStatusColor } from '@/lib/utils';

export default function CompanyListingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'COMPANY_OWNER') {
      router.push('/auth/login?redirect=/company/listings');
    }
  }, [isAuthenticated, user, router]);

  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['company-listings'],
    queryFn: () => apiClient.get('/companies/me/listings').then(r => r.data.data),
    enabled: !!isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/listings/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company-listings'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.put(`/listings/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company-listings'] }),
  });

  const listings: any[] = (data || []).filter((l: any) =>
    !search || l.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>My Listings</h1>
          <p style={{ color: '#6B6B72' }}>{listings.length} listing{listings.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link href="/company/listings/new" className="btn-primary">
          <Plus className="h-4 w-4" /> New Listing
        </Link>
      </motion.div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-dark pl-10 w-full max-w-sm"
          placeholder="Search listings..."
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : listings.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: '#1A1A1C', border: '1px solid #2E2E34' }}>
            <Car className="h-8 w-8" style={{ color: '#3A3A3E' }} />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: '#F5F0E8' }}>No listings yet</h3>
          <p className="mb-6" style={{ color: '#6B6B72' }}>Create your first listing to start receiving bookings.</p>
          <Link href="/company/listings/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Create First Listing
          </Link>
        </motion.div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table-dark w-full">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Category</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Status</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing: any, i: number) => (
                <motion.tr
                  key={listing.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {/* Listing info */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: '#242428' }}>
                        {listing.primaryImage || listing.images?.[0]?.url ? (
                          <img src={listing.primaryImage || listing.images[0].url} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="h-5 w-5" style={{ color: '#3A3A3E' }} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: '#F5F0E8' }}>{listing.title}</p>
                        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#6B6B72' }}>
                          <MapPin className="h-3 w-3" />{listing.city}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="badge-info text-[10px]">{getCategoryLabel(listing.category)}</span>
                  </td>

                  <td>
                    <p className="text-sm font-semibold" style={{ color: '#F5F0E8' }}>
                      {formatCurrency(listing.pricePerDay)}
                      <span className="font-normal text-xs ml-1" style={{ color: '#6B6B72' }}>/day</span>
                    </p>
                  </td>

                  <td>
                    {listing.rating ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span style={{ color: '#F5F0E8' }}>{listing.rating.toFixed(1)}</span>
                        <span style={{ color: '#5A5A60' }}>({listing.totalReviews})</span>
                      </span>
                    ) : (
                      <span style={{ color: '#5A5A60', fontSize: 13 }}>No reviews</span>
                    )}
                  </td>

                  <td>
                    <span className={getStatusColor(listing.status)} style={{ fontSize: 11, fontWeight: 600 }}>
                      {listing.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="relative flex items-center gap-1">
                      <Link
                        href={`/listing/${listing.slug || listing.id}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                        title="View listing"
                      >
                        <Eye className="h-4 w-4" style={{ color: '#6B6B72' }} />
                      </Link>
                      <Link
                        href={`/company/listings/${listing.id}/edit`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" style={{ color: '#6B6B72' }} />
                      </Link>
                      <button
                        onClick={() => deleteMutation.mutate(listing.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10 group"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 group-hover:text-red-400 transition-colors" style={{ color: '#6B6B72' }} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
