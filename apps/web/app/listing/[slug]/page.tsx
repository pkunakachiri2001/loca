'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Star, MapPin, Heart, Share2, Car, Clock, CheckCircle, Phone, ChevronLeft, ChevronRight, Shield, Zap, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatCurrency, getCategoryLabel, getStatusColor } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

export default function ListingDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [activeImg, setActiveImg] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', slug],
    queryFn: () => apiClient.get(`/listings/${slug}`).then(r => r.data.data),
    enabled: !!slug,
  });

  const images = listing?.images?.length > 0
    ? listing.images
    : [{ url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&h=700&fit=crop' }];

  const handleBook = async () => {
    if (!isAuthenticated) {
      window.location.href = `/auth/login?redirect=/listing/${slug}`;
      return;
    }
    if (!startDate || !endDate) return;
    setBookingLoading(true);
    try {
      await apiClient.post('/bookings', {
        listingId: listing.id,
        startDate,
        endDate,
        paymentMethod: 'CARD',
      });
      setBookingSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setBookingLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0E0E10' }}>
        <Navbar />
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#E8A547', borderTopColor: 'transparent' }} />
          <p style={{ color: '#6B6B72' }}>Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen" style={{ background: '#0E0E10' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
          <Car className="h-16 w-16 mb-4" style={{ color: '#2E2E34' }} />
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#F5F0E8' }}>Listing not found</h2>
          <p style={{ color: '#6B6B72' }} className="mb-6">This listing may have been removed or the link is incorrect.</p>
          <Link href="/search" className="btn-primary">Browse all listings</Link>
        </div>
      </div>
    );
  }

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
    : 1;
  const totalPrice = listing.pricePerDay * days;

  return (
    <div className="min-h-screen" style={{ background: '#0E0E10' }}>
      <Navbar />

      <div className="pt-16">
        {/* Breadcrumb */}
        <div className="section-container py-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: '#6B6B72' }}>
            <Link href="/search" className="hover:text-white transition-colors flex items-center gap-1">
              <ChevronLeft className="h-3 w-3" /> Back to results
            </Link>
            <span>/</span>
            <span style={{ color: '#F5F0E8' }}>{listing.title}</span>
          </div>
        </div>

        <div className="section-container pb-24">
          <div className="grid lg:grid-cols-[1fr,380px] gap-10">

            {/* LEFT COLUMN */}
            <div>
              {/* Image Gallery */}
              <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: 460, background: '#1A1A1C' }}>
                <img
                  src={images[activeImg]?.url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(to top, rgba(14,14,16,0.6) 0%, transparent 50%)'
                }} />

                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg(i => Math.max(0, i - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
                      style={{ background: 'rgba(14,14,16,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </button>
                    <button
                      onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
                      style={{ background: 'rgba(14,14,16,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <ChevronRight className="h-5 w-5 text-white" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(14,14,16,0.8)', color: '#F5F0E8', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {activeImg + 1} / {images.length}
                </div>

                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
                    style={{ background: 'rgba(14,14,16,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Heart className="h-4 w-4 text-white" />
                  </button>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
                    style={{ background: 'rgba(14,14,16,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Share2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
                  {images.map((img: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className="shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all"
                      style={{
                        border: activeImg === i ? '2px solid #E8A547' : '2px solid #2E2E34',
                        opacity: activeImg === i ? 1 : 0.6,
                      }}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title + Meta */}
              <div className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="badge-info text-xs mb-3 inline-block">{getCategoryLabel(listing.category)}</span>
                    <h1 className="font-display text-3xl font-bold" style={{ color: '#F5F0E8' }}>{listing.title}</h1>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold" style={{ color: '#F5F0E8' }}>{listing.rating?.toFixed(1) || '—'}</span>
                    <span style={{ color: '#6B6B72' }}>({listing.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ color: '#6B6B72' }}>
                    <MapPin className="h-4 w-4" />
                    <span>{listing.city}</span>
                  </div>
                  {listing.availableCount !== undefined && (
                    <div className="flex items-center gap-1.5" style={{ color: '#6B6B72' }}>
                      <Car className="h-4 w-4" />
                      <span>{listing.availableCount} available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="font-display text-xl font-semibold mb-3" style={{ color: '#F5F0E8' }}>About this listing</h2>
                <p className="leading-relaxed" style={{ color: '#9A9A9E' }}>{listing.description || 'No description provided.'}</p>
              </div>

              {/* Features */}
              {listing.features?.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-display text-xl font-semibold mb-4" style={{ color: '#F5F0E8' }}>What's included</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listing.features.map((f: string) => (
                      <div key={f} className="flex items-center gap-2 py-2 px-3 rounded-lg"
                        style={{ background: '#1A1A1C', border: '1px solid #2E2E34' }}>
                        <CheckCircle className="h-4 w-4 shrink-0" style={{ color: '#34D399' }} />
                        <span className="text-sm" style={{ color: '#9A9A9E' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Provider Info */}
              <div className="card p-6">
                <h2 className="font-display text-xl font-semibold mb-4" style={{ color: '#F5F0E8' }}>The provider</h2>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: '#242428' }}>
                    {listing.company?.logo ? (
                      <img src={listing.company.logo} alt={listing.company.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display font-bold text-xl" style={{ color: '#E8A547' }}>
                        {listing.company?.name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg" style={{ color: '#F5F0E8' }}>{listing.company?.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm" style={{ color: '#F5F0E8' }}>{listing.company?.rating?.toFixed(1)}</span>
                      <span className="text-sm" style={{ color: '#6B6B72' }}>· {listing.company?.totalReviews} reviews</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6B6B72' }}>
                        <Shield className="h-3.5 w-3.5" /> Verified provider
                      </div>
                      <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6B6B72' }}>
                        <Zap className="h-3.5 w-3.5" /> Usually responds in 2h
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Booking Widget */}
            <div className="lg:sticky lg:top-24 self-start">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                {/* Price */}
                <div className="mb-5">
                  <p className="font-display text-3xl font-bold" style={{ color: '#F5F0E8' }}>
                    {formatCurrency(listing.pricePerDay)}
                    <span className="text-base font-normal ml-1" style={{ color: '#6B6B72' }}>/ day</span>
                  </p>
                  {listing.pricePerHour && (
                    <p className="text-sm mt-1" style={{ color: '#6B6B72' }}>
                      or {formatCurrency(listing.pricePerHour)}/hour
                    </p>
                  )}
                </div>

                {bookingSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
                      <CheckCircle className="h-7 w-7" style={{ color: '#34D399' }} />
                    </div>
                    <p className="font-display text-xl font-bold mb-2" style={{ color: '#F5F0E8' }}>Booking confirmed!</p>
                    <p className="text-sm mb-5" style={{ color: '#6B6B72' }}>You'll receive a confirmation email shortly.</p>
                    <Link href="/dashboard/bookings" className="btn-primary w-full">View my bookings</Link>
                  </div>
                ) : (
                  <>
                    {/* Date pickers */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Start date</label>
                        <input
                          type="date"
                          value={startDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => setStartDate(e.target.value)}
                          className="input-dark w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>End date</label>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate || new Date().toISOString().split('T')[0]}
                          onChange={e => setEndDate(e.target.value)}
                          className="input-dark w-full"
                        />
                      </div>
                    </div>

                    {/* Price breakdown */}
                    {startDate && endDate && (
                      <div className="rounded-xl p-4 mb-4" style={{ background: '#242428', border: '1px solid #2E2E34' }}>
                        <div className="flex justify-between text-sm mb-2">
                          <span style={{ color: '#9A9A9E' }}>{formatCurrency(listing.pricePerDay)} × {days} day{days !== 1 ? 's' : ''}</span>
                          <span style={{ color: '#F5F0E8' }}>{formatCurrency(listing.pricePerDay * days)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span style={{ color: '#9A9A9E' }}>Service fee</span>
                          <span style={{ color: '#F5F0E8' }}>{formatCurrency(totalPrice * 0.05)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold pt-2" style={{ borderTop: '1px solid #2E2E34' }}>
                          <span style={{ color: '#F5F0E8' }}>Total</span>
                          <span style={{ color: '#E8A547' }}>{formatCurrency(totalPrice * 1.05)}</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleBook}
                      disabled={bookingLoading || !startDate || !endDate}
                      className="btn-primary w-full py-3.5 text-base"
                      style={{ opacity: (!startDate || !endDate) ? 0.5 : 1 }}
                    >
                      {bookingLoading ? (
                        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin border-current" />
                      ) : (
                        'Request to Book'
                      )}
                    </button>

                    <p className="text-xs text-center mt-3" style={{ color: '#5A5A60' }}>
                      You won't be charged yet. Provider confirms within 2 hours.
                    </p>
                  </>
                )}
              </motion.div>

              {/* Reassurance */}
              <div className="mt-4 space-y-3 px-2">
                {[
                  { icon: Shield, text: 'Protected by FleetNest guarantee' },
                  { icon: Clock, text: 'Free cancellation up to 24h before' },
                  { icon: Phone, text: '24/7 customer support available' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm" style={{ color: '#6B6B72' }}>
                    <Icon className="h-4 w-4 shrink-0" style={{ color: '#E8A547' }} />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
