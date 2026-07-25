'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ChevronDown, ArrowRight, Shield, Star, Zap, Car, Bus, User, Wrench, Droplets } from 'lucide-react';
import { BackgroundVideo } from '@/components/ui/BackgroundVideo';

const CATEGORY_TABS = [
  { label: 'Car Rental', value: 'CAR_RENTAL', icon: Car },
  { label: 'Bus Charter', value: 'BUS_RENTAL', icon: Bus },
  { label: 'Pro Driver', value: 'DRIVER', icon: User },
  { label: 'Mechanic', value: 'MECHANIC', icon: Wrench },
  { label: 'Car Wash', value: 'CAR_WASH', icon: Droplets },
];

const POPULAR = [
  { label: '4x4 Safari Harare', q: 'Land Cruiser', city: 'Harare' },
  { label: 'Bus charter Victoria Falls', q: 'Bus charter', city: 'Victoria Falls' },
  { label: 'Toyota Camry Bulawayo', q: 'Toyota Camry', city: 'Bulawayo' },
  { label: 'Mechanic Mutare', q: 'Mechanic', city: 'Mutare' },
];

export function HeroSection() {
  const router = useRouter();
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
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Copper radial glow overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(232,165,71,0.12) 0%, transparent 70%)'
      }} />

      {/* Content */}
      <div className="relative section-container text-center z-20 py-16">

        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-6"
        >
          <span className="section-badge">
            <Zap className="h-3 w-3" />
            Africa's #1 Transport Marketplace
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold leading-[1.05] text-white mb-6"
          style={{ fontSize: 'clamp(44px, 7vw, 88px)', letterSpacing: '-0.03em' }}
        >
          Every Journey
          <br />
          <span className="gradient-text">
            Starts Here
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="mx-auto max-w-xl text-lg mb-10 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          Book luxury cars, group buses, verified drivers, mechanics, and car washes from{' '}
          <span style={{ color: '#F5F0E8', fontWeight: 600 }}>500+ verified businesses</span>.
        </motion.p>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          {[
            { icon: Shield, text: 'Verified Providers' },
            { icon: Star, text: '4.8★ Average Rating' },
            { icon: Zap, text: 'Instant Reservation' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(232,165,71,0.2)' }}>
                <Icon className="h-3.5 w-3.5" style={{ color: '#E8A547' }} />
              </div>
              <span>{text}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Search Bar Widget ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto max-w-4xl"
        >
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {CATEGORY_TABS.map((tab) => {
              const active = selectedCategory === tab.value;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedCategory(tab.value)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold font-display transition-all duration-200"
                  style={{
                    background: active ? '#E8A547' : 'rgba(26,26,28,0.85)',
                    color: active ? '#0E0E10' : '#9A9A9E',
                    border: active ? '1px solid #E8A547' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: active ? '0 4px 16px rgba(232,165,71,0.3)' : 'none',
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearch}>
            <div className="rounded-2xl p-2.5" style={{
              background: 'linear-gradient(145deg, rgba(26,26,28,0.92) 0%, rgba(18,18,20,0.96) 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 48px -12px rgba(0,0,0,0.8)',
            }}>
              <div className="flex flex-col md:flex-row gap-2.5">

                {/* Location */}
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#E8A547' }} />
                  <input
                    type="text"
                    placeholder="City or location (e.g. Harare)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl pl-11 pr-4 py-4 text-sm focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#F5F0E8',
                    }}
                  />
                </div>

                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#E8A547' }} />
                  <input
                    type="text"
                    placeholder="Vehicle model, driver, mechanic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl pl-11 pr-4 py-4 text-sm focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#F5F0E8',
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn-primary px-8 py-4 text-sm shrink-0 group">
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </form>

          {/* Popular Chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold" style={{ color: '#5A5A60' }}>Popular searches:</span>
            {POPULAR.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(`/search?q=${encodeURIComponent(item.q)}&city=${encodeURIComponent(item.city)}`)}
                className="rounded-full px-3.5 py-1 text-xs transition-all font-medium"
                style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#9A9A9E' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = '#F5F0E8';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,165,71,0.4)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(232,165,71,0.08)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = '#9A9A9E';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 1.2, duration: 2, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs" style={{ color: '#5A5A60' }}>Scroll to explore</span>
          <div className="h-6 w-4 rounded-full flex items-start justify-center p-0.5"
            style={{ border: '1px solid #3A3A3E' }}>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: '#E8A547' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
