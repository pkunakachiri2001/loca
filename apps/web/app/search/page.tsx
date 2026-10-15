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
  ChevronDown, X, Loader2, ArrowRight, ShieldCheck, Sparkles,
  Phone, MessageCircle, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, getCategoryLabel, cn } from '@/lib/utils';

const categories = [
  { value: '', label: 'All Services' },
  { value: 'CAR_RENTAL', label: 'Car Rentals' },
  { value: 'BUS_RENTAL', label: 'Bus Rentals' },
  { value: 'DRIVER', label: 'Spare Parts' },
  { value: 'MECHANIC', label: 'Workshops' },
  { value: 'CAR_WASH', label: 'Car Wash & Detailing' },
  { value: 'SCHOOL_RUN', label: 'School Run' },
  { value: 'VEHICLE_DEALER', label: 'Vehicle Dealers' },
  { value: 'COURIER', label: 'Courier & Deliveries' },
  { value: 'EMERGENCY_ROADSIDE', label: 'Emergency Roadside' },
];

const zimbabweCities = [
  'All Zimbabwe',
  'Harare',
  'Bulawayo',
  'Victoria Falls',
  'Mutare',
  'Gweru',
  'Masvingo',
  'Chinhoyi',
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
    transmission: searchParams.get('transmission') || '',
    sortBy: searchParams.get('sortBy') || 'rating',
    page: parseInt(searchParams.get('page') || '1', 10),
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
      transmission: searchParams.get('transmission') || '',
      sortBy: searchParams.get('sortBy') || 'rating',
      page: parseInt(searchParams.get('page') || '1', 10),
    }));
  }, [searchParams]);

  const updateURL = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    if (newFilters.q) params.set('q', newFilters.q);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.city && newFilters.city !== 'All Zimbabwe') params.set('city', newFilters.city);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.transmission) params.set('transmission', newFilters.transmission);
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.page > 1) params.set('page', String(newFilters.page));
    router.push(`/search?${params.toString()}`);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.category) params.append('category', filters.category);
      if (filters.city && filters.city !== 'All Zimbabwe') params.append('city', filters.city);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.transmission) params.append('transmission', filters.transmission);
      params.append('sortBy', filters.sortBy);
      params.append('page', String(filters.page));
      params.append('limit', '12');

      const res = await apiClient.get(`/listings?${params.toString()}`);
      return res.data;
    },
  });

  const listings = data?.data || [];
  const pagination = data?.pagination || { total: listings.length, pages: 1, page: filters.page };

  const handleCitySelect = (cityName: string) => {
    const selected = cityName === 'All Zimbabwe' ? '' : cityName;
    const next = { ...filters, city: selected, page: 1 };
    setFilters(next);
    updateURL(next);
  };

  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
      <Navbar />

      {/* Header Banner */}
      <div className="pt-28 pb-8 bg-white border-b border-slate-200">
        <div className="section-container">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zimbabwe Mobility & Automotive Marketplace</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B192C] mb-2">
            Find Verified Transport & Vehicle Services
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            Rent vehicles, charter buses, find genuine spare parts, and book certified auto workshops across Zimbabwe (All prices in USD).
          </p>

          {/* Search Inputs */}
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#008767]" />
              <input
                type="text"
                placeholder="Search by vehicle, model, service name (e.g. Hilux, Fortuner, Fit, Engine Overhaul)..."
                value={filters.q}
                onChange={(e) => {
                  const next = { ...filters, q: e.target.value, page: 1 };
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

          {/* Quick Zimbabwe City Chips */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
              <MapPin className="w-3.5 h-3.5 text-[#008767]" /> Hubs:
            </span>
            {zimbabweCities.map((cityName) => {
              const isActive = (cityName === 'All Zimbabwe' && !filters.city) || filters.city === cityName;
              return (
                <button
                  key={cityName}
                  onClick={() => handleCitySelect(cityName)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all',
                    isActive
                      ? 'bg-[#008767] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#008767]'
                  )}
                >
                  {cityName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="section-container py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <div className={`md:block w-full md:w-64 shrink-0 space-y-6 ${drawerOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-6">
              
              {/* Category Filter */}
              <div>
                <h3 className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Service Categories
                </h3>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        const next = { ...filters, category: cat.value, page: 1 };
                        setFilters(next);
                        updateURL(next);
                      }}
                      className={cn(
                        'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between',
                        filters.category === cat.value
                          ? 'bg-[#E6F4F1] text-[#008767] border border-[#B2E3D8] shadow-sm'
                          : 'text-slate-600 hover:text-[#008767] hover:bg-slate-50'
                      )}
                    >
                      <span>{cat.label}</span>
                      {filters.category === cat.value && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#008767]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Budget (USD / day)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">MIN ($)</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) => {
                        const next = { ...filters, minPrice: e.target.value, page: 1 };
                        setFilters(next);
                        updateURL(next);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">MAX ($)</span>
                    <input
                      type="number"
                      placeholder="500"
                      value={filters.maxPrice}
                      onChange={(e) => {
                        const next = { ...filters, maxPrice: e.target.value, page: 1 };
                        setFilters(next);
                        updateURL(next);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                    />
                  </div>
                </div>
              </div>

              {/* Transmission Filter */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Transmission
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {['AUTOMATIC', 'MANUAL'].map((tr) => (
                    <button
                      key={tr}
                      onClick={() => {
                        const nextVal = filters.transmission === tr ? '' : tr;
                        const next = { ...filters, transmission: nextVal, page: 1 };
                        setFilters(next);
                        updateURL(next);
                      }}
                      className={cn(
                        'px-3 py-2 rounded-xl text-xs font-bold border transition text-center',
                        filters.transmission === tr
                          ? 'bg-[#E6F4F1] border-[#B2E3D8] text-[#008767]'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {tr === 'AUTOMATIC' ? 'Automatic' : 'Manual'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-display text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Sort By
                </h3>
                <select
                  value={filters.sortBy}
                  onChange={(e) => {
                    const next = { ...filters, sortBy: e.target.value, page: 1 };
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

              {/* Reset Filters */}
              {(filters.q || filters.category || filters.city || filters.minPrice || filters.maxPrice || filters.transmission) && (
                <button
                  onClick={() => {
                    const reset = { q: '', category: '', city: '', minPrice: '', maxPrice: '', transmission: '', sortBy: 'rating', page: 1 };
                    setFilters(reset);
                    updateURL(reset);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
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
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] flex items-center justify-center mx-auto text-[#008767]">
                  <Car className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-[#0B192C]">No listings found</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search query, city hub, or category filter to find available transport services in Zimbabwe.
                </p>
                <button
                  onClick={() => {
                    const reset = { q: '', category: '', city: '', minPrice: '', maxPrice: '', transmission: '', sortBy: 'rating', page: 1 };
                    setFilters(reset);
                    updateURL(reset);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#008767] text-white text-xs font-bold hover:bg-[#007358] transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item: any) => {
                  const imageUrl =
                    (typeof item.images?.[0] === 'string' ? item.images[0] : item.images?.[0]?.url) ||
                    item.primaryImage ||
                    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop';
                  
                  const price = item.pricePerDay || item.price || 0;
                  const priceUnit = item.priceUnit || 'day';
                  const reviewCount = item._count?.reviews || item.totalReviews || 18;
                  const whatsappMsg = encodeURIComponent(
                    `Hello! I saw your listing "${item.title}" on Famba Zimbabwe and would like to inquire about booking/availability.`
                  );
                  const providerPhone = item.company?.whatsappNumber || item.company?.phone || '263772123456';
                  const sanitizedPhone = providerPhone.replace(/[^0-9]/g, '');

                  return (
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
                            src={imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-[#008767] border border-slate-200 shadow-sm">
                            {getCategoryLabel(item.category)}
                          </span>

                          <span className="absolute top-3 right-3 bg-[#0B192C]/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Verified</span>
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display font-bold text-base text-[#0B192C] line-clamp-1 group-hover:text-[#008767] transition-colors">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-amber-600 font-bold shrink-0 pt-0.5">
                              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              <span>{item.rating?.toFixed ? item.rating.toFixed(1) : (item.rating || '4.8')}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({reviewCount})</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {item.description || 'Verified automotive listing in Zimbabwe.'}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
                            <MapPin className="h-3.5 w-3.5 text-[#008767]" />
                            <span>{item.city || 'Harare'}, Zimbabwe</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer / CTAs */}
                      <div className="p-5 pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] text-slate-400 font-semibold uppercase">Daily Rate</span>
                          <p className="text-base font-extrabold text-[#008767]">
                            ${price} USD <span className="text-xs font-normal text-slate-500">/{priceUnit}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <a
                            href={`https://wa.me/${sanitizedPhone}?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#008767] border border-[#B2E3D8] font-bold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <Link
                            href={`/listing/${item.slug || item.id}`}
                            className="px-3 py-2 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-xs text-center shadow-sm transition"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  disabled={filters.page <= 1}
                  onClick={() => {
                    const next = { ...filters, page: filters.page - 1 };
                    setFilters(next);
                    updateURL(next);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <span className="text-xs font-bold text-slate-600 px-3">
                  Page {filters.page} of {pagination.pages}
                </span>

                <button
                  disabled={filters.page >= pagination.pages}
                  onClick={() => {
                    const next = { ...filters, page: filters.page + 1 };
                    setFilters(next);
                    updateURL(next);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
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
