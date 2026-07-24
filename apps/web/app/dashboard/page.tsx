'use client';

import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Bookmark, Heart, Star, Gift, ArrowRight, Car, CheckCircle,
  Clock, MapPin, User, Search
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
    { icon: Bookmark, label: 'My Bookings', value: bookings.length, color: '#E8A547', bg: 'rgba(232,165,71,0.1)' },
    { icon: CheckCircle, label: 'Completed Trips', value: bookings.filter((b: any) => b.status === 'COMPLETED').length, color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
    { icon: Gift, label: 'Loyalty Points', value: user?.loyaltyPoints || 0, color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
    { icon: Heart, label: 'Saved Vehicles', value: wishlistCount, color: '#F87171', bg: 'rgba(248,113,113,0.1)' },
  ];

  if (!isAuthenticated || user?.role !== 'CUSTOMER') {
    return null; // Prevents flash before redirection
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-info text-xs">Customer Portal</span>
        </div>
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p style={{ color: '#6B6B72' }}>Here's an overview of your bookings and saved services on FleetNest.</p>
      </motion.div>

      {/* Customer Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-5"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: stat.bg, border: `1px solid ${stat.color}33` }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <p className="font-display text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm" style={{ color: '#6B6B72' }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Navigation Action Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #1A1A1C 0%, rgba(232,165,71,0.08) 100%)' }}
      >
        <div>
          <h3 className="font-display font-semibold text-lg mb-1" style={{ color: '#F5F0E8' }}>Ready for your next trip?</h3>
          <p className="text-sm" style={{ color: '#6B6B72' }}>Explore 500+ verified car rentals, buses, and professional drivers.</p>
        </div>
        <Link href="/search" className="btn-primary shrink-0 py-3 px-6">
          <Search className="h-4 w-4" /> Browse Marketplace
        </Link>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card mb-8"
      >
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #1E1E22' }}>
          <h2 className="font-display font-semibold" style={{ color: '#F5F0E8' }}>Recent Bookings</h2>
          <Link href="/dashboard/bookings" className="flex items-center gap-1 text-sm font-medium" style={{ color: '#E8A547' }}>
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#242428', border: '1px solid #2E2E34' }}>
              <Car className="h-7 w-7" style={{ color: '#3A3A3E' }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: '#F5F0E8' }}>No bookings yet</p>
            <p className="text-sm mb-5" style={{ color: '#6B6B72' }}>Find and reserve your ideal transport in under 60 seconds.</p>
            <Link href="/search" className="btn-primary text-sm px-6">
              Find a Vehicle
            </Link>
          </div>
        ) : (
          <div>
            {bookings.map((booking: any) => (
              <div
                key={booking.id}
                className="flex items-center gap-4 p-4 transition-colors"
                style={{ borderBottom: '1px solid #1E1E22' }}
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: '#242428' }}>
                  {booking.listing?.images?.[0]?.url ? (
                    <img src={booking.listing.images[0].url} alt={booking.listing.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Car className="h-5 w-5" style={{ color: '#3A3A3E' }} /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate" style={{ color: '#F5F0E8' }}>{booking.listing?.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B6B72' }}>
                    {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold" style={{ color: '#F5F0E8' }}>{formatCurrency(booking.totalAmount)}</p>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold mt-1 ${getStatusColor(booking.status)}`}>
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
          { href: '/search', icon: Car, label: 'Search Marketplace', desc: 'Find rentals & services' },
          { href: '/dashboard/wishlist', icon: Heart, label: 'Saved Listings', desc: 'View saved items' },
          { href: '/dashboard/loyalty', icon: Gift, label: 'Rewards Program', desc: 'Check point balance' },
          { href: '/dashboard/profile', icon: User, label: 'Account Settings', desc: 'Edit profile & security' },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href} className="card p-5 transition-all hover:-translate-y-1 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
              style={{ background: 'rgba(232,165,71,0.1)', border: '1px solid rgba(232,165,71,0.25)' }}>
              <Icon className="h-5 w-5" style={{ color: '#E8A547' }} />
            </div>
            <p className="font-semibold text-sm mb-0.5" style={{ color: '#F5F0E8' }}>{label}</p>
            <p className="text-xs" style={{ color: '#6B6B72' }}>{desc}</p>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
