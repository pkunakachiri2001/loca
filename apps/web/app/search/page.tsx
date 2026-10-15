'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Search, SlidersHorizontal, MapPin, Star, Heart, Car,
  ChevronDown, X, Loader2, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

const categories = [
  { value: '', label: 'All Services' },
  { value: 'CAR_RENTAL', label: 'Car Rentals' },
  { value: 'BUS_RENTAL', label: 'Bus Rentals' },
  { value: 'DRIVER', label: 'Spare Parts' },
  { value: 'MECHANIC', label: 'Workshops' },
  { value: 'CAR_WASH', label: 'Restaurants' },
  { value: 'VEHICLE_DEALER', label: 'Vehicle Dealers' },
  { value: 'COURIER', label: 'Courier & Deliveries' },
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
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
      <Navbar />

      {/* Header */}
      <div className="pt-28 pb-10 bg-white border-b border-slate-200">
        <div className="section-container">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zimbabwe Mobility Marketplace</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B192C] mb-2">
            Find Your Transport & Automotive Service
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Browse verified vehicle rentals, buses, spare parts, and workshops across Zimbabwe (All prices in USD)
          </p>

          {/* Top Search Bar */}
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#008767]" />
              <input
                type="text"
                placeholder="Search by vehicle, model, service name..."
                value={filters.q}
                onChange={(e) => {
                  const next = { ...filters, q: e.target.value };
                  setFilters(next);
                  updateURL(next);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:border-transparent transition-all"
              />
            </div>
            <div className="relative md:w-56">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#008767]" />
              <input
                type="text"
                placeholder="City (e.g. Harare, Bulawayo)"
                value={filters.city}
                onChange={(e) => {
                  const next = { ...filters, city: e.target.value };
                  setFilters(next);
                  updateURL(next);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="md:hidden flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="section-container py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <div className={`md:block w-full md:w-64 shrink-0 space-y-6 ${drawerOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Service Categories
                </h3>
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
                        'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                        filters.category === cat.value
                          ? 'bg-[#E6F4F1] text-[#008767] border border-[#B2E3D8] shadow-sm'
                          : 'text-slate-600 hover:text-[#008767] hover:bg-slate-50'
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Sort By
                </h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) => {
                    const next = { ...filters, sortBy: e.target.value };
                    setFilters(next);
                    updateURL(next);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008767]"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
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
                  className="w-full text-xs font-bold text-[#008767] hover:underline pt-2 text-center block"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-semibold text-slate-600">
                {isLoading ? (
                  'Searching marketplace...'
                ) : (
                  <>Showing <span className="text-[#0B192C] font-extrabold">{listings.length}</span> verified services in Zimbabwe</>
                )}
              </p>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4">
                    <div className="h-48 rounded-xl bg-slate-100" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] flex items-center justify-center mx-auto text-[#008767]">
                  <Car className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-[#0B192C]">No listings found</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
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
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#008767] transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-[#008767] border border-slate-200 shadow-sm">
                          {getCategoryLabel(item.category)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display font-bold text-base text-[#0B192C] line-clamp-1 group-hover:text-[#008767] transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-amber-600 font-bold shrink-0">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            <span>{item.rating || '4.9'}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>

                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
                          <MapPin className="h-3.5 w-3.5 text-[#008767]" />
                          <span>{item.city || 'Harare'}, Zimbabwe</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold uppercase">From</span>
                        <p className="text-base font-extrabold text-[#008767]">
                          ${item.price} USD <span className="text-xs font-normal text-slate-500">/{item.priceUnit || 'day'}</span>
                        </p>
                      </div>
                      <Link
                        href={`/listing/${item.slug || item.id}`}
                        className="px-4 py-2 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-xs shadow-sm transition"
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
      <div className="min-h-screen bg-[#FAFCFB] flex items-center justify-center text-[#008767]">
        <Loader2 className="h-8 w-8 animate-spin text-[#008767]" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
