'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Bookmark, Star, Gift, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
  BOOKING: Bookmark,
  REVIEW: Star,
  PROMO: Gift,
  SYSTEM: AlertCircle,
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/users/me/notifications').then(r => r.data.data).catch(() => []),
    enabled: !!isAuthenticated,
  });

  const markAll = useMutation({
    mutationFn: () => apiClient.put('/users/me/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications: any[] = data || [];
  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Notifications</h1>
          <p style={{ color: '#6B6B72' }}>{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        {unread > 0 && (
          <button onClick={() => markAll.mutate()} className="btn-ghost text-sm" style={{ color: '#E8A547' }}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: '#1A1A1C', border: '1px solid #2E2E34' }}>
            <Bell className="h-8 w-8" style={{ color: '#3A3A3E' }} />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: '#F5F0E8' }}>No notifications yet</h3>
          <p style={{ color: '#6B6B72' }}>You'll be notified about bookings, promotions, and updates here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any, i: number) => {
            const Icon = ICON_MAP[n.type] || Bell;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card p-4 flex items-start gap-4"
                style={!n.isRead ? { borderColor: 'rgba(232,165,71,0.2)', background: 'rgba(232,165,71,0.03)' } : {}}
              >
                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ background: n.isRead ? '#242428' : 'rgba(232,165,71,0.1)', border: '1px solid ' + (n.isRead ? '#2E2E34' : 'rgba(232,165,71,0.25)') }}>
                  <Icon className="h-4 w-4" style={{ color: n.isRead ? '#6B6B72' : '#E8A547' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-0.5" style={{ color: '#F5F0E8' }}>{n.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#6B6B72' }}>{n.message}</p>
                  <p className="text-xs mt-2" style={{ color: '#5A5A60' }}>{formatDate(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: '#E8A547' }} />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
