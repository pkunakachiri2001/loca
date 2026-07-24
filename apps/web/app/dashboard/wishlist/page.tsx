'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Heart, Trash2, Star, MapPin, Search, Car } from 'lucide-react';
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
    queryFn: () => apiClient.get('/users/me/wishlist').then(r => r.data.data),
    enabled: !!isAuthenticated,
  });

  const removeItem = useMutation({
    mutationFn: (listingId: string) => apiClient.delete(`/users/me/wishlist/${listingId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const items: any[] = data || [];

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Wishlist</h1>
        <p style={{ color: '#6B6B72' }}>{items.length} saved listing{items.length !== 1 ? 's' : ''}</p>
      </motion.div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton rounded-xl h-72" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: '#1A1A1C', border: '1px solid #2E2E34' }}>
            <Heart className="h-8 w-8" style={{ color: '#3A3A3E' }} />
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: '#F5F0E8' }}>Nothing saved yet</h3>
          <p className="mb-6" style={{ color: '#6B6B72' }}>Save listings you like by tapping the heart icon while browsing.</p>
          <Link href="/search" className="btn-primary">
            <Search className="h-4 w-4" /> Explore listings
          </Link>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {items.map((item: any, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                transition={{ delay: i * 0.05 }}
                className="vehicle-card group"
              >
                <Link href={`/listing/${item.listing?.slug || item.listingId}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.listing?.primaryImage || item.listing?.images?.[0]?.url || 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=240&fit=crop'}
                      alt={item.listing?.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0" style={{
                      background: 'linear-gradient(to top, rgba(14,14,16,0.7) 0%, transparent 50%)'
                    }} />
                    <span className="badge-info absolute top-3 left-3 text-[10px]">{getCategoryLabel(item.listing?.category)}</span>
                    <span className="absolute bottom-3 left-3 font-semibold text-sm text-white">
                      {formatCurrency(item.listing?.pricePerDay)}/day
                    </span>
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-sm line-clamp-1" style={{ color: '#F5F0E8' }}>{item.listing?.title}</h3>
                    <button
                      onClick={() => removeItem.mutate(item.listingId)}
                      disabled={removeItem.isPending}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10 group/btn"
                      style={{ border: '1px solid #2E2E34' }}
                    >
                      <Trash2 className="h-3.5 w-3.5 group-hover/btn:text-red-400 transition-colors" style={{ color: '#5A5A60' }} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs flex items-center gap-1" style={{ color: '#6B6B72' }}>
                      <MapPin className="h-3 w-3" />{item.listing?.city}
                    </span>
                    {item.listing?.rating && (
                      <span className="text-xs flex items-center gap-1" style={{ color: '#F5F0E8' }}>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {item.listing.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
