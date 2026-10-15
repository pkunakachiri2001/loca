'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Heart, Trash2, Star, MapPin, Search, Car, Sparkles } from 'lucide-react';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login?redirect=/dashboard/wishlist');
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => apiClient.get('/users/me/wishlist').then((r) => r.data.data).catch(() => []),
    enabled: !!isAuthenticated,
  });

  const removeItem = useMutation({
    mutationFn: (listingId: string) => apiClient.delete(`/users/me/wishlist/${listingId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const items: any[] = Array.isArray(data) ? data : [];

  return (
    <div className="max-w-5xl mx-auto text-[#0B192C]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Saved Vehicles</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">My Wishlist</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          {items.length} saved listing{items.length !== 1 ? 's' : ''} across Zimbabwe
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse h-72" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#0B192C] mb-1">Nothing saved yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Save vehicles or services you like by tapping the heart icon while browsing the Zimbabwe marketplace.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-xs shadow-sm transition"
          >
            <Search className="h-4 w-4" /> Explore Services
          </Link>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {items.map((item: any, i: number) => {
              const price = item.listing?.pricePerDay || item.listing?.price || 0;
              const imageUrl =
                item.listing?.primaryImage ||
                item.listing?.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=240&fit=crop';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#008767] transition-all overflow-hidden flex flex-col justify-between group"
                >
                  <Link href={`/listing/${item.listing?.slug || item.listingId}`}>
                    <div className="relative h-44 overflow-hidden bg-slate-100">
                      <img
                        src={imageUrl}
                        alt={item.listing?.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-[#008767] border border-slate-200 shadow-sm">
                        {getCategoryLabel(item.listing?.category)}
                      </span>
                      <span className="absolute bottom-3 left-3 font-extrabold text-xs px-2.5 py-1 rounded-full bg-[#0B192C]/80 text-white backdrop-blur-sm shadow-sm">
                        ${price} USD /day
                      </span>
                    </div>
                  </Link>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-[#0B192C] line-clamp-1 group-hover:text-[#008767] transition-colors">
                        {item.listing?.title}
                      </h3>
                      <button
                        onClick={() => removeItem.mutate(item.listingId)}
                        disabled={removeItem.isPending}
                        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-[#008767]" />
                        {item.listing?.city || 'Harare'}, Zimbabwe
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        {item.listing?.rating?.toFixed ? item.listing.rating.toFixed(1) : '4.9'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
