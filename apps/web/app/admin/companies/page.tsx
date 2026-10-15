'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, XCircle, Search, Sparkles, MapPin, Mail, Phone } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminCompaniesPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/auth/login?redirect=/admin/companies');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: () => apiClient.get('/admin/companies').then((r) => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'ADMIN',
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) =>
      apiClient.put(`/admin/companies/${id}/verify`, { status, rejectionReason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-companies'] }),
  });

  const companies: any[] = (data || []).filter((c: any) => {
    const matchesFilter = filter === 'ALL' || c.status === filter;
    const matchesSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase()) ||
      c.owner?.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-50 text-[#008767] border-emerald-200';
      case 'PENDING':
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
          <span>Platform Moderation</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Company Verification</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Review Zimbabwean corporate registrations, KYC documents, and approve vendor accounts.
        </p>
      </motion.div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filter === f
                  ? 'bg-[#008767] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or city..."
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
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <Building2 className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-xs font-semibold text-slate-500">No companies found matching the filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Company Details</th>
                  <th className="py-3.5 px-4">Owner / Contact</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {companies.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-sm text-[#0B192C]">{c.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Category: <span className="font-bold text-slate-600">{c.category || 'CAR_RENTAL'}</span>
                      </p>
                      {c.registrationNumber && (
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">Reg: {c.registrationNumber}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-xs text-[#0B192C]">
                        {c.owner ? `${c.owner.firstName} ${c.owner.lastName}` : 'Company Admin'}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{c.email || c.owner?.email}</span>
                      </p>
                      {c.phone && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-[#008767]" />
                        <span>{c.city || 'Harare'}, Zimbabwe</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {c.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => verifyMutation.mutate({ id: c.id, status: 'VERIFIED' })}
                              disabled={verifyMutation.isPending}
                              className="px-3 py-1.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Verify</span>
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Please enter reason for rejection:') || 'Incomplete registration documents';
                                verifyMutation.mutate({ id: c.id, status: 'REJECTED', rejectionReason: reason });
                              }}
                              disabled={verifyMutation.isPending}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] flex items-center gap-1 transition"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                        {c.status === 'VERIFIED' && (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> Approved
                          </span>
                        )}
                        {c.status === 'REJECTED' && (
                          <button
                            onClick={() => verifyMutation.mutate({ id: c.id, status: 'VERIFIED' })}
                            className="text-[11px] font-bold text-[#008767] hover:underline"
                          >
                            Re-verify
                          </button>
                        )}
                      </div>
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
