'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Plus, Edit3, Trash2, Eye, Car, Star, MapPin, Search, Sparkles
} from 'lucide-react';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';

export default function CompanyListingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'COMPANY_OWNER' && user?.role !== 'ADMIN')) {
      router.push('/auth/login?redirect=/company/listings');
    }
  }, [isAuthenticated, user, router]);

  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['company-listings'],
    queryFn: () => apiClient.get('/companies/me/listings').then((r) => r.data.data),
    enabled: !!isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/listings/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['company-listings'] }),
  });

  const listings: any[] = (data || []).filter((l: any) =>
    !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.city?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-[#008767] border-emerald-200';
      case 'PENDING_APPROVAL':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REJECTED':
      case 'SUSPENDED':
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
            <span>Fleet & Inventory</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">My Fleet & Services</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            {listings.length} registered listing{listings.length !== 1 ? 's' : ''} across Zimbabwe
          </p>
        </div>

        <Link
          href="/company/listings/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-sm transition"
        >
          <Plus className="h-4 w-4" /> Add New Listing
        </Link>
      </motion.div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white shadow-sm"
          placeholder="Filter your fleet by model, title, or city..."
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse h-20" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mx-auto mb-4">
            <Car className="h-8 w-8" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#0B192C] mb-2">No listings yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Add your first vehicle, spare parts package, or workshop repair service to begin receiving inquiries and bookings.
          </p>
          <Link
            href="/company/listings/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-sm transition"
          >
            <Plus className="h-4 w-4" /> Add Your First Listing
          </Link>
        </motion.div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Service / Vehicle</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Daily Rate</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {listings.map((listing: any, i: number) => {
                  const rawImg = listing.primaryImage || listing.images?.[0];
                  const imgUrl = typeof rawImg === 'string' ? rawImg : rawImg?.url;

                  return (
                    <motion.tr
                      key={listing.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-slate-50/70 transition"
                    >
                      {/* Listing Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                            {imgUrl ? (
                              <img src={imgUrl} alt={listing.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Car className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#0B192C] line-clamp-1">{listing.title}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-[#008767]" />
                              <span>{listing.city || 'Harare'}, Zimbabwe</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6F4F1] text-[#008767] border border-[#B2E3D8]">
                          {getCategoryLabel(listing.category)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sm text-[#008767]">
                          {formatCurrency(listing.pricePerDay || 0)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">/day</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {listing.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            <span className="font-bold text-slate-800">{listing.rating.toFixed(1)}</span>
                            <span className="text-slate-400 text-[10px]">({listing.totalReviews})</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No reviews</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(listing.status)}`}>
                          {listing.status === 'PENDING_APPROVAL' ? 'Pending Approval' : listing.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/listing/${listing.slug || listing.id}`}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                            title="View public page"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this listing?')) {
                                deleteMutation.mutate(listing.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
