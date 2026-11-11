'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, getRoleHome } from '@/store/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, Search, Sparkles, Mail, ShieldCheck, Ban, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING_VERIFICATION' | 'INSURANCE_AGENT' | 'COMPANY_OWNER'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.replace('/auth/login?redirect=/admin/users');
      return;
    }
    if (user?.role !== 'ADMIN') {
      router.replace(getRoleHome(user?.role));
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => apiClient.get('/admin/users?limit=100').then((r) => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'ADMIN',
  });

  const handleStatusChange = async (userId: string, nextStatus: 'ACTIVE' | 'SUSPENDED') => {
    setUpdatingId(userId);
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { status: nextStatus });
      await queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not update account status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const allUsers: any[] = data || [];
  const pendingCount = allUsers.filter((u) => u.status === 'PENDING_VERIFICATION').length;

  const users: any[] = allUsers.filter((u: any) => {
    const matchesTab =
      filterTab === 'ALL' ||
      (filterTab === 'PENDING_VERIFICATION' && u.status === 'PENDING_VERIFICATION') ||
      u.role === filterTab;

    const matchesSearch =
      !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'COMPANY_OWNER':
        return 'bg-emerald-50 text-[#008767] border-emerald-200';
      case 'INSURANCE_AGENT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SUSPENDED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-emerald-50 text-[#008767] border-emerald-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto text-[#0B192C]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>User Directory</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">User Management</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          View registered customer accounts, vendor owners, and administrative staff across Famba.
        </p>
      </motion.div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'All Users' },
            { id: 'PENDING_VERIFICATION', label: `Pending Approval${pendingCount ? ` (${pendingCount})` : ''}` },
            { id: 'INSURANCE_AGENT', label: 'Insurer Partners' },
            { id: 'COMPANY_OWNER', label: 'Dealerships' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                filterTab === tab.id
                  ? 'bg-[#008767] text-white border-[#008767]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] bg-white shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse h-16" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <Users className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-xs font-semibold text-slate-500">No registered users found matching the query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Account Holder</th>
                  <th className="py-3.5 px-4">Platform Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] font-bold text-xs flex items-center justify-center shrink-0">
                          {u.firstName?.[0] || 'U'}
                          {u.lastName?.[0] || ''}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#0B192C]">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{u.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(u.role)}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(u.status || 'ACTIVE')}`}>
                        {(u.status || 'ACTIVE').replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {u.role === 'ADMIN' ? (
                        <span className="text-[11px] text-slate-400">Protected</span>
                      ) : u.status !== 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                          disabled={updatingId === u.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white text-[11px] font-bold transition disabled:opacity-60"
                        >
                          {updatingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                          Approve / Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                          disabled={updatingId === u.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold transition disabled:opacity-60"
                        >
                          {updatingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                          Suspend
                        </button>
                      )}
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
