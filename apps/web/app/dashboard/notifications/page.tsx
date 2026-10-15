'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Bookmark, Star, Gift, AlertCircle, Sparkles } from 'lucide-react';
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
    if (!isAuthenticated) router.push('/auth/login?redirect=/dashboard/notifications');
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/users/me/notifications');
        const payload = res.data?.data;
        if (Array.isArray(payload)) {
          return { notifications: payload, unreadCount: payload.filter((n: any) => !n.isRead).length };
        }
        return {
          notifications: Array.isArray(payload?.notifications) ? payload.notifications : [],
          unreadCount: typeof payload?.unreadCount === 'number' ? payload.unreadCount : 0,
        };
      } catch (e) {
        return { notifications: [], unreadCount: 0 };
      }
    },
    enabled: !!isAuthenticated,
  });

  const markAll = useMutation({
    mutationFn: () => apiClient.put('/users/me/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications: any[] = data?.notifications || [];
  const unread = data?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto text-[#0B192C]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Activity Feed</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Notifications</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            {unread > 0 ? `${unread} unread update${unread !== 1 ? 's' : ''}` : 'You are all caught up'}
          </p>
        </div>

        {unread > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="px-4 py-2 rounded-xl bg-[#E6F4F1] hover:bg-[#d4eee6] text-[#008767] border border-[#B2E3D8] font-bold text-xs flex items-center gap-1.5 transition"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all read</span>
          </button>
        )}
      </motion.div>

      {/* Notifications list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#0B192C] mb-1">No notifications yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You will receive instant updates regarding your vehicle bookings, insurance policies, and platform services here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any, i: number) => {
            const Icon = ICON_MAP[n.type] || Bell;
            return (
              <motion.div
                key={n.id || i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-2xl p-4.5 border transition-all flex items-start gap-4 shadow-sm ${
                  !n.isRead
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                    !n.isRead
                      ? 'bg-[#E6F4F1] text-[#008767] border border-[#B2E3D8]'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-[#0B192C] line-clamp-1">{n.title}</p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#008767] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2">{formatDate(n.createdAt)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
