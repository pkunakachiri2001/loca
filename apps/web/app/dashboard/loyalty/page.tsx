'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Gift, Star, TrendingUp, Award, ArrowRight, Zap } from 'lucide-react';

const TIERS = [
  { name: 'Bronze', min: 0, max: 999, color: '#CD7F32', bg: 'rgba(205,127,50,0.1)', border: 'rgba(205,127,50,0.25)' },
  { name: 'Silver', min: 1000, max: 4999, color: '#A8A9AD', bg: 'rgba(168,169,173,0.1)', border: 'rgba(168,169,173,0.25)' },
  { name: 'Gold', min: 5000, max: 9999, color: '#E8A547', bg: 'rgba(232,165,71,0.1)', border: 'rgba(232,165,71,0.25)' },
  { name: 'Platinum', min: 10000, max: Infinity, color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)' },
];

const HOW_TO_EARN = [
  { icon: Star, action: 'Complete a booking', points: '+50 pts' },
  { icon: Gift, action: 'Leave a review', points: '+25 pts' },
  { icon: TrendingUp, action: 'Refer a friend', points: '+200 pts' },
  { icon: Zap, action: 'First booking of month', points: '+100 pts' },
];

export default function LoyaltyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login?redirect=/dashboard/loyalty');
  }, [isAuthenticated, router]);

  const { data } = useQuery({
    queryKey: ['loyalty-transactions'],
    queryFn: () => apiClient.get('/users/me/loyalty').then(r => r.data.data).catch(() => []),
    enabled: !!isAuthenticated,
  });

  const points = user?.loyaltyPoints ?? 0;
  const tier = TIERS.find(t => points >= t.min && points <= t.max) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const progress = nextTier ? ((points - tier.min) / (nextTier.min - tier.min)) * 100 : 100;

  const transactions: any[] = data || [];

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Loyalty Rewards</h1>
        <p style={{ color: '#6B6B72' }}>Earn points with every booking and unlock exclusive benefits.</p>
      </motion.div>

      {/* Points Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative rounded-2xl overflow-hidden p-8 mb-6"
        style={{
          background: `linear-gradient(135deg, #1A1A1C 0%, #242428 100%)`,
          border: `1px solid ${tier.border}`,
        }}
      >
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{
          background: `radial-gradient(circle at center, ${tier.bg} 0%, transparent 70%)`,
          transform: 'translate(30%, -30%)'
        }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-1" style={{ color: tier.color }}>
                {tier.name} Member
              </p>
              <p className="font-display text-5xl font-bold" style={{ color: '#F5F0E8' }}>
                {points.toLocaleString()}
              </p>
              <p className="text-sm mt-1" style={{ color: '#6B6B72' }}>loyalty points</p>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: tier.bg, border: `1px solid ${tier.border}` }}>
              <Award className="h-7 w-7" style={{ color: tier.color }} />
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div>
              <div className="flex justify-between text-xs mb-2" style={{ color: '#6B6B72' }}>
                <span>{tier.name}</span>
                <span>{nextTier.min - points} pts to {nextTier.name}</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: '#2E2E34' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, progress)}%`, background: tier.color }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tier overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 mb-6"
      >
        <h2 className="font-display text-lg font-semibold mb-4" style={{ color: '#F5F0E8' }}>Membership Tiers</h2>
        <div className="grid grid-cols-4 gap-3">
          {TIERS.map(t => (
            <div
              key={t.name}
              className="text-center p-3 rounded-xl"
              style={{
                background: tier.name === t.name ? t.bg : 'transparent',
                border: `1px solid ${tier.name === t.name ? t.border : '#1E1E22'}`,
              }}
            >
              <Award className="h-5 w-5 mx-auto mb-1.5" style={{ color: t.color }} />
              <p className="text-xs font-semibold mb-0.5" style={{ color: tier.name === t.name ? t.color : '#6B6B72' }}>
                {t.name}
              </p>
              <p className="text-xs" style={{ color: '#5A5A60' }}>
                {t.min === 0 ? '0' : `${(t.min / 1000).toFixed(0)}k`}+ pts
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* How to earn */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-6 mb-6"
      >
        <h2 className="font-display text-lg font-semibold mb-4" style={{ color: '#F5F0E8' }}>How to earn points</h2>
        <div className="space-y-3">
          {HOW_TO_EARN.map(({ icon: Icon, action, points }) => (
            <div key={action} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(232,165,71,0.1)', border: '1px solid rgba(232,165,71,0.2)' }}>
                  <Icon className="h-4 w-4" style={{ color: '#E8A547' }} />
                </div>
                <span className="text-sm" style={{ color: '#9A9A9E' }}>{action}</span>
              </div>
              <span className="text-sm font-semibold font-display" style={{ color: '#E8A547' }}>{points}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Transaction history */}
      {transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="font-display text-lg font-semibold mb-4" style={{ color: '#F5F0E8' }}>Transaction History</h2>
          <div className="space-y-3">
            {transactions.slice(0, 10).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #1E1E22' }}>
                <div>
                  <p className="text-sm" style={{ color: '#F5F0E8' }}>{tx.description}</p>
                  <p className="text-xs" style={{ color: '#6B6B72' }}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <span
                  className="text-sm font-semibold font-display"
                  style={{ color: tx.type === 'EARNED' ? '#34D399' : '#F87171' }}
                >
                  {tx.type === 'EARNED' ? '+' : '-'}{tx.points} pts
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
