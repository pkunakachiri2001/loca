'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, Search, Shield, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/auth/login?redirect=/admin/users');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => apiClient.get('/admin/users?limit=50').then(r => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'ADMIN',
  });

  const users: any[] = (data || []).filter((u: any) =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>User Management</h1>
        <p style={{ color: '#6B6B72' }}>View and manage registered accounts across the platform.</p>
      </motion.div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} className="input-dark pl-10" placeholder="Search by name or email..." />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table-dark w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id}>
                  <td>
                    <p className="font-medium text-sm" style={{ color: '#F5F0E8' }}>{u.firstName} {u.lastName}</p>
                    <p className="text-xs" style={{ color: '#6B6B72' }}>{u.email}</p>
                  </td>
                  <td><span className="badge-info text-[10px]">{u.role}</span></td>
                  <td><span className="badge-success text-[10px]">{u.status || 'ACTIVE'}</span></td>
                  <td className="text-xs" style={{ color: '#6B6B72' }}>{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
