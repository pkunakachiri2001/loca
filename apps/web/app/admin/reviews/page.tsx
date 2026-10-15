'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { motion } from 'framer-motion';
import { Star, Sparkles, ShieldCheck } from 'lucide-react';

export default function AdminReviewsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/auth/login?redirect=/admin/reviews');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  return (
    <div className="max-w-5xl mx-auto text-[#0B192C]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Feedback Integrity</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Customer Reviews Moderation</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Ensure transparency, combat fake feedback, and uphold customer satisfaction standards across Zimbabwe.
        </p>
      </motion.div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center py-16 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Star className="h-8 w-8 fill-amber-500 text-amber-500" />
        </div>
        <h3 className="font-display text-xl font-bold text-[#0B192C] mb-2">Verified Renter Reviews</h3>
        <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
          Reviews can only be submitted after a verified booking reaches <strong>COMPLETED</strong> status. Flagged or abusive reviews can be hidden directly by Super Admins.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#008767] text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Anti-Spam Verification Active</span>
        </div>
      </div>
    </div>
  );
}
