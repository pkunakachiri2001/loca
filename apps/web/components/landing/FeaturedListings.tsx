'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Star, Heart, MapPin, Car } from 'lucide-react';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';

const featuredListings = [
  {
    id: 'feat-1',
    title: 'Toyota Land Cruiser 300 (LC300) V6 — Luxury Safari & VIP',
    category: 'CAR_RENTAL',
    city: 'Harare',
    pricePerDay: 180,
    currency: 'USD',
    rating: 4.95,
    totalReviews: 54,
    primaryImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&h=600&fit=crop',
    company: { name: 'Harare Executive Motors', logo: null },
    features: ['4WD All-Terrain', 'Sunroof', 'Executive Leather', 'Rear Climate'],
    make: 'Toyota', model: 'Land Cruiser LC300', year: 2024,
  },
  {
    id: 'feat-2',
    title: 'Mercedes-Benz E-Class — Executive Chauffeur & Business',
    category: 'CAR_RENTAL',
    city: 'Harare',
    pricePerDay: 110,
    currency: 'USD',
    rating: 4.9,
    totalReviews: 42,
    primaryImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop',
    company: { name: 'Harare Prestige Chauffeurs', logo: null },
    features: ['Chauffeur Available', 'Leather Seats', 'Burmester Audio', 'AC'],
    make: 'Mercedes-Benz', model: 'E-Class', year: 2023,
  },
  {
    id: 'feat-3',
    title: 'City Link Luxury Coach — Harare ⇄ Bulawayo / Vic Falls',
    category: 'BUS_RENTAL',
    city: 'Bulawayo',
    pricePerDay: 260,
    currency: 'USD',
    rating: 4.85,
    totalReviews: 89,
    primaryImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
    company: { name: 'City Link Coaches Zimbabwe', logo: null },
    features: ['Reclining Luxury Seats', 'Onboard WiFi', 'Air Conditioning', 'USB Charging'],
    seatingCapacity: 52,
  },
];

export function FeaturedListings() {
  return (
    <section className="py-24 bg-[#FAFCFB]">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <span className="section-badge mb-3 inline-flex">Top Picks</span>
            <h2 className="font-display text-4xl font-extrabold text-[#0B192C] md:text-5xl">
              Featured <span className="text-[#008767]">Services</span>
            </h2>
          </div>
          <Link
            href="/search"
            className="text-[#008767] font-bold hover:underline flex items-center gap-2 shrink-0 text-sm"
          >
            View all listings →
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {featuredListings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/listing/${listing.id}`}>
                <div className="vehicle-card group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#008767] transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden rounded-t-2xl">
                    <img
                      src={listing.primaryImage}
                      alt={listing.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop';
                      }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="badge-info bg-white/90 text-[#008767] border-0 backdrop-blur-md shadow-sm font-bold">
                        <Car className="h-3 w-3" />
                        {getCategoryLabel(listing.category)}
                      </span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => { e.preventDefault(); }}
                      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-slate-700 hover:text-red-500 transition-colors shadow-sm"
                    >
                      <Heart className="h-4 w-4" />
                    </button>

                    {/* Price overlay */}
                    <div className="absolute bottom-3 left-3">
                      <span className="rounded-xl bg-[#008767] px-3 py-1 text-sm font-extrabold text-white shadow-md">
                        {formatCurrency(listing.pricePerDay)} / day
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Company */}
                    <p className="text-xs text-slate-500 font-semibold mb-1">{listing.company.name}</p>

                    {/* Title */}
                    <h3 className="font-bold text-[#0B192C] text-base leading-snug mb-2 line-clamp-2">
                      {listing.title}
                    </h3>

                    {/* Location & Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-[#008767]" />
                        {listing.city}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-[#0B192C]">{listing.rating}</span>
                        <span className="text-xs text-slate-400">({listing.totalReviews})</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                      {listing.features.slice(0, 3).map((f) => (
                        <span key={f} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
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
