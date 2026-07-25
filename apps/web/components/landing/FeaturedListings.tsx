'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, MapPin, Car } from 'lucide-react';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';

// Static featured data for SSR — real data would be fetched via React Query
const featuredListings = [
  {
    id: 'feat-1',
    title: 'Toyota Camry 2023 — Business Class',
    category: 'CAR_RENTAL',
    city: 'Harare',
    pricePerDay: 50,
    currency: 'USD',
    rating: 4.9,
    totalReviews: 45,
    primaryImage: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop',
    company: { name: 'Harare Executive Motors', logo: null },
    features: ['AC', 'GPS', 'Leather Seats', 'Bluetooth'],
    make: 'Toyota', model: 'Camry', year: 2023,
  },
  {
    id: 'feat-2',
    title: 'Toyota Land Cruiser V8 — Safari SUV',
    category: 'CAR_RENTAL',
    city: 'Harare',
    pricePerDay: 120,
    currency: 'USD',
    rating: 4.8,
    totalReviews: 32,
    primaryImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop',
    company: { name: 'Harare Executive Motors', logo: null },
    features: ['4WD', 'Sunroof', 'DVD', 'Rear AC'],
    make: 'Toyota', model: 'Land Cruiser', year: 2022,
  },
  {
    id: 'feat-3',
    title: 'Toyota Hiace 14-Seater Minibus',
    category: 'BUS_RENTAL',
    city: 'Victoria Falls',
    pricePerDay: 85,
    currency: 'USD',
    rating: 4.7,
    totalReviews: 28,
    primaryImage: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&h=600&fit=crop',
    company: { name: 'Victoria Falls Safaris', logo: null },
    features: ['AC', 'PA System', 'USB Charging'],
    seatingCapacity: 14,
  },
  {
    id: 'feat-4',
    title: 'Full Detail & Ceramic Coating Package',
    category: 'CAR_WASH',
    city: 'Bulawayo',
    pricePerDay: 35,
    currency: 'USD',
    rating: 4.9,
    totalReviews: 87,
    primaryImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    company: { name: 'Bulawayo Express Auto Spa', logo: null },
    features: ['Ceramic Coating', 'Interior Clean', 'Engine Bay'],
  },
];

export function FeaturedListings() {
  return (
    <section className="py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <span className="section-badge mb-4 inline-flex">Top Picks</span>
            <h2 className="font-display text-4xl font-bold text-white md:text-5xl">
              Featured{' '}
              <span className="gradient-text">Listings</span>
            </h2>
          </div>
          <Link
            href="/search"
            className="transition-colors font-medium flex items-center gap-2 shrink-0 text-sm"
            style={{ color: '#E8A547' }}
          >
            View all listings →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredListings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/listing/${listing.id}`}>
                <div className="vehicle-card group">
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden rounded-t-2xl">
                    <img
                      src={listing.primaryImage}
                      alt={listing.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop';
                      }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="badge-info">
                        <Car className="h-3 w-3" />
                        {getCategoryLabel(listing.category)}
                      </span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => { e.preventDefault(); }}
                      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:text-red-400 transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                    </button>

                    {/* Price overlay */}
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-lg bg-black/60 backdrop-blur-sm px-2.5 py-1 text-sm font-bold text-white">
                        {formatCurrency(listing.pricePerDay)} / day
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Company */}
                    <p className="text-xs text-slate-400 mb-1">{listing.company.name}</p>

                    {/* Title */}
                    <h3 className="font-semibold text-white text-sm leading-tight mb-2 line-clamp-2">
                      {listing.title}
                    </h3>

                    {/* Location & Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {listing.city}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium text-white">{listing.rating}</span>
                        <span className="text-xs text-slate-500">({listing.totalReviews})</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {listing.features.slice(0, 3).map((f) => (
                        <span key={f} className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-slate-400">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
