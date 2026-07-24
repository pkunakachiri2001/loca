'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, XCircle, Clock, MapPin, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminCompaniesPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/auth/login?redirect=/admin/companies');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: () => apiClient.get('/admin/companies').then(r => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'ADMIN',
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => apiClient.put(`/admin/companies/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-companies'] }),
  });

  const companies: any[] = data || [];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Company Verification</h1>
        <p style={{ color: '#6B6B72' }}>Review business registrations and approve provider applications.</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : companies.length === 0 ? (
        <div className="card text-center py-20 p-6">
          <Building2 className="h-10 w-10 mx-auto mb-3" style={{ color: '#3A3A3E' }} />
          <p style={{ color: '#6B6B72' }}>No registered companies found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table-dark w-full">
            <thead>
              <tr>
                <th>Company</th>
                <th>City</th>
                <th>Category</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c: any) => (
                <tr key={c.id}>
                  <td>
                    <p className="font-medium text-sm" style={{ color: '#F5F0E8' }}>{c.name}</p>
                    <p className="text-xs" style={{ color: '#6B6B72' }}>{c.email}</p>
                  </td>
                  <td className="text-xs" style={{ color: '#9A9A9E' }}>{c.city}</td>
                  <td><span className="badge-info text-[10px]">{c.category || 'CAR_RENTAL'}</span></td>
                  <td>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => verifyMutation.mutate({ id: c.id, status: 'VERIFIED' })}
                          className="btn-primary text-xs py-1 px-3"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Verify
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
