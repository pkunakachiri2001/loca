'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/auth/login?redirect=/admin/payments');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Platform Financials & Payouts</h1>
        <p style={{ color: '#6B6B72' }}>Track platform commission, transactions, and provider payouts.</p>
      </motion.div>

      <div className="card p-8 text-center py-16">
        <CreditCard className="h-12 w-12 mx-auto mb-4" style={{ color: '#E8A547' }} />
        <h3 className="font-display text-xl font-bold mb-2" style={{ color: '#F5F0E8' }}>Platform Payout System</h3>
        <p className="max-w-md mx-auto text-sm" style={{ color: '#6B6B72' }}>
          All booking payments are processed securely via Stripe/Paystack in Mock Mode. Commission is collected automatically.
        </p>
      </div>
    </div>
  );
}
