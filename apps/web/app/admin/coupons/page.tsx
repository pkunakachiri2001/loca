'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { motion } from 'framer-motion';
import { Tag, Plus } from 'lucide-react';

export default function AdminCouponsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/auth/login?redirect=/admin/coupons');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Promotions & Coupons</h1>
          <p style={{ color: '#6B6B72' }}>Manage discount codes and promotional campaigns.</p>
        </div>
        <button className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Create Coupon
        </button>
      </motion.div>

      <div className="card p-8 text-center py-16">
        <Tag className="h-12 w-12 mx-auto mb-4" style={{ color: '#E8A547' }} />
        <h3 className="font-display text-xl font-bold mb-2" style={{ color: '#F5F0E8' }}>Coupon Management</h3>
        <p className="max-w-md mx-auto text-sm" style={{ color: '#6B6B72' }}>
          Create percentage or fixed discounts for first-time bookings or special campaigns.
        </p>
      </div>
    </div>
  );
}
