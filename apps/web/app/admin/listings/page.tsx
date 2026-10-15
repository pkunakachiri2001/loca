'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Car, CheckCircle, XCircle, Search, Sparkles, MapPin, Eye } from 'lucide-react';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';

export default function AdminListingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/auth/login?redirect=/admin/listings');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings-all'],
    queryFn: () => apiClient.get('/admin/listings').then((r) => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'ADMIN',
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) =>
      apiClient.put(`/admin/listings/${id}/approve`, { status, rejectionReason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-listings-all'] }),
  });

  const listings: any[] = (data || []).filter((l: any) => {
    const matchesFilter = filter === 'ALL' || l.status === filter;
    const matchesSearch =
      !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.city?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Marketplace Quality</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Listings Moderation</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Approve or review inventory submitted by partner rental companies and automotive service centers across Zimbabwe.
        </p>
      </motion.div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filter === f
                  ? 'bg-[#008767] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {f === 'PENDING_APPROVAL' ? 'Pending Approval' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, provider, or city..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse h-20" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <Car className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-xs font-semibold text-slate-500">No listings found matching this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Service / Vehicle</th>
                  <th className="py-3.5 px-4">Provider</th>
                  <th className="py-3.5 px-4">Daily Rate</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {listings.map((l: any) => {
                  const rawImg = l.primaryImage || l.images?.[0];
                  const imgUrl = typeof rawImg === 'string' ? rawImg : rawImg?.url;

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                            {imgUrl ? (
                              <img src={imgUrl} alt={l.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Car className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#0B192C]">{l.title}</p>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4F1] text-[#008767] border border-[#B2E3D8] mt-0.5">
                              {getCategoryLabel(l.category)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-xs text-[#0B192C]">{l.company?.name || 'Verified Partner'}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{l.city || 'Harare'}, Zimbabwe</span>
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sm text-[#008767]">
                          {formatCurrency(l.pricePerDay || 0)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">/day</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(l.status)}`}>
                          {l.status === 'PENDING_APPROVAL' ? 'Pending Approval' : l.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/listing/${l.slug || l.id}`}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                            title="Preview listing"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>

                          {l.status === 'PENDING_APPROVAL' && (
                            <>
                              <button
                                onClick={() => approveMutation.mutate({ id: l.id, status: 'ACTIVE' })}
                                disabled={approveMutation.isPending}
                                className="px-2.5 py-1.5 rounded-lg bg-[#008767] hover:bg-[#007055] text-white font-bold text-[11px] flex items-center gap-1 transition"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Rejection reason:') || 'Does not meet marketplace standards';
                                  approveMutation.mutate({ id: l.id, status: 'REJECTED', rejectionReason: reason });
                                }}
                                disabled={approveMutation.isPending}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] flex items-center gap-1 transition"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {l.status === 'ACTIVE' && (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> Live
                            </span>
                          )}

                          {l.status === 'REJECTED' && (
                            <button
                              onClick={() => approveMutation.mutate({ id: l.id, status: 'ACTIVE' })}
                              className="text-[11px] font-bold text-[#008767] hover:underline"
                            >
                              Re-approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
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
