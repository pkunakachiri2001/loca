'use client';

import { Suspense } from 'react';
import { TrackingMap } from '@/components/map/TrackingMap';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ZIMBABWE_CITIES, ZIMBABWE_PROVINCES } from '@/lib/zimbabwe-locations';
import { MapPin, ShieldCheck, Zap, Activity, Navigation, Radio, Compass } from 'lucide-react';
import Link from 'next/link';

function TrackingContent() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8A547]/10 border border-[#E8A547]/30 text-[#E8A547] text-xs font-semibold mb-3">
                <Radio className="h-3.5 w-3.5 animate-pulse" /> Live Fleet & Customer GPS Radar
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
                Zimbabwe Real-Time Fleet Tracking
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Monitor active rentals, safari cruisers, bus hire, and emergency roadside vehicles live across all 10 provinces of Zimbabwe in US Dollars.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/search"
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
              >
                Browse All Listings
              </Link>
              <Link
                href="/company/register"
                className="px-4 py-2.5 rounded-xl bg-[#E8A547] hover:bg-[#C68227] text-slate-950 text-xs font-bold shadow-lg shadow-[#E8A547]/20 transition-all"
              >
                Register Your Fleet
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Activity className="h-4 w-4 text-[#E8A547]" /> Active Live Markers
              </div>
              <div className="text-2xl font-bold text-white">128 Vehicles</div>
              <div className="text-[11px] text-emerald-400 mt-1">Harare, Vic Falls & Bulawayo</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Compass className="h-4 w-4 text-blue-400" /> Coverage Area
              </div>
              <div className="text-2xl font-bold text-white">10 Provinces</div>
              <div className="text-[11px] text-blue-400 mt-1">16 Major Zimbabwean Cities</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Verification Status
              </div>
              <div className="text-2xl font-bold text-white">100% Verified</div>
              <div className="text-[11px] text-slate-400 mt-1">GPS Telematics Enabled</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Zap className="h-4 w-4 text-[#E8A547]" /> Currency Standard
              </div>
              <div className="text-2xl font-bold text-white">USD ($)</div>
              <div className="text-[11px] text-[#E8A547] mt-1">United States Dollars</div>
            </div>
          </div>

          {/* Interactive Map Section */}
          <div className="mb-12">
            <TrackingMap height="680px" />
          </div>

          {/* Cities Grid */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Explore Vehicles by Zimbabwe Cities & Hubs
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {ZIMBABWE_CITIES.map((city) => (
                <Link
                  key={city.name}
                  href={`/search?city=${encodeURIComponent(city.name)}`}
                  className="p-3 rounded-xl bg-white/5 hover:bg-[#E8A547]/10 hover:border-[#E8A547]/40 border border-white/10 text-center transition-all group"
                >
                  <MapPin className="h-4 w-4 text-[#E8A547] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-[#E8A547]">
                    {city.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {city.province.replace(' Metropolitan', '')}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-12">Loading Live Zimbabwe GPS Radar...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
