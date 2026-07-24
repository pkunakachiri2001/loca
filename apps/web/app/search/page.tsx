'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
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
import { formatCurrency, getCategoryLabel, debounce } from '@/lib/utils';
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sortBy: searchParams.get('sortBy') || 'rating',
    sortOrder: 'desc',
    page: 1,
  });

  const [searchInput, setSearchInput] = useState(filters.q);
  const [showFilters, setShowFilters] = useState(false);

  const queryString = new URLSearchParams({
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.city ? { city: filters.city } : {}),
    ...(filters.minPrice ? { minPrice: filters.minPrice } : {}),
    ...(filters.maxPrice ? { maxPrice: filters.maxPrice } : {}),
    ...(filters.minRating ? { minRating: filters.minRating } : {}),
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: filters.page.toString(),
    limit: '12',
  }).toString();

  const { data, isLoading } = useQuery({
    queryKey: ['search', queryString],
    queryFn: () => apiClient.get(`/listings?${queryString}`).then((r) => r.data),
    staleTime: 30000,
  });

  const debouncedSearch = useCallback(
    debounce((value: string) => setFilters((prev) => ({ ...prev, q: value, page: 1 })), 400),
    []
  );

  const listings = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-16">
        {/* Search Header */}
        <div className="border-b border-white/5 bg-navy-900/80 backdrop-blur-xl">
          <div className="section-container py-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => { setSearchInput(e.target.value); debouncedSearch(e.target.value); }}
                  placeholder="Search vehicles, services, or providers..."
                  className="input-dark pl-10 w-full"
                />
              </div>

              {/* City Filter */}
              <div className="relative md:w-48">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value, page: 1 }))}
                  placeholder="City"
                  className="input-dark pl-10 w-full"
                />
              </div>

              {/* Category */}
              <div className="relative md:w-48">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value, page: 1 }))}
                  className="input-dark appearance-none pr-8 w-full"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-navy-900">{cat.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn('btn-secondary text-sm shrink-0', showFilters && 'border-blue-500/60 text-blue-300')}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-wrap gap-4"
              >
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Min Price (₦/day)</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                    placeholder="0"
                    className="input-dark w-32 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Max Price (₦/day)</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                    placeholder="500,000"
                    className="input-dark w-32 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Min Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minRating: e.target.value }))}
                    className="input-dark py-2 text-sm w-28"
                  >
                    <option value="">Any</option>
                    {[4, 4.5, 4.8].map((r) => (
                      <option key={r} value={r} className="bg-navy-900">{r}★+</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                    className="input-dark py-2 text-sm w-40"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-navy-900">{opt.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setFilters({ q: '', category: '', city: '', minPrice: '', maxPrice: '', minRating: '', sortBy: 'rating', sortOrder: 'desc', page: 1 })}
                  className="mt-5 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear all
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="section-container py-8">
          {/* Result count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400 text-sm">
              {isLoading ? 'Searching...' : `${pagination?.total ?? 0} results found`}
              {filters.city && ` in ${filters.city}`}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-10 w-10 text-blue-400 animate-spin mb-4" />
              <p className="text-slate-400">Finding the best options for you...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-24">
              <Car className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No listings found</h3>
              <p className="text-slate-400 mb-6">Try adjusting your search or clearing filters.</p>
              <button onClick={() => setFilters((prev) => ({ ...prev, q: '', category: '', city: '' }))}
                className="btn-primary text-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing: any, i: number) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/listing/${listing.slug || listing.id}`}>
                    <div className="vehicle-card group h-full">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden rounded-t-2xl">
                        <img
                          src={listing.primaryImage || listing.images?.[0]?.url || 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=300&fit=crop'}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="badge-info text-[10px]">{getCategoryLabel(listing.category)}</span>
                        </div>
                        <button
                          onClick={(e) => e.preventDefault()}
                          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white hover:text-red-400 transition-colors"
                        >
                          <Heart className={cn('h-4 w-4', listing.isWishlisted && 'fill-red-500 text-red-500')} />
                        </button>
                        <div className="absolute bottom-3 left-3">
                          <span className="rounded-lg bg-black/60 px-2 py-1 text-xs font-bold text-white">
                            {formatCurrency(listing.pricePerDay)}/day
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-xs text-slate-500 mb-1">{listing.company?.name}</p>
                        <h3 className="font-medium text-white text-sm mb-2 line-clamp-2 leading-snug">{listing.title}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="h-3 w-3" />{listing.city}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-medium text-white">{listing.rating?.toFixed(1)}</span>
                            <span className="text-xs text-slate-500">({listing.totalReviews})</span>
                          </div>
                        </div>
                        {listing.features?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {listing.features.slice(0, 3).map((f: string) => (
                              <span key={f} className="rounded-md bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">{f}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
