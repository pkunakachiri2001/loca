'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, ArrowRight, Shield, Star, Zap, Car, Bus, User, Wrench,
  Package, ShoppingBag, Utensils, Headphones, Clock, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

const CATEGORY_TABS = [
  { label: 'Car Rental', value: 'CAR_RENTAL', icon: Car },
  { label: 'Bus Hire', value: 'BUS_RENTAL', icon: Bus },
  { label: 'Pro Driver', value: 'DRIVER', icon: User },
  { label: 'Mechanic', value: 'MECHANIC', icon: Wrench },
  { label: 'Deliveries', value: 'COURIER', icon: Package },
];

const POPULAR = [
  { label: '4x4 Safari Harare', q: 'Land Cruiser', city: 'Harare' },
  { label: 'Bus hire Victoria Falls', q: 'Bus hire', city: 'Victoria Falls' },
  { label: 'Toyota Camry Bulawayo', q: 'Toyota Camry', city: 'Bulawayo' },
  { label: 'Mechanic Mutare', q: 'Mechanic', city: 'Mutare' },
];

export function HeroSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('CAR_RENTAL');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (location) params.set('city', location);
    if (selectedCategory) params.set('category', selectedCategory);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-[#FAFCFB] pt-24 pb-16 overflow-hidden">
      {/* Soft Top Radial Glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle 800px at 20% -10%, rgba(0, 135, 103, 0.08) 0%, transparent 80%)'
        }}
      />

      <div className="section-container relative z-10 pt-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center min-h-[580px]">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 space-y-7 text-left">
            {/* Pill Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex"
            >
              <span className="px-4 py-2 rounded-full text-xs font-bold bg-[#E6F4F1] text-[#008767] border border-[#B2E3D8] shadow-sm">
                Your Journey. Our Platform. Endless Possibilities.
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-extrabold text-[#0B192C] leading-[1.08] tracking-tight"
              style={{ fontSize: 'clamp(44px, 5.5vw, 76px)' }}
            >
              Move More.<br />
              <span className="text-[#008767]">Live Better.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-600 text-lg md:text-xl max-w-xl leading-relaxed font-medium"
            >
              Famba is your all-in-one platform for smart travel, seamless deliveries, and everyday services that simplify your life.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                href="/auth/register"
                className="px-7 py-4 rounded-xl font-bold text-white bg-[#008767] hover:bg-[#007358] shadow-lg shadow-[#008767]/25 hover:shadow-xl hover:shadow-[#008767]/35 transition-all flex items-center gap-2 text-base"
              >
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/search"
                className="px-7 py-4 rounded-xl font-bold text-[#008767] bg-white border-2 border-[#008767] hover:bg-[#E6F4F1] transition-all flex items-center gap-2 text-base shadow-sm"
              >
                Explore Services
              </Link>
            </motion.div>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-200/80 text-sm font-semibold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E6F4F1] text-[#008767] flex items-center justify-center">
                  <Shield className="h-4 w-4" />
                </div>
                <span>Safe & Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E6F4F1] text-[#008767] flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <span>Fast & Reliable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E6F4F1] text-[#008767] flex items-center justify-center">
                  <Headphones className="h-4 w-4" />
                </div>
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Mobile App UI & Visual Graphic */}
          <div className="lg:col-span-5 relative flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full max-w-[440px]"
            >
              {/* Backing Graphic Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-[#008767]/15 blur-3xl -z-10" />
              <div className="absolute top-8 right-0 w-64 h-64 rounded-full bg-[#008767] -z-10 opacity-90" />

              {/* Mobile Phone Mockup Card */}
              <div className="bg-white rounded-[32px] p-5 shadow-2xl border-4 border-slate-900/10 text-slate-900 space-y-4">
                {/* Status bar header */}
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-2">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-900" />
                    <span className="w-2 h-2 rounded-full bg-slate-900" />
                  </div>
                </div>

                {/* User Greeting */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Hello, Tapiwa</p>
                    <p className="text-base font-extrabold text-[#0B192C]">Where to today?</p>
                  </div>
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
                      alt="Tapiwa"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#008767]"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#008767] border-2 border-white rounded-full" />
                  </div>
                </div>

                {/* Search Bar Input Mock */}
                <div className="relative">
                  <input
                    disabled
                    type="text"
                    placeholder="Where are you going?"
                    className="w-full bg-slate-100/80 border border-slate-200 rounded-xl py-3 pl-4 pr-10 text-xs font-medium text-slate-600"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#008767] rounded-lg flex items-center justify-center text-white">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Service Icons Grid */}
                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  <div className="bg-[#E6F4F1] p-3 rounded-2xl border border-[#B2E3D8] flex flex-col items-center">
                    <Car className="h-5 w-5 text-[#008767] mb-1" />
                    <span className="text-[10px] font-bold text-[#008767]">Transport</span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 flex flex-col items-center">
                    <Package className="h-5 w-5 text-blue-600 mb-1" />
                    <span className="text-[10px] font-bold text-blue-700">Deliveries</span>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex flex-col items-center">
                    <ShoppingBag className="h-5 w-5 text-amber-600 mb-1" />
                    <span className="text-[10px] font-bold text-amber-700">Errands</span>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 flex flex-col items-center">
                    <Utensils className="h-5 w-5 text-orange-600 mb-1" />
                    <span className="text-[10px] font-bold text-orange-700">Food</span>
                  </div>
                </div>

                {/* Recent Activity List */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0B192C]">Recent Trips</span>
                    <span className="text-[#008767] font-semibold text-[11px]">See all</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Car className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0B192C]">Home</p>
                        <p className="text-[10px] text-slate-400">Samora Machel Ave, Harare</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#008767]">$2.50</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#008767] flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0B192C]">Work</p>
                        <p className="text-[10px] text-slate-400">Borrowdale Rd, Harare</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#008767]">$2.50</span>
                  </div>
                </div>
              </div>

              {/* Floating User Person Silhouette overlay */}
              <div className="absolute -bottom-6 -right-6 hidden sm:block pointer-events-none">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-emerald-700">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face"
                    alt="Famba User"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Search Bar Widget Overlay ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 max-w-5xl mx-auto"
        >
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200/80">
            {/* Category selection tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORY_TABS.map((tab) => {
                const active = selectedCategory === tab.value;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setSelectedCategory(tab.value)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#008767] text-white shadow-md shadow-[#008767]/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Location */}
                <div className="md:col-span-5 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#008767]" />
                  <input
                    type="text"
                    placeholder="City or location (e.g. Harare, Bulawayo)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-[#0B192C] focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all"
                  />
                </div>

                {/* Search query */}
                <div className="md:col-span-5 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#008767]" />
                  <input
                    type="text"
                    placeholder="Search vehicle, driver, mechanic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold text-[#0B192C] focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all"
                  />
                </div>

                {/* Submit button */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full h-full min-h-[48px] bg-[#008767] hover:bg-[#007358] text-white rounded-2xl font-bold text-sm shadow-md shadow-[#008767]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>

        {/* ── Feature Cards Row ("Everything You Need / All-in-One Platform") ── */}
        <div className="mt-20 pt-10 border-t border-slate-200">
          <div className="mb-10 text-left">
            <span className="text-xs font-bold text-[#008767] uppercase tracking-wider block mb-1">
              Everything You Need
            </span>
            <h2 className="font-display text-3xl font-extrabold text-[#0B192C]">
              All-in-One Platform
            </h2>
            <div className="w-12 h-1 bg-[#008767] rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Smart Transport */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#008767]/50 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] text-[#008767] flex items-center justify-center shrink-0">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0B192C] mb-1">Smart Transport</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Book rides instantly and get to your destination safely and on time.
                </p>
              </div>
            </div>

            {/* Deliveries */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#008767]/50 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#008767] flex items-center justify-center shrink-0">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0B192C] mb-1">Deliveries</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Send and receive packages quickly and affordably.
                </p>
              </div>
            </div>

            {/* Errands & More */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#008767]/50 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0B192C] mb-1">Errands & More</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  From grocery runs to personal errands, we've got you.
                </p>
              </div>
            </div>

            {/* Food & Essentials */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#008767]/50 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Utensils className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0B192C] mb-1">Food & Essentials</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Order your favorite meals and essentials delivered to your door.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
