'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Star,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Search,
  Car,
  Wrench,
  Clock,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';

interface ProviderListing {
  id: string;
  name: string;
  serviceTitle: string;
  rating: number;
  reviewCount: number;
  address: string;
  city: string;
  pricing: string;
  phone: string;
  whatsapp: string;
  facebookUrl: string;
  highlights: string[];
  mobileAvailable: boolean;
}

export default function DynamicServicesPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const slugParts = Array.isArray(params?.slug) ? params.slug : [params?.slug || 'car-wash'];
  const serviceSlug = (slugParts[0] || 'car-wash').toLowerCase();
  const locationSlug = (slugParts[1] || 'all-zimbabwe').toLowerCase();

  const formatTitle = (slug: string) => {
    return slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const serviceName = formatTitle(serviceSlug);
  const locationName = formatTitle(locationSlug);

  const [providers, setProviders] = useState<ProviderListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveListings = async () => {
      try {
        setLoading(true);
        let categoryParam = 'CAR_WASH';
        if (serviceSlug.includes('mechanic') || serviceSlug.includes('repair')) categoryParam = 'MECHANIC';
        if (serviceSlug.includes('tow') || serviceSlug.includes('breakdown')) categoryParam = 'EMERGENCY_ROADSIDE';
        if (serviceSlug.includes('spare')) categoryParam = 'DRIVER';

        const res = await apiClient.get('/listings', {
          params: { category: categoryParam, city: locationName, limit: '10' },
        });

        if (res.data?.data?.listings && res.data.data.listings.length > 0) {
          const live = res.data.data.listings.map((l: any, i: number) => ({
            id: l.id || `live-${i}`,
            name: l.title || l.company?.name || `${locationName} ${serviceName}`,
            serviceTitle: l.category ? l.category.replace('_', ' ') : serviceName,
            rating: l.rating || 4.9,
            reviewCount: l.totalReviews || 12,
            address: l.address || `${l.city || locationName}, Zimbabwe`,
            city: l.city || locationName,
            pricing: l.pricePerDay ? `From $${l.pricePerDay}` : 'Competitive Rates',
            phone: l.company?.phone || '+263 77 245 9812',
            whatsapp: (l.company?.phone || '263772459812').replace(/[^0-9]/g, ''),
            facebookUrl: `https://facebook.com/${serviceSlug}-${locationSlug}`,
            highlights:
              l.features && l.features.length > 0
                ? l.features
                : [
                    'Vetted & verified by KUNAKA TECH / Famba Quality Assurance',
                    'Quick response and professional equipment',
                  ],
            mobileAvailable: true,
          }));
          setProviders(live);
          return;
        }
      } catch (e) {
        console.warn('Live listings fetch error, falling back to curated providers:', e);
      } finally {
        setLoading(false);
      }

      // Default curated providers if no active database listings in this specific town yet
      setProviders([
        {
          id: 'prov-1',
          name: `${locationName} Premier ${serviceName} Hub`,
          serviceTitle: `Verified Express & Mobile ${serviceName}`,
          rating: 4.9,
          reviewCount: 118,
          address: `Township Road & Main St, ${locationName}`,
          city: locationName,
          pricing: serviceSlug.includes('wash')
            ? 'Full Wash from $5 • Engine Steam $15'
            : 'Diagnostics from $15 • Repairs from $35',
          phone: '+263 77 245 9812',
          whatsapp: '263772459812',
          facebookUrl: `https://facebook.com/${serviceSlug}-${locationSlug}`,
          highlights: [
            'Vetted & verified by KUNAKA TECH / Famba Quality Assurance',
            'Mobile field team arrives with water supply & portable generator',
            'Eco-friendly biodegradable cleaning solutions and spot-free rinse',
          ],
          mobileAvailable: true,
        },
        {
          id: 'prov-2',
          name: `Apex Auto Care & Valet Center`,
          serviceTitle: `Commercial & Private ${serviceName}`,
          rating: 4.8,
          reviewCount: 76,
          address: `Central Commercial Hub, ${locationName}`,
          city: locationName,
          pricing: serviceSlug.includes('wash') ? 'Executive Valet & Wax from $8' : 'Complete Overhaul & Spares',
          phone: '+263 71 833 4421',
          whatsapp: '263718334421',
          facebookUrl: `https://facebook.com/apex-autocare-${locationSlug}`,
          highlights: [
            'High-pressure underbody dirt & mud blaster for gravel roads',
            'Interior upholstery deep extraction & stain removal',
            'Fast turnaround with dedicated waiting bay',
          ],
          mobileAvailable: false,
        },
      ]);
    };

    fetchLiveListings();
  }, [serviceSlug, locationSlug, locationName, serviceName]);

  const currentPath = `/services/${slugParts.join('/')}`;
  const loginRedirectUrl = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;

  return (
    <div className="min-h-screen bg-[#FAFCFB] flex flex-col selection:bg-[#008767]/20">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Breadcrumb / Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to All Services
          </Link>

          <Link
            href={`/search?category=CAR_WASH&q=${encodeURIComponent(locationName)}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008767] hover:underline"
          >
            <Search className="w-3.5 h-3.5" /> Search Marketplace
          </Link>
        </div>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] text-white rounded-3xl p-8 sm:p-10 mb-10 relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-[#008767]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Famba Verified Partner Network
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
              {serviceName} in {locationName}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Find top-rated, background-checked {serviceName.toLowerCase()} providers, workshops, and mobile teams in {locationName} and surrounding districts.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time Availability
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mobile Callout Units
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> EcoCash & Cash Accepted
              </span>
            </div>
          </div>
        </div>

        {/* Auth Banner if Guest */}
        {!isAuthenticated && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-base">Direct Contact Details Protected</h3>
                <p className="text-amber-700 text-sm mt-0.5">
                  To protect our service partners from spam, direct WhatsApp buttons, phone numbers, and social links are reserved for logged-in members.
                </p>
              </div>
            </div>

            <Link
              href={loginRedirectUrl}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#008767] hover:bg-[#006e53] text-white font-bold text-sm rounded-xl transition-colors shadow-sm text-center shrink-0"
            >
              Log In to Reveal Contacts
            </Link>
          </div>
        )}

        {/* Logged in success badge */}
        {isAuthenticated && (
          <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Unlock className="w-4 h-4" />
              </div>
              <p className="text-emerald-900 text-sm font-semibold">
                Welcome back, {user?.firstName || 'Member'}! You have unlocked direct dispatch and phone contact access.
              </p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Member Access
            </span>
          </div>
        )}

        {/* Provider Cards List */}
        <div className="space-y-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] text-[#008767]">
                      {provider.serviceTitle}
                    </span>
                    {provider.mobileAvailable && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                        🚐 Mobile Unit Available
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {provider.rating} ({provider.reviewCount} reviews)
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-[#0B192C]">{provider.name}</h2>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="w-4 h-4 text-[#008767] shrink-0" />
                    <span>{provider.address}</span>
                  </div>

                  <div className="text-sm font-bold text-[#0B192C] bg-slate-50 inline-block px-3 py-1.5 rounded-xl border border-slate-100">
                    💰 {provider.pricing}
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-600 pt-2">
                    {provider.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#008767] shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact CTA Section */}
                <div className="w-full lg:w-72 bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4 shrink-0">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
                      Direct Dispatch Status
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ready for Booking
                    </span>
                  </div>

                  {isAuthenticated ? (
                    <div className="space-y-2.5">
                      <a
                        href={`https://wa.me/${provider.whatsapp}?text=Hi%2C%20I%20found%20your%20listing%20on%20Famba%20for%20${encodeURIComponent(serviceName)}%20in%20${encodeURIComponent(locationName)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" /> WhatsApp Dispatch
                      </a>

                      <a
                        href={`tel:${provider.phone}`}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                      >
                        <Phone className="w-4 h-4" /> Call {provider.phone}
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                        <span className="font-mono text-xs font-bold text-slate-400 blur-sm select-none">
                          +263 77 ••• ••••
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Contacts locked for guests</p>
                      </div>

                      <Link
                        href={loginRedirectUrl}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#008767] hover:bg-[#006e53] text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                      >
                        <Lock className="w-4 h-4" /> Unlock Contacts
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Helpful navigation footer */}
        <div className="mt-12 bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <p>
            Are you a service provider in <strong>{locationName}</strong>? List your business on Famba for free.
          </p>
          <Link
            href="/company/register"
            className="font-bold text-[#008767] hover:underline inline-flex items-center gap-1 shrink-0"
          >
            Register as a Provider <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

