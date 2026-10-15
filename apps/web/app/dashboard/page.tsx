'use client';

import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Bookmark, Heart, Star, Gift, ArrowRight, Car, CheckCircle,
  Clock, MapPin, User, Search, DollarSign, Globe, ShieldCheck
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
    } else if (user?.role === 'ADMIN') {
      router.push('/admin');
    } else if (user?.role === 'COMPANY_OWNER') {
      router.push('/company/dashboard');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['my-bookings-summary'],
    queryFn: () => apiClient.get('/users/me/bookings?limit=5').then((r) => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'CUSTOMER',
  });

  const { data: wishlistData } = useQuery({
    queryKey: ['my-wishlist-summary'],
    queryFn: () => apiClient.get('/users/me/wishlist').then((r) => r.data.data),
    enabled: !!isAuthenticated && user?.role === 'CUSTOMER',
  });

  const bookings = bookingsData || [];
  const wishlistCount = (wishlistData || []).length;

  const stats = [
    { icon: Bookmark, label: 'My Bookings', value: bookings.length, color: '#008767', bg: '#E6F4F1' },
    { icon: CheckCircle, label: 'Completed Trips', value: bookings.filter((b: any) => b.status === 'COMPLETED').length, color: '#059669', bg: '#D1FAE5' },
    { icon: Gift, label: 'Loyalty Points', value: user?.loyaltyPoints || 0, color: '#D97706', bg: '#FEF3C7' },
    { icon: Heart, label: 'Saved Vehicles', value: wishlistCount, color: '#E11D48', bg: '#FFE4E6' },
  ];

  if (!isAuthenticated || user?.role !== 'CUSTOMER') {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider">
              Customer Portal
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#008767]" />
              <span>Zimbabwe</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#008767]" />
              <span>USD</span>
            </span>
          </div>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#0B192C] mb-1">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-slate-600 text-sm md:text-base">
          Here is an overview of your bookings, verified vehicles, and saved services in Zimbabwe.
        </p>
      </motion.div>

      {/* Customer Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-[#008767] transition-all"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: stat.bg }}
            >
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <p className="font-display text-3xl font-extrabold text-[#0B192C] mb-0.5">{stat.value}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Navigation Action Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-2 border-[#008767]/30 shadow-sm"
      >
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#008767] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Famba Smart Mobility</span>
          </div>
          <h3 className="font-display font-extrabold text-xl text-[#0B192C] mb-1">
            Ready for your next journey in Zimbabwe?
          </h3>
          <p className="text-sm text-slate-600">
            Explore 500+ verified car rentals, buses, workshops, and defensible vehicle valuations with transparent USD pricing.
          </p>
        </div>
        <Link
          href="/search"
          className="px-6 py-3.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-sm shadow-md shadow-[#008767]/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Search className="h-4 w-4" />
          <span>Browse Marketplace</span>
        </Link>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm mb-8 overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="font-display font-bold text-lg text-[#0B192C]">Recent Bookings</h2>
            <p className="text-xs text-slate-500">Live booking activity and status</p>
          </div>
          <Link
            href="/dashboard/bookings"
            className="flex items-center gap-1 text-sm font-bold text-[#008767] hover:text-[#007358] transition"
          >
            <span>View all</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-[#008767]">
              <Car className="h-7 w-7" />
            </div>
            <p className="font-bold text-base text-[#0B192C] mb-1">No bookings yet</p>
            <p className="text-sm text-slate-500 mb-5">
              Find and reserve verified transport across Harare, Bulawayo, or Victoria Falls in under 60 seconds.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-sm shadow-sm transition"
            >
              <span>Find a Vehicle</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((booking: any) => (
              <div
                key={booking.id}
                className="flex items-center gap-4 p-5 hover:bg-slate-50/70 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                  {booking.listing?.images?.[0]?.url ? (
                    <img
                      src={booking.listing.images[0].url}
                      alt={booking.listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Car className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-[#0B192C] truncate">
                    {booking.listing?.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)} • {booking.listing?.city || 'Harare, Zimbabwe'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-[#0B192C]">
                    ${booking.totalAmount || 0} USD
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold mt-1 ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Customer Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        {[
          { href: '/search', icon: Car, label: 'Search Marketplace', desc: 'Find rentals & workshops' },
          { href: '/valuation', icon: DollarSign, label: 'Car Valuation', desc: 'Zimnat defensible certificate' },
          { href: '/dashboard/wishlist', icon: Heart, label: 'Saved Listings', desc: 'View saved items' },
          { href: '/dashboard/profile', icon: User, label: 'Account Settings', desc: 'Zimbabwe profile & USD' },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-[#008767] hover:-translate-y-1 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] flex items-center justify-center mb-3 text-[#008767] group-hover:scale-105 transition-transform">
              <Icon className="h-5 w-5" />
            </div>
            <p className="font-bold text-sm text-[#0B192C] mb-0.5">{label}</p>
            <p className="text-xs text-slate-500">{desc}</p>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
