'use client';

import { Suspense } from 'react';
import { TrackingMap } from '@/components/map/TrackingMap';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ZIMBABWE_CITIES, ZIMBABWE_PROVINCES } from '@/lib/zimbabwe-locations';
import { MapPin, ShieldCheck, Zap, Activity, Navigation, Radio, Compass, Car, DollarSign } from 'lucide-react';
import Link from 'next/link';

function TrackingContent() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header section */}
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider mb-3">
                <Radio className="h-3.5 w-3.5 animate-pulse text-[#008767]" />
                <span>Live Zimbabwe GPS Vehicle Radar</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#0B192C]">
                Real-Time Vehicle Tracking
              </h1>
              <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                Monitor active rentals, verified passenger cars, and roadside vehicles live across all 10 provinces of Zimbabwe in USD.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/search"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 shadow-sm transition-all"
              >
                Browse All Listings
              </Link>
              <Link
                href="/company/register"
                className="px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white text-xs font-bold shadow-md shadow-[#008767]/20 transition-all"
              >
                Register Your Vehicle
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                <Activity className="h-4 w-4 text-[#008767]" />
                <span>Active Live Markers</span>
              </div>
              <div className="text-2xl font-extrabold text-[#0B192C]">128 Vehicles</div>
              <div className="text-[11px] font-semibold text-[#008767] mt-1">Harare, Bulawayo & Vic Falls</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                <Compass className="h-4 w-4 text-[#008767]" />
                <span>Coverage Area</span>
              </div>
              <div className="text-2xl font-extrabold text-[#0B192C]">10 Provinces</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">16 Major Zimbabwean Hubs</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                <ShieldCheck className="h-4 w-4 text-[#008767]" />
                <span>Verification Status</span>
              </div>
              <div className="text-2xl font-extrabold text-[#008767]">100% Verified</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">GPS Telematics Enabled</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                <DollarSign className="h-4 w-4 text-[#008767]" />
                <span>Currency Standard</span>
              </div>
              <div className="text-2xl font-extrabold text-[#0B192C]">USD ($)</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">United States Dollars</div>
            </div>
          </div>

          {/* Interactive Map Section */}
          <div className="mb-12 bg-white rounded-3xl p-3 border border-slate-200 shadow-lg">
            <TrackingMap height="680px" />
          </div>

          {/* Cities Grid */}
          <div>
            <h2 className="text-lg font-bold text-[#0B192C] mb-4">
              Explore Vehicles by Zimbabwe Cities & Hubs
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {ZIMBABWE_CITIES.map((city) => (
                <Link
                  key={city.name}
                  href={`/search?city=${encodeURIComponent(city.name)}`}
                  className="p-3.5 rounded-xl bg-white hover:bg-[#E6F4F1] hover:border-[#008767] border border-slate-200 text-center transition-all group shadow-sm"
                >
                  <MapPin className="h-4 w-4 text-[#008767] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-bold text-slate-700 group-hover:text-[#008767]">
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
    <Suspense fallback={<div className="min-h-screen bg-[#FAFCFB] text-[#008767] p-12">Loading Live Zimbabwe GPS Radar...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
