'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Gift, Star, TrendingUp, Award, ArrowRight, Zap, Sparkles } from 'lucide-react';

const TIERS = [
  { name: 'Bronze', min: 0, max: 999, color: '#008767', bg: '#E6F4F1', border: '#B2E3D8' },
  { name: 'Silver', min: 1000, max: 4999, color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD' },
  { name: 'Gold', min: 5000, max: 9999, color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  { name: 'Platinum', min: 10000, max: Infinity, color: '#7C3AED', bg: '#EDE9FE', border: '#DDD6FE' },
];

const HOW_TO_EARN = [
  { icon: Star, action: 'Complete a transport booking', points: '+50 pts' },
  { icon: Gift, action: 'Leave a verified review', points: '+25 pts' },
  { icon: TrendingUp, action: 'Refer a motorist or company', points: '+200 pts' },
  { icon: Zap, action: 'First valuation or booking of month', points: '+100 pts' },
];

export default function LoyaltyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login?redirect=/dashboard/loyalty');
  }, [isAuthenticated, router]);

  const { data } = useQuery({
    queryKey: ['loyalty-transactions'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/users/me/loyalty');
        const payload = res.data?.data;
        if (Array.isArray(payload)) {
          return { points: user?.loyaltyPoints ?? 0, transactions: payload };
        }
        return {
          points: payload?.points ?? user?.loyaltyPoints ?? 0,
          transactions: Array.isArray(payload?.transactions) ? payload.transactions : [],
        };
      } catch (e) {
        return { points: user?.loyaltyPoints ?? 0, transactions: [] };
      }
    },
    enabled: !!isAuthenticated,
  });

  const points = data?.points ?? user?.loyaltyPoints ?? 0;
  const tier = TIERS.find((t) => points >= t.min && points <= t.max) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const progress = nextTier ? ((points - tier.min) / (nextTier.min - tier.min)) * 100 : 100;
  const transactions: any[] = data?.transactions || [];

  return (
    <div className="max-w-3xl mx-auto text-[#0B192C]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Famba Rewards</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Loyalty Points</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Earn points with every booking and unlock discounts across Zimbabwe.
        </p>
      </motion.div>

      {/* Points Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative rounded-3xl overflow-hidden p-8 mb-6 bg-gradient-to-br from-[#008767] to-[#0B192C] text-white shadow-xl"
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-white/20 text-emerald-200 border border-white/20">
                {tier.name} Status
              </span>
              <p className="font-display text-5xl font-extrabold text-white mt-3">
                {points.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-emerald-200 mt-1">Available Loyalty Points</p>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/10 border border-white/20 text-white">
              <Award className="h-7 w-7" />
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div>
              <div className="flex justify-between text-xs font-bold mb-2 text-emerald-100">
                <span>{tier.name}</span>
                <span>{nextTier.min - points} pts to {nextTier.name}</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-white"
                  style={{ width: `${Math.min(100, progress)}%` }}
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
        className="bg-white rounded-3xl p-6 mb-6 border border-slate-200 shadow-sm"
      >
        <h2 className="font-display text-base font-bold text-[#0B192C] mb-4">Membership Tiers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`text-center p-3.5 rounded-2xl border transition-all ${
                tier.name === t.name
                  ? 'bg-[#E6F4F1] border-[#B2E3D8] shadow-sm'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <p className="font-bold text-xs" style={{ color: t.color }}>{t.name}</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                {t.min.toLocaleString()} {t.max !== Infinity ? `- ${t.max.toLocaleString()}` : '+'} pts
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
        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"
      >
        <h2 className="font-display text-base font-bold text-[#0B192C] mb-4">How to Earn Points</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {HOW_TO_EARN.map((item) => (
            <div key={item.action} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-[#0B192C]">{item.action}</span>
              </div>
              <span className="text-xs font-extrabold text-[#008767]">{item.points}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
