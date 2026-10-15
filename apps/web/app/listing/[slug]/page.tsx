'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Star, MapPin, Heart, Share2, Car, Clock, CheckCircle, Phone,
  ChevronLeft, ChevronRight, Shield, Zap, Users, MessageCircle,
  ShieldCheck, Sparkles, AlertCircle, Banknote
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatCurrency, getCategoryLabel } from '@/lib/utils';
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
    queryFn: () => apiClient.get(`/listings/${slug}`).then((r) => r.data.data),
    enabled: !!slug,
  });

  const images =
    listing?.images?.length > 0
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
        paymentMethod: 'CASH',
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
      <div className="min-h-screen bg-[#FAFCFB] flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#008767] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading verified listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] flex items-center justify-center text-[#008767] mb-4">
            <Car className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Listing not found</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            This listing may have been rented, updated, or the link is incorrect.
          </p>
          <Link
            href="/search"
            className="px-6 py-3 rounded-xl bg-[#008767] text-white font-bold text-sm hover:bg-[#007358] transition"
          >
            Browse all services
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const days =
    startDate && endDate
      ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
      : 1;
  const pricePerDay = listing.pricePerDay || listing.price || 0;
  const totalPrice = pricePerDay * days;
  const providerPhone = listing.company?.whatsappNumber || listing.company?.phone || '263772123456';
  const sanitizedPhone = providerPhone.replace(/[^0-9]/g, '');
  const whatsappMsg = encodeURIComponent(
    `Hello! I'm interested in booking "${listing.title}" on Famba Zimbabwe (Ref: ${listing.slug || listing.id}). Is it available?`
  );

  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
      <Navbar />

      <div className="pt-24 pb-20">
        {/* Breadcrumb */}
        <div className="section-container py-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/search" className="hover:text-[#008767] transition-colors flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" /> Back to Services
            </Link>
            <span>/</span>
            <span className="text-[#008767]">{getCategoryLabel(listing.category)}</span>
            <span>/</span>
            <span className="text-slate-800 line-clamp-1">{listing.title}</span>
          </div>
        </div>

        <div className="section-container">
          <div className="grid lg:grid-cols-[1fr,380px] gap-10">

            {/* LEFT COLUMN: Media & Details */}
            <div>
              {/* Image Gallery */}
              <div className="relative rounded-3xl overflow-hidden mb-6 bg-slate-100 shadow-md border border-slate-200" style={{ height: 460 }}>
                <img
                  src={images[activeImg]?.url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-slate-800 shadow-md backdrop-blur-sm transition-all hover:scale-110"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setActiveImg((i) => Math.min(images.length - 1, i + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-slate-800 shadow-md backdrop-blur-sm transition-all hover:scale-110"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-800 shadow-md">
                  {activeImg + 1} / {images.length}
                </div>

                {/* Verified badge */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[#008767] text-xs font-bold shadow-md">
                  <ShieldCheck className="w-4 h-4 text-[#008767]" />
                  <span>Verified & Insured Vehicle</span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2.5 mb-8 overflow-x-auto no-scrollbar pb-1">
                  {images.map((img: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all border-2 ${
                        activeImg === i ? 'border-[#008767] shadow-sm' : 'border-slate-200 opacity-60'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Title + Meta Header */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] text-[#008767] border border-[#B2E3D8]">
                    {getCategoryLabel(listing.category)}
                  </span>
                  {listing.transmission && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      {listing.transmission}
                    </span>
                  )}
                  {listing.fuelType && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                      {listing.fuelType}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B192C]">
                  {listing.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="font-bold text-[#0B192C]">{listing.rating?.toFixed ? listing.rating.toFixed(1) : '4.9'}</span>
                    <span className="text-slate-400">({listing.totalReviews || 24} verified reviews)</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[#008767]" />
                    <span>{listing.city || 'Harare'}, Zimbabwe</span>
                  </div>

                  {listing.seatingCapacity && (
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-[#008767]" />
                      <span>{listing.seatingCapacity} Passengers</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
                <h2 className="font-display text-xl font-bold text-[#0B192C] mb-3">About this service</h2>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  {listing.description || 'Verified automotive and transportation listing on Famba Zimbabwe.'}
                </p>
              </div>

              {/* Features / What's Included */}
              {listing.features?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
                  <h2 className="font-display text-xl font-bold text-[#0B192C] mb-4">What's included</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listing.features.map((f: string) => (
                      <div
                        key={f}
                        className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                      >
                        <CheckCircle className="h-4 w-4 shrink-0 text-[#008767]" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Provider Info Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="font-display text-xl font-bold text-[#0B192C] mb-4">Verified Provider</h2>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#E6F4F1] border border-[#B2E3D8] flex items-center justify-center font-display font-extrabold text-xl text-[#008767] shrink-0 overflow-hidden">
                      {listing.company?.logo ? (
                        <img src={listing.company.logo} alt={listing.company.name} className="w-full h-full object-cover" />
                      ) : (
                        listing.company?.name?.[0] || 'F'
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#0B192C]">{listing.company?.name || 'Harare Executive Motors'}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          {listing.company?.rating?.toFixed ? listing.company.rating.toFixed(1) : '4.9'}
                        </span>
                        <span>•</span>
                        <span>{listing.company?.city || 'Harare'}, Zimbabwe</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${sanitizedPhone}?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-[#B2E3D8] text-[#008767] font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Booking Widget */}
            <div className="lg:sticky lg:top-28 self-start">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-5"
              >
                {/* Price Display */}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rate</span>
                  <p className="font-display text-3xl font-extrabold text-[#008767] mt-1">
                    ${pricePerDay} USD <span className="text-sm font-semibold text-slate-500">/{listing.priceUnit || 'day'}</span>
                  </p>
                  {listing.pricePerHour && (
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      or ${listing.pricePerHour} USD / hour
                    </p>
                  )}
                </div>

                {bookingSuccess ? (
                  <div className="text-center py-6 bg-[#E6F4F1] rounded-2xl border border-[#B2E3D8] p-5">
                    <div className="w-12 h-12 rounded-full bg-[#008767] text-white flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <p className="font-display text-lg font-bold text-[#0B192C] mb-1">Booking Confirmed!</p>
                    <p className="text-xs text-slate-600 mb-4">
                      The provider has received your reservation. Check your dashboard bookings.
                    </p>
                    <Link
                      href="/dashboard/bookings"
                      className="inline-block w-full py-2.5 rounded-xl bg-[#008767] text-white font-bold text-xs hover:bg-[#007358] transition"
                    >
                      View My Bookings
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Date Pickers */}
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                        />
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    {startDate && endDate && (
                      <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex justify-between text-slate-600">
                          <span>${pricePerDay} × {days} day{days !== 1 ? 's' : ''}</span>
                          <span className="font-bold text-[#0B192C]">${pricePerDay * days} USD</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Platform Service Fee</span>
                          <span className="font-bold text-[#0B192C]">${Math.round(totalPrice * 0.05)} USD</span>
                        </div>
                        <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-200 text-[#008767]">
                          <span>Total</span>
                          <span>${Math.round(totalPrice * 1.05)} USD</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={handleBook}
                        disabled={bookingLoading || !startDate || !endDate}
                        className="w-full py-3.5 rounded-xl bg-[#008767] hover:bg-[#007358] disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition"
                      >
                        {bookingLoading ? 'Processing Booking...' : 'Request to Book'}
                      </button>

                      <a
                        href={`https://wa.me/${sanitizedPhone}?text=${whatsappMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-[#B2E3D8] text-[#008767] font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Instant WhatsApp Inquiry</span>
                      </a>
                    </div>

                    {/* Local Payment Methods Info */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-[11px] text-slate-600">
                      <Banknote className="w-4 h-4 text-[#008767] shrink-0 mt-0.5" />
                      <span>
                        Accepted payment methods in Zimbabwe: <strong>USD Cash on Handover</strong>, <strong>EcoCash</strong>, <strong>Zipit</strong>, or Online Card.
                      </span>
                    </div>
                  </>
                )}

                {/* Trust Badges */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-[#008767] shrink-0" />
                    <span>Protected by Famba Zimbabwe Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="h-4 w-4 text-[#008767] shrink-0" />
                    <span>Free cancellation up to 24h before pickup</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="h-4 w-4 text-[#008767] shrink-0" />
                    <span>24/7 Roadside and Customer Support</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
