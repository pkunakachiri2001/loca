'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  User,
  ArrowRight,
  ExternalLink,
  Shield,
  Heart,
  Car,
  Gift,
  Users,
  Compass,
  CheckCircle2,
  Mail,
  Building,
  Sparkles,
  ChevronDown,
  X,
  Phone,
  Baby,
  Activity,
  Smile,
  Truck,
  HelpCircle,
  Linkedin,
  Facebook,
  Youtube,
  Instagram,
} from 'lucide-react';

// Brand definitions matching the master image
const brands = [
  {
    id: 'cloud-baby',
    name: 'Cloud Baby',
    url: 'https://www.cloudbaby.co',
    isExternal: true,
    tagline: 'Everything for the motherhood journey.',
    actionText: 'Explore Services',
    color: '#0284C7',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Trusted maternity essentials, infant care, prenatal wellness, and pediatric support designed for modern mothers.',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80',
    logoType: 'cloud',
    services: [
      { name: 'Newborn Essentials & Gear', desc: 'Strollers, cribs, sterilized bottles & organic wear' },
      { name: 'Maternal Nutrition & Wellness', desc: 'Prenatal vitamins, postpartum recovery plans' },
      { name: 'Certified Lactation & Midwife Care', desc: 'On-demand consultations with licensed nurses' },
    ],
  },
  {
    id: 'everyday-dad',
    name: 'Everyday Dad',
    url: 'https://www.everydayday.club',
    isExternal: true,
    tagline: 'Supporting the modern father.',
    actionText: 'Explore Community',
    color: '#1E3A8A',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'A thriving fraternity and resource network empowering fathers with mentorship, work-life balance tools, and family activities.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    logoType: 'dad',
    services: [
      { name: 'Fatherhood Circle & Mentorship', desc: 'Peer forums, weekly coaching & parenting guides' },
      { name: 'Father & Child Experiences', desc: 'Weekend outdoor camps, sports days & DIY workshops' },
      { name: 'Family Financial Planning', desc: 'Education trust funds, insurance planning & investments' },
    ],
  },
  {
    id: 'moviva',
    name: 'Moviva',
    url: 'https://www.moviva.co.zw',
    isExternal: true,
    tagline: 'Making everyday mobility easier.',
    actionText: 'Explore Services',
    color: '#9333EA',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Zimbabwe’s smart commuter & lifestyle transit service. Scheduled daily shuttles, airport transfers, and inter-city family trips.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    logoType: 'moviva',
    services: [
      { name: 'School & Daily Family Shuttles', desc: 'Safe, vetted, GPS-tracked school pick-and-drop' },
      { name: 'Airport & Intercity Travel', desc: 'Fixed-fare private transfers to all national airports' },
      { name: 'Corporate Commute Subscriptions', desc: 'Reliable group transit for modern organizations' },
    ],
  },
  {
    id: 'famba',
    name: 'Famba',
    url: '/',
    isExternal: false,
    tagline: 'Everything your vehicle needs.',
    actionText: 'Explore Services',
    color: '#008767',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'The all-in-one vehicle ecosystem: Instant ZINARA & third-party insurance, verified auto spares, towing and car wash dispatch.',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    logoType: 'famba',
    services: [
      { name: 'Instant Motor & GIT Insurance', desc: 'Stage-by-stage AI quotation with Paynow & QR disc' },
      { name: 'Verified Auto Spares & Parts', desc: 'Genuine OEM parts delivered to your doorstep' },
      { name: '24/7 Roadside Assistance & Towing', desc: 'GPS-powered mechanic and towing dispatch nationwide' },
    ],
  },
];

// Service categories with filter tags
const categories = [
  { id: 'all', label: 'All Services', icon: Sparkles },
  { id: 'baby', label: 'Baby Products', icon: Baby, brandId: 'cloud-baby' },
  { id: 'wellness', label: 'Wellness & Healthcare', icon: Activity, brandId: 'cloud-baby' },
  { id: 'community', label: 'Family Community', icon: Users, brandId: 'everyday-dad' },
  { id: 'mobility', label: 'Travel & Transport', icon: Compass, brandId: 'moviva' },
  { id: 'insurance', label: 'Vehicle Insurance (GIT & Motor)', icon: Shield, brandId: 'famba' },
  { id: 'vouchers', label: 'Vouchers & Gift Cards', icon: Gift, brandId: 'all' },
];

export default function EcosystemPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBrandModal, setActiveBrandModal] = useState<typeof brands[0] | null>(null);
  const [cartCount, setCartCount] = useState(2);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Filtered services across the 4 brands
  const filteredServices = useMemo(() => {
    let list: Array<{
      title: string;
      desc: string;
      brandName: string;
      brandColor: string;
      brandUrl: string;
      category: string;
    }> = [];

    brands.forEach((b) => {
      b.services.forEach((s) => {
        let cat = 'general';
        if (b.id === 'cloud-baby') cat = 'baby';
        if (b.id === 'everyday-dad') cat = 'community';
        if (b.id === 'moviva') cat = 'mobility';
        if (b.id === 'famba') cat = 'insurance';

        list.push({
          title: s.name,
          desc: s.desc,
          brandName: b.name,
          brandColor: b.color,
          brandUrl: b.url,
          category: cat,
        });
      });
    });

    // Add extra vouchers & wellness items
    list.push({
      title: 'ParentaNova Family Gift Voucher ($50 - $250)',
      desc: 'Redeemable across Cloud Baby, Moviva, Everyday Dad and Famba services.',
      brandName: 'ParentaNova',
      brandColor: '#0B1B3D',
      brandUrl: '#',
      category: 'vouchers',
    });
    list.push({
      title: 'Family Health & Pediatric Tele-Clinic',
      desc: 'Virtual checkups with certified pediatricians and family medical counselors.',
      brandName: 'Cloud Baby & Wellness',
      brandColor: '#0284C7',
      brandUrl: 'https://www.cloudbaby.co',
      category: 'wellness',
    });

    return list.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        item.category === selectedCategory ||
        (selectedCategory === 'wellness' && item.category === 'wellness');

      const matchesQuery =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brandName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 5000);
    setNewsletterEmail('');
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#0B1B3D] selection:bg-[#0B1B3D] selection:text-white">
      {/* ============================================================ */}
      {/* 1. TOP NAVBAR */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Tagline */}
          <Link href="/ecosystem" className="flex items-center gap-3 group">
            {/* ParentaNova Logo Icon */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
                <circle cx="24" cy="24" r="22" fill="#F1F5F9" />
                {/* 3 embracing figures forming heart */}
                <path
                  d="M17 19C18.6569 19 20 17.6569 20 16C20 14.3431 18.6569 13 17 13C15.3431 13 14 14.3431 14 16C14 17.6569 15.3431 19 17 19Z"
                  fill="#0284C7"
                />
                <path
                  d="M31 19C32.6569 19 34 17.6569 34 16C34 14.3431 32.6569 13 31 13C29.3431 13 28 14.3431 28 16C28 17.6569 29.3431 19 31 19Z"
                  fill="#F97316"
                />
                <circle cx="24" cy="22" r="2.5" fill="#EF4444" />
                <path
                  d="M24 25C19 25 14 29 14 34H34C34 29 29 25 24 25Z"
                  fill="url(#parentaGradient)"
                />
                <defs>
                  <linearGradient id="parentaGradient" x1="14" y1="25" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0284C7" />
                    <stop offset="0.5" stopColor="#EF4444" />
                    <stop offset="1" stopColor="#F97316" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-[#0B1B3D]">ParentaNova</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-normal -mt-0.5">
                Making family life work better.
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            <Link
              href="/ecosystem"
              className="bg-[#0B1B3D] text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs"
            >
              Home
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById('brands-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100 transition-all"
            >
              Explore Brands <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('services-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100 transition-all"
            >
              Services <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            <Link
              href="/search"
              className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100 transition-all"
            >
              Marketplace
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById('ecosystem-join');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100 transition-all"
            >
              Membership
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('for-businesses');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100 transition-all"
            >
              Business Solutions <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            <Link
              href="/about"
              className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#0B1B3D] hover:bg-slate-100 transition-all"
            >
              About Us
            </Link>
          </nav>

          {/* Right Header Controls (Search, Account, Cart) */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-48 lg:w-60 bg-slate-100/90 text-xs text-slate-900 placeholder-slate-400 rounded-full border border-slate-200 focus:outline-none focus:border-[#0B1B3D] focus:bg-white transition-all"
              />
            </div>

            <Link
              href="/auth/login?redirect=/ecosystem"
              className="p-2 text-slate-700 hover:text-[#0B1B3D] hover:bg-slate-100 rounded-full transition-all"
              title="My Account"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={() => alert('ParentaNova Unified Cart: 2 items active across Famba Insurance and Cloud Baby!')}
              className="relative p-2 text-slate-700 hover:text-[#0B1B3D] hover:bg-slate-100 rounded-full transition-all"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-slate-200/60 relative bg-white">
          <div className="relative min-h-[460px] md:min-h-[520px] flex items-center">
            {/* Background Image of joyful African family */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1800&q=85"
                alt="ParentaNova Family Ecosystem"
                fill
                priority
                className="object-cover object-center"
              />
              {/* Soft overlay gradient to ensure text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:w-3/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
            </div>

            {/* Hero Copy */}
            <div className="relative z-10 max-w-2xl px-8 sm:px-12 py-12 md:py-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B1B3D] tracking-tight leading-[1.08] mb-4">
                  One ecosystem. <br />
                  <span className="text-[#0B1B3D]">Four brands.</span> <br />
                  <span className="text-slate-800 text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                    A better way to manage everyday life.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-xl font-normal mb-8">
                  ParentaNova brings together technology, products, communities and services that support
                  families at every stage of life.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => {
                      const el = document.getElementById('brands-grid');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#0B1B3D] text-white text-sm font-semibold tracking-wide hover:bg-[#1E293B] shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all group"
                  >
                    <span>Explore Our Ecosystem</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/90 backdrop-blur-xs text-xs font-semibold text-slate-800 border border-slate-300 hover:bg-white shadow-xs transition-all"
                  >
                    <span>Return to Famba</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. FOUR BRANDS NAVIGATOR GRID */}
      {/* ============================================================ */}
      <section id="brands-grid" className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {brands.map((b) => (
              <motion.div
                key={b.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md overflow-hidden flex flex-col justify-between group transition-all"
              >
                {/* Brand Header & Info */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    {/* Brand Logo Rendering */}
                    <div className="flex items-center gap-2.5">
                      {b.logoType === 'cloud' && (
                        <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-200/80">
                          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-current stroke-2">
                            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                            <path d="M12 12a1.5 1.5 0 0 1 1.5 1.5c0 1.5-2.5 3-2.5 3s-2.5-1.5-2.5-3A1.5 1.5 0 0 1 10 12c.5 0 1 .5 1.5 1 .5-.5 1-1 1.5-1Z" fill="#EC4899" stroke="none" />
                          </svg>
                        </div>
                      )}
                      {b.logoType === 'dad' && (
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black text-xl border border-indigo-200/80">
                          D
                        </div>
                      )}
                      {b.logoType === 'moviva' && (
                        <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-extrabold text-lg border border-purple-200/80">
                          M
                        </div>
                      )}
                      {b.logoType === 'famba' && (
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-black italic text-xl border border-emerald-200/80">
                          F
                        </div>
                      )}

                      <span className="font-extrabold text-xl tracking-tight text-[#0B1B3D]">
                        {b.name}
                      </span>
                    </div>

                    {b.isExternal && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        Live <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 font-medium mb-4 min-h-[32px]">
                    {b.tagline}
                  </p>

                  {/* Action Link */}
                  {b.isExternal ? (
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1B3D] hover:underline group-hover:gap-2 transition-all"
                    >
                      <span>{b.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      href={b.url}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1B3D] hover:underline group-hover:gap-2 transition-all"
                    >
                      <span>{b.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {/* Brand Photo */}
                <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={b.image}
                    alt={b.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={() => setActiveBrandModal(b)}
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[11px] font-semibold text-slate-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. DISCOVER OUR SERVICES & ECOSYSTEM CARD SECTION */}
      {/* ============================================================ */}
      <section id="services-section" className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Main Services Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D] tracking-tight">
                  Discover Our Services
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
                  Find and access a wide range of products and services for your family.
                </p>
              </div>

              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-bold text-[#0B1B3D] hover:underline inline-flex items-center gap-1 self-start md:self-auto"
              >
                <span>Browse All Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Universal Search Bar */}
            <div className="relative mb-6">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services (e.g. insurance, baby products, travel, mechanics, fatherhood...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0B1B3D] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Icon Filter Pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-[#0B1B3D] text-white border-[#0B1B3D] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Filtered Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {filteredServices.map((svc, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {svc.brandName}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-[#0B1B3D] mb-1">{svc.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{svc.desc}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">Integrated Ecosystem</span>
                    <a
                      href={svc.brandUrl}
                      target={svc.brandUrl.startsWith('http') ? '_blank' : undefined}
                      rel={svc.brandUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-xs font-bold text-[#0B1B3D] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* 5. "CONNECTED FOR A STRONGER FAMILY" BANNER */}
          {/* ============================================================ */}
          <div
            id="ecosystem-join"
            className="rounded-3xl overflow-hidden relative border border-slate-200/60 shadow-lg bg-[#0B1B3D] text-white"
          >
            <div className="relative min-h-[300px] flex flex-col lg:flex-row items-center justify-between">
              {/* Background photo: sunset family silhouette */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
                  alt="Connected Family"
                  fill
                  className="object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1B3D] via-[#0B1B3D]/90 to-transparent" />
              </div>

              {/* Left Copy */}
              <div className="relative z-10 p-8 sm:p-12 lg:w-3/5">
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                  Connected for a stronger family
                </h3>
                <p className="text-slate-300 text-sm sm:text-base font-normal max-w-lg mb-6">
                  One account. Multiple benefits. A seamless experience across all four platforms.
                </p>

                <button
                  onClick={() => alert('ParentaNova Unified SSO Membership launching soon! You will be able to log into Cloud Baby, Everyday Dad, Moviva and Famba with one single login.')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#0B1B3D] text-xs font-bold tracking-wide hover:bg-slate-100 shadow-md transition-all group"
                >
                  <span>Join Our Ecosystem</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Right Ecosystem Perks List */}
              <div className="relative z-10 p-8 sm:p-12 lg:w-2/5 flex flex-col gap-3.5 w-full">
                {[
                  { icon: ShoppingCart, text: 'Shop & Book' },
                  { icon: Sparkles, text: 'Earn Rewards' },
                  { icon: Shield, text: 'Access Exclusive Benefits' },
                  { icon: Users, text: 'Manage Your Family in One Place' },
                ].map((perk, idx) => {
                  const Icon = perk.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold tracking-wide">{perk.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 6. BOTTOM THREE SPOTLIGHT CARDS */}
          {/* ============================================================ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: For Businesses */}
            <div
              id="for-businesses"
              className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all overflow-hidden"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  — For Businesses
                </span>
                <h4 className="text-xl font-extrabold text-[#0B1B3D] mb-2 leading-snug">
                  Invest in your people&apos;s family wellbeing
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Partner with ParentaNova for employee benefits, family solutions and corporate fleet support.
                </p>
                <button
                  onClick={() => alert('Corporate Partnership form: Inquire at corporate@parentanova.com or call +263 77 123 4567.')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1B3D] hover:underline mb-4"
                >
                  <span>Partner With Us</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative h-44 rounded-2xl overflow-hidden mt-2 bg-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                  alt="Corporate Family Solutions"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Card 2: Our Vision */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all overflow-hidden">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  — Our Vision
                </span>
                <h4 className="text-xl font-extrabold text-[#0B1B3D] mb-2 leading-snug">
                  A future where every family thrives, everywhere.
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Innovative solutions for modern families, today and tomorrow across maternal care, transport and vehicle security.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1B3D] hover:underline mb-4"
                >
                  <span>About ParentaNova</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="relative h-44 rounded-2xl overflow-hidden mt-2 bg-slate-100">
                <Image
                  src="https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80"
                  alt="Family Vision"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Card 3: Stay Connected Newsletter */}
            <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 rounded-3xl border border-indigo-100 p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-extrabold text-[#0B1B3D] mb-2">
                  Stay Connected
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Get the latest updates, offers and family tips delivered straight to your inbox.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition-all shadow-xs"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0B1B3D] text-white text-xs font-bold tracking-wide hover:bg-slate-800 transition-all shadow-sm"
                >
                  Subscribe
                </button>
                {subscribed && (
                  <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Thank you for subscribing to ParentaNova!
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. FOOTER */}
      {/* ============================================================ */}
      <footer className="bg-[#0B1B3D] text-white pt-12 pb-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Row: ParentaNova + 4 Brand Logos */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            {/* Left: ParentaNova */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
                  <circle cx="24" cy="24" r="22" fill="#1E293B" />
                  <path d="M17 19C18.6569 19 20 17.6569 20 16C20 14.3431 18.6569 13 17 13C15.3431 13 14 14.3431 14 16C14 17.6569 15.3431 19 17 19Z" fill="#0284C7" />
                  <path d="M31 19C32.6569 19 34 17.6569 34 16C34 14.3431 32.6569 13 31 13C29.3431 13 28 14.3431 28 16C28 17.6569 29.3431 19 31 19Z" fill="#F97316" />
                  <circle cx="24" cy="22" r="2.5" fill="#EF4444" />
                  <path d="M24 25C19 25 14 29 14 34H34C34 29 29 25 24 25Z" fill="#FFFFFF" opacity="0.8" />
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">ParentaNova</span>
                <p className="text-[10px] text-slate-400">Making family life work better.</p>
              </div>
            </div>

            {/* Right: 4 Brands clickable items */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <a
                href="https://www.cloudbaby.co"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-xs font-bold tracking-wide">Cloud Baby</span>
              </a>
              <a
                href="https://www.everydayday.club"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-xs font-bold tracking-wide">Everyday Dad</span>
              </a>
              <a
                href="https://www.moviva.co.zw"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-xs font-bold tracking-wide">Moviva</span>
              </a>
              <Link
                href="/"
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold tracking-wide">Famba</span>
              </Link>
            </div>
          </div>

          {/* Bottom Row: Links, Socials, Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link href="/help" className="hover:text-white transition-colors">Help</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="YouTube"><Youtube className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
            </div>

            <p className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} ParentaNova. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* 8. BRAND DETAILS MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {activeBrandModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden"
            >
              <button
                onClick={() => setActiveBrandModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="font-extrabold text-2xl tracking-tight text-[#0B1B3D]">
                  {activeBrandModal.name}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${activeBrandModal.badgeBg}`}>
                  Ecosystem Pillar
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-6 font-normal">
                {activeBrandModal.description}
              </p>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Key Offerings & Solutions
              </h4>
              <div className="space-y-2.5 mb-6">
                {activeBrandModal.services.map((svc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="font-bold text-xs text-[#0B1B3D]">{svc.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{svc.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {activeBrandModal.isExternal ? (
                  <a
                    href={activeBrandModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#0B1B3D] text-white text-xs font-bold text-center tracking-wide hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Launch {activeBrandModal.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    href={activeBrandModal.url}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#0B1B3D] text-white text-xs font-bold text-center tracking-wide hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Open {activeBrandModal.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                <button
                  onClick={() => setActiveBrandModal(null)}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
