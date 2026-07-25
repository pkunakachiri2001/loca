'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Search, SlidersHorizontal, MapPin, Star, Heart, Car,
  ChevronDown, X, Loader2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

const categories = [
  { value: '', label: 'All Services' },
  { value: 'CAR_RENTAL', label: 'Car Rentals' },
  { value: 'BUS_RENTAL', label: 'Bus Rentals' },
  { value: 'DRIVER', label: 'Professional Drivers' },
  { value: 'MECHANIC', label: 'Mechanics' },
  { value: 'CAR_WASH', label: 'Car Wash' },
  { value: 'VEHICLE_DEALER', label: 'Vehicle Dealers' },
  { value: 'COURIER', label: 'Courier Vehicles' },
  { value: 'EMERGENCY_ROADSIDE', label: 'Emergency Roadside' },
];

const sortOptions = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'rating',
    page: 1,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      city: searchParams.get('city') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sortBy: searchParams.get('sortBy') || 'rating',
    }));
  }, [searchParams]);

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    if (newFilters.q) params.set('q', newFilters.q);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    router.push(`/search?${params.toString()}`);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.category) params.append('category', filters.category);
      if (filters.city) params.append('city', filters.city);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      params.append('sortBy', filters.sortBy);
      params.append('page', String(filters.page));
      params.append('limit', '12');

      const res = await apiClient.get(`/listings?${params.toString()}`);
      return res.data;
    },
  });

  const listings = data?.data || [];
  const pagination = data?.pagination || { total: 0, pages: 1, page: 1 };

  return (
    <div className="min-h-screen" style={{ background: '#0E0E10' }}>
      <Navbar />

      {/* Header */}
      <div className="pt-28 pb-8" style={{ borderBottom: '1px solid #1E1E22' }}>
        <div className="section-container">
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#F5F0E8' }}>
            Find Your Transport Solution
          </h1>
          <p className="text-sm" style={{ color: '#6B6B72' }}>
            Browse verified rentals, drivers, mechanics & car washes across Zimbabwe (USD)
          </p>

          {/* Top Search Bar */}
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by vehicle, service name..."
                value={filters.q}
                onChange={(e) => {
                  const next = { ...filters, q: e.target.value };
                  setFilters(next);
                  updateURL(next);
                }}
                className="input-dark pl-10"
              />
            </div>
            <div className="relative md:w-48">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="City / State"
                value={filters.city}
                onChange={(e) => {
                  const next = { ...filters, city: e.target.value };
                  setFilters(next);
                  updateURL(next);
                }}
                className="input-dark pl-10"
              />
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="btn-secondary md:hidden flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="section-container py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden md:block w-64 shrink-0 space-y-6">
            <div className="card p-5 space-y-6">
              <div>
                <h3 className="font-display text-sm font-semibold mb-3 text-white">Categories</h3>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        const next = { ...filters, category: cat.value };
                        setFilters(next);
                        updateURL(next);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                        filters.category === cat.value
                          ? 'bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-sm font-semibold mb-3 text-white">Sort By</h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) => {
                    const next = { ...filters, sortBy: e.target.value };
                    setFilters(next);
                    updateURL(next);
                  }}
                  className="input-dark text-sm w-full cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear filters */}
              {(filters.q || filters.category || filters.city) && (
                <button
                  onClick={() => {
                    const reset = { q: '', category: '', city: '', minPrice: '', maxPrice: '', sortBy: 'rating', page: 1 };
                    setFilters(reset);
                    updateURL(reset);
                  }}
                  className="w-full text-xs text-amber-400 hover:underline pt-2 text-center block"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-400">
                {isLoading ? (
                  'Searching...'
                ) : (
                  <>Showing <span className="text-white font-semibold">{listings.length}</span> results</>
                )}
              </p>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card p-4 animate-pulse space-y-4">
                    <div className="h-48 rounded-xl bg-white/5" />
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/5 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="card p-12 text-center space-y-4">
                <Car className="h-12 w-12 text-slate-500 mx-auto" />
                <h3 className="text-lg font-semibold text-white">No listings found</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search query, location or filter options.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item: any) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-hover overflow-hidden rounded-2xl border border-white/10 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-neutral-900">
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-amber-300 border border-amber-500/20">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-semibold text-white line-clamp-1">{item.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold shrink-0">
                            <Star className="h-3.5 w-3.5 fill-amber-400" />
                            <span>{item.rating || '4.9'}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span>{item.city}, {item.state}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-white/5 mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">Starting from</span>
                        <p className="text-base font-bold text-amber-400">
                          {formatCurrency(item.price)} <span className="text-xs font-normal text-slate-400">/{item.priceUnit || 'day'}</span>
                        </p>
                      </div>
                      <Link
                        href={`/listing/${item.slug || item.id}`}
                        className="btn-primary py-2 px-4 text-xs"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#0E0E10' }}>
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
