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
  Gift,
  Users,
  Compass,
  CheckCircle2,
  Mail,
  Sparkles,
  ChevronDown,
  X,
  Baby,
  Activity,
  Phone,
  Linkedin,
  Facebook,
  Youtube,
  Instagram,
} from 'lucide-react';

// Brand definitions matching ParentaNova Ecosystem with official inserted logos
const brands = [
  {
    id: 'cloud-baby',
    name: 'Cloud Baby',
    logoImage: '/ecosystem/logos/cloud-baby.png',
    url: 'https://www.cloudbaby.co',
    isExternal: true,
    tagline: 'One stop shop for moms everyday needs.',
    actionText: 'Explore Services',
    color: '#0284C7',
    clayTone: 'from-sky-50/90 via-white to-sky-50/40',
    badgeClay: 'bg-sky-100 text-sky-900 border border-sky-200/80',
    description: 'A one-stop shop for mothers at every stage — infant care, maternity essentials, nursing, postpartum wellness and daily baby supplies.',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80',
    services: [
      { name: 'Moms & Newborn Essentials', desc: 'Strollers, cribs, feeding bottles, organic clothing & nursery supplies' },
      { name: 'Maternal Nutrition & Postpartum Care', desc: 'Prenatal vitamins, nursing recovery plans and lactation guides' },
      { name: 'Certified Midwife & Pediatric Consultations', desc: 'On-demand tele-advice with licensed nurses and infant specialists' },
    ],
  },
  {
    id: 'everyday-dad',
    name: 'Everyday Dad',
    logoImage: '/ecosystem/logos/everyday-dad.png',
    url: 'https://www.everydaydad.club',
    isExternal: true,
    tagline: 'Supporting the modern father.',
    actionText: 'Explore Community',
    color: '#1E3A8A',
    clayTone: 'from-indigo-50/90 via-white to-indigo-50/40',
    badgeClay: 'bg-indigo-100 text-indigo-900 border border-indigo-200/80',
    description: 'A thriving fraternity and resource network empowering fathers with mentorship, work-life balance tools, and family activities.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    services: [
      { name: 'Fatherhood Circle & Mentorship', desc: 'Peer forums, weekly coaching & practical parenting guides' },
      { name: 'Father & Child Experiences', desc: 'Weekend outdoor camps, sports days & DIY workshops' },
      { name: 'Family Financial Planning', desc: 'Education trust funds, insurance planning & investments' },
    ],
  },
  {
    id: 'moviva',
    name: 'Moviva',
    logoImage: '/ecosystem/logos/moviva.png',
    url: 'https://www.moviva.co.zw',
    isExternal: true,
    tagline: 'Family wellness platform that help families manage diabetes, hypertension and cancer daily.',
    actionText: 'Explore Wellness',
    color: '#9333EA',
    clayTone: 'from-purple-50/90 via-white to-purple-50/40',
    badgeClay: 'bg-purple-100 text-purple-900 border border-purple-200/80',
    description: 'A dedicated family wellness and chronic care platform helping families monitor and manage diabetes, hypertension, and cancer daily with specialized care teams and tools.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    services: [
      { name: 'Diabetes Daily Care & Blood Sugar Tracking', desc: 'Continuous glucose monitoring kits, insulin assistance & personalized dietary coaches' },
      { name: 'Hypertension & Cardiovascular Monitoring', desc: 'Daily BP logging, telehealth cardiology reviews & prescription refill delivery' },
      { name: 'Cancer Support & Oncology Family Navigation', desc: 'Specialized care pathways, holistic wellness resources & family counseling' },
    ],
  },
  {
    id: 'famba',
    name: 'Famba',
    logoImage: '/ecosystem/logos/famba.png',
    url: '/',
    isExternal: false,
    tagline: 'Your mobility platform for your everyday logistics and transport need.',
    actionText: 'Explore Mobility',
    color: '#008767',
    clayTone: 'from-emerald-50/90 via-white to-emerald-50/40',
    badgeClay: 'bg-emerald-100 text-emerald-900 border border-emerald-200/80',
    description: 'Your complete mobility and logistics platform: passenger transport, vehicle insurance (ZINARA & third-party), auto spares, cargo haulage, and 24/7 emergency roadside towing.',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    services: [
      { name: 'Everyday Transport & Logistics Courier', desc: 'Safe commuter booking, intra-city courier deliveries, parcel haulage & school rides' },
      { name: 'Instant Motor & GIT Vehicle Insurance', desc: 'Stage-by-stage AI quotation, instant Paynow checkout & verified digital QR disc' },
      { name: '24/7 Roadside Assistance & Spares', desc: 'GPS mechanic dispatch, towing rescue and verified auto spares delivered' },
    ],
  },
];

// Service categories with filter tags
const categories = [
  { id: 'all', label: 'All Services', icon: Sparkles },
  { id: 'wellness', label: 'Family Wellness (Diabetes, BP, Cancer)', icon: Activity },
  { id: 'mobility', label: 'Mobility & Logistics', icon: Compass },
  { id: 'baby', label: 'Moms & Baby Needs', icon: Baby },
  { id: 'insurance', label: 'Vehicle Insurance & GIT', icon: Shield },
  { id: 'community', label: 'Fatherhood Community', icon: Users },
  { id: 'vouchers', label: 'Vouchers & Gift Cards', icon: Gift },
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
      logoImage: string;
    }> = [];

    brands.forEach((b) => {
      b.services.forEach((s) => {
        let cat = 'general';
        if (b.id === 'cloud-baby') cat = 'baby';
        if (b.id === 'everyday-dad') cat = 'community';
        if (b.id === 'moviva') cat = 'wellness';
        if (b.id === 'famba') cat = 'mobility';

        list.push({
          title: s.name,
          desc: s.desc,
          brandName: b.name,
          brandColor: b.color,
          brandUrl: b.url,
          category: cat,
          logoImage: b.logoImage,
        });
      });
    });

    list.push({
      title: 'ParentaNova Family Gift Voucher ($50 - $250)',
      desc: 'Redeemable across Cloud Baby, Moviva, Everyday Dad and Famba services.',
      brandName: 'ParentaNova',
      brandColor: '#0B1B3D',
      brandUrl: 'https://wa.me/263772886467?text=Hi%20ParentaNova!%20I%20would%20like%20to%20order%20a%20Family%20Gift%20Voucher.',
      category: 'vouchers',
      logoImage: '/ecosystem/logos/parentanova.png',
    });
    list.push({
      title: 'Instant Motor & GIT Vehicle Insurance Discs',
      desc: 'Digital insurance policy issuance with instant Paynow checkout and verified QR discs.',
      brandName: 'Famba Insurance',
      brandColor: '#008767',
      brandUrl: '/',
      category: 'insurance',
      logoImage: '/ecosystem/logos/famba.png',
    });
    list.push({
      title: 'Chronic Illness Family Care Plan (Diabetes, BP & Oncology)',
      desc: 'Specialized daily healthcare packages with blood pressure logs, glucose tracking and medical delivery.',
      brandName: 'Moviva Wellness',
      brandColor: '#9333EA',
      brandUrl: 'https://www.moviva.co.zw',
      category: 'wellness',
      logoImage: '/ecosystem/logos/moviva.png',
    });

    return list.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
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
    <div className="relative min-h-screen bg-gradient-to-br from-[#F1F5F9] via-[#FAF7F2] to-[#EFF3F8] text-[#07132C] selection:bg-[#0B1B3D] selection:text-white overflow-hidden">
      {/* ════════════════════════════════════════════════════════════ */}
      {/* AMBIENT CLAYMORPHIC 3D ORBS */}
      {/* ════════════════════════════════════════════════════════════ */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-gradient-to-tr from-sky-200/40 via-indigo-200/30 to-pink-200/20 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-purple-200/30 via-emerald-100/30 to-amber-100/30 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-emerald-200/30 via-teal-200/20 to-sky-200/30 blur-3xl pointer-events-none -z-10" />

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 1. FLOATING CLAY NAVBAR WITH OFFICIAL PARENTANOVA LOGO */}
      {/* ════════════════════════════════════════════════════════════ */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 lg:px-8 mb-4">
        <div className="max-w-7xl mx-auto clay-card-static px-5 sm:px-7 py-3 flex items-center justify-between gap-4 backdrop-blur-md bg-white/95 border border-white shadow-md">
          {/* Official ParentaNova Logo */}
          <Link href="/ecosystem" className="flex items-center gap-3 group shrink-0">
            <div className="relative h-11 w-44 sm:w-52 transition-transform group-hover:scale-102">
              <Image
                src="/ecosystem/logos/parentanova.png"
                alt="ParentaNova - For Everyday family"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          {/* Navigation Links with Clay Pills */}
          <nav className="hidden xl:flex items-center gap-1.5">
            <Link
              href="/ecosystem"
              className="clay-btn-primary px-4 py-2 text-xs font-extrabold tracking-wide"
            >
              Home
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById('brands-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-[#0B1B3D] hover:bg-slate-100/80 transition-all"
            >
              Explore Brands <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('services-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-[#0B1B3D] hover:bg-slate-100/80 transition-all"
            >
              Services <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            <Link
              href="/search"
              className="px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-[#0B1B3D] hover:bg-slate-100/80 transition-all"
            >
              Marketplace
            </Link>
            <a
              href="https://wa.me/263772886467?text=Hi%20ParentaNova!%20I%20would%20like%20to%20activate%20my%20ParentaNova%20Family%20Membership."
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-[#0B1B3D] hover:bg-slate-100/80 transition-all"
            >
              Membership
            </a>
            <button
              onClick={() => {
                const el = document.getElementById('for-businesses');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-[#0B1B3D] hover:bg-slate-100/80 transition-all"
            >
              Business Solutions <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            <Link
              href="/about"
              className="px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-[#0B1B3D] hover:bg-slate-100/80 transition-all"
            >
              About Us
            </Link>
          </nav>

          {/* Right Header Controls (Search, Account, Cart) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="clay-input pl-9 pr-4 py-2 w-48 lg:w-56 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <Link
              href="/auth/login?redirect=/ecosystem"
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-800 hover:text-[#0B1B3D] shadow-[0_6px_14px_rgba(148,163,184,0.25),inset_2px_2px_4px_rgba(255,255,255,1),inset_-2px_-2px_4px_rgba(148,163,184,0.15)] border border-white hover:scale-105 active:scale-95 transition-all"
              title="My Account"
            >
              <User className="w-4 h-4" />
            </Link>

            <button
              onClick={() => alert('ParentaNova Unified Cart: Active across Famba Mobility, Cloud Baby, Everyday Dad and Moviva!')}
              className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-800 hover:text-[#0B1B3D] shadow-[0_6px_14px_rgba(148,163,184,0.25),inset_2px_2px_4px_rgba(255,255,255,1),inset_-2px_-2px_4px_rgba(148,163,184,0.15)] border border-white hover:scale-105 active:scale-95 transition-all"
              title="View Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 2. HERO CLAY CARD SECTION */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-2 pb-8">
        <div className="max-w-7xl mx-auto clay-card-static overflow-hidden relative border border-white/90 shadow-xl">
          <div className="relative min-h-[500px] md:min-h-[560px] flex items-center">
            {/* Background Image of joyful African family */}
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1800&q=85"
                alt="ParentaNova Family Ecosystem"
                fill
                priority
                className="object-cover object-center"
              />
              {/* Solid clay backdrop gradient to guarantee 100% text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent md:w-3/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent" />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-2xl px-7 sm:px-14 py-12 md:py-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Official Tagline Badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white shadow-[0_6px_14px_rgba(148,163,184,0.25),inset_2px_2px_4px_rgba(255,255,255,1),inset_-2px_-2px_4px_rgba(148,163,184,0.15)] border border-slate-100 text-xs font-black text-[#0B1B3D] mb-6">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ParentaNova: For Everyday Family</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#07132C] tracking-tight leading-[1.08] mb-5">
                  One ecosystem. <br />
                  <span className="text-indigo-900">Four brands.</span> <br />
                  <span className="text-slate-800 text-3xl sm:text-4xl lg:text-5xl font-extrabold">
                    A better way to manage everyday life.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-800 leading-relaxed max-w-xl font-medium mb-8">
                  ParentaNova brings together technology, maternal care, family health management, fatherhood community,
                  and transport logistics that support families at every stage of life.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => {
                      const el = document.getElementById('brands-grid');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="clay-btn-primary px-8 py-4 text-sm font-extrabold tracking-wide flex items-center gap-2.5 group"
                  >
                    <span>Explore Our Ecosystem</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </button>

                  <a
                    href="https://wa.me/263772886467?text=Hi%20ParentaNova!%20I%20would%20like%20more%20information%20about%20the%20ParentaNova%20Ecosystem."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clay-btn-secondary px-6 py-4 text-xs font-extrabold tracking-wide flex items-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Support</span>
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 3. FOUR BRANDS CLAY NAVIGATOR GRID WITH OFFICIAL LOGOS */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section id="brands-grid" className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-200">
              The Four Flagship Pillars
            </span>
            <h2 className="text-3xl font-black text-[#07132C] mt-2">
              Everything Your Family Needs, Under One Roof
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((b) => (
              <motion.div
                key={b.id}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className={`clay-card bg-gradient-to-b ${b.clayTone} p-6 flex flex-col justify-between group overflow-hidden border border-white shadow-md`}
              >
                {/* Brand Header with Official Inserted Logo */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    {/* Official Inserted Logo Image Capsule */}
                    <div className="relative h-12 w-36 sm:w-40 bg-white rounded-2xl px-2.5 py-1.5 flex items-center justify-center shadow-[inset_1px_1px_2px_rgba(255,255,255,1),inset_-1px_-1px_2px_rgba(148,163,184,0.18),0_4px_10px_rgba(0,0,0,0.05)] border border-slate-100">
                      <Image
                        src={b.logoImage}
                        alt={b.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    <span className="text-[10px] font-black text-slate-700 bg-white px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-slate-200">
                      {b.isExternal ? 'Live Platform' : 'Current'}
                      {b.isExternal && <ExternalLink className="w-2.5 h-2.5" />}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-bold mb-4 min-h-[44px] leading-relaxed">
                    {b.tagline}
                  </p>

                  {/* Action Link with 3D Arrow */}
                  {b.isExternal ? (
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#0B1B3D] hover:underline group-hover:gap-2.5 transition-all mb-4"
                    >
                      <span>{b.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-700" />
                    </a>
                  ) : (
                    <Link
                      href={b.url}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-[#0B1B3D] hover:underline group-hover:gap-2.5 transition-all mb-4"
                    >
                      <span>{b.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                    </Link>
                  )}
                </div>

                {/* Soft Clay Encased Photo */}
                <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-white shadow-[inset_2px_2px_6px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.05)] border-2 border-white">
                  <Image
                    src={b.image}
                    alt={b.name}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={() => setActiveBrandModal(b)}
                    className="absolute bottom-2.5 right-2.5 px-3.5 py-1.5 rounded-full bg-white text-[11px] font-black text-[#0B1B3D] shadow-[0_4px_12px_rgba(0,0,0,0.2)] opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 4. DISCOVER SERVICES CLAY HUB */}
      {/* ════════════════════════════════════════════════════════════ */}
      <section id="services-section" className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Main Services Clay Card */}
          <div className="clay-card-static p-8 sm:p-10 border border-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-xs" />
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-900">
                    Master Service Directory
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#07132C] tracking-tight">
                  Discover Our Services
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-1">
                  Find and access verified healthcare, maternity products, fatherhood community, and vehicle transport.
                </p>
              </div>

              <button
                onClick={() => setSelectedCategory('all')}
                className="clay-pill px-4 py-2 text-xs font-extrabold text-[#0B1B3D] inline-flex items-center gap-1.5 self-start md:self-auto hover:scale-105"
              >
                <span>Browse All Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Deep Inset Clay Search Bar */}
            <div className="relative mb-8">
              <Search className="w-5 h-5 text-slate-500 absolute left-5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search services (e.g. diabetes, hypertension, cancer, baby products, logistics, insurance...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="clay-input w-full pl-14 pr-10 py-4 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category 3D Clay Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-none">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-xs font-extrabold whitespace-nowrap transition-all ${
                      isSelected ? 'clay-pill-active scale-105' : 'clay-pill text-slate-800 hover:text-[#0B1B3D]'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Filtered Services Clay Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
              {filteredServices.map((svc, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white shadow-[0_8px_18px_rgba(148,163,184,0.14),inset_2px_2px_4px_rgba(255,255,255,0.95),inset_-2px_-2px_4px_rgba(148,163,184,0.12)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_14px_24px_rgba(148,163,184,0.2)] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="relative h-7 w-24 bg-white rounded-lg px-2 py-0.5 flex items-center shadow-xs border border-slate-100">
                        <Image
                          src={svc.logoImage}
                          alt={svc.brandName}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {svc.brandName}
                      </span>
                    </div>

                    <h3 className="font-black text-sm text-[#07132C] mb-1.5 leading-snug">{svc.title}</h3>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">{svc.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Verified Ecosystem Service</span>
                    <a
                      href={svc.brandUrl}
                      target={svc.brandUrl.startsWith('http') ? '_blank' : undefined}
                      rel={svc.brandUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="clay-pill px-3 py-1.5 text-xs font-black text-[#0B1B3D] inline-flex items-center gap-1 hover:scale-105"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════ */}
          {/* 5. "CONNECTED FOR A STRONGER FAMILY" DEEP CLAY SLAB */}
          {/* ════════════════════════════════════════════════════════════ */}
          <div
            id="ecosystem-join"
            className="rounded-[36px] overflow-hidden relative shadow-[0_24px_50px_-15px_rgba(11,27,61,0.5),inset_2px_2px_5px_rgba(255,255,255,0.25),inset_-4px_-4px_10px_rgba(0,0,0,0.5)] border border-slate-700 bg-gradient-to-br from-[#122858] via-[#0B1B3D] to-[#07132C] text-white"
          >
            <div className="relative min-h-[320px] flex flex-col lg:flex-row items-center justify-between">
              {/* Background photo: sunset family silhouette */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
                  alt="Connected Family"
                  fill
                  className="object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1B3D] via-[#0B1B3D]/95 to-transparent" />
              </div>

              {/* Left Copy */}
              <div className="relative z-10 p-8 sm:p-14 lg:w-3/5">
                <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-black tracking-wider uppercase text-sky-300 border border-white/20 mb-4 shadow-sm">
                  Unified Family Account
                </span>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                  Connected for a stronger family
                </h3>
                <p className="text-slate-200 text-sm sm:text-base font-medium max-w-lg mb-8 leading-relaxed">
                  One account. Multiple benefits. A seamless experience across maternal supplies, fatherhood community, family chronic health, and logistics.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <a
                    href="https://wa.me/263772886467?text=Hi%20ParentaNova!%20I%20would%20like%20to%20join%20the%20ParentaNova%20Ecosystem%20and%20activate%20my%20unified%20family%20membership%20across%20Cloud%20Baby,%20Everyday%20Dad,%20Moviva,%20and%20Famba."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clay-btn-secondary px-8 py-4 text-xs font-black tracking-wide inline-flex items-center gap-2.5 group hover:scale-105 active:scale-95 bg-white text-[#0B1B3D]"
                  >
                    <span>💬 Join Our Ecosystem</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>

                  <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 bg-emerald-950/70 px-3.5 py-2 rounded-full border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Direct WhatsApp: +263 77 288 6467
                  </span>
                </div>
              </div>

              {/* Right Ecosystem Perks List */}
              <div className="relative z-10 p-8 sm:p-14 lg:w-2/5 flex flex-col gap-4 w-full">
                {[
                  { icon: ShoppingCart, text: 'Shop & Book Across Brands' },
                  { icon: Sparkles, text: 'Earn NovaRewards on Every Order' },
                  { icon: Shield, text: 'Access Exclusive Family Health Benefits' },
                  { icon: Users, text: 'Manage Your Family in One Place' },
                ].map((perk, idx) => {
                  const Icon = perk.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.3),0_6px_14px_rgba(0,0,0,0.25)]"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm font-extrabold tracking-wide text-white">{perk.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════ */}
          {/* 6. BOTTOM THREE CLAY SPOTLIGHT CARDS */}
          {/* ════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: For Businesses */}
            <div
              id="for-businesses"
              className="clay-card-static p-7 flex flex-col justify-between border border-white shadow-md"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block mb-2 bg-indigo-50 px-2.5 py-1 rounded-md w-fit">
                  — For Businesses
                </span>
                <h4 className="text-xl font-black text-[#07132C] mb-2 leading-snug">
                  Invest in your people&apos;s family wellbeing
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4">
                  Partner with ParentaNova for employee benefits, corporate chronic wellness care, and fleet transit support.
                </p>
                <a
                  href="https://wa.me/263772886467?text=Hi%20ParentaNova!%20We%20would%20like%20to%20partner%20with%20ParentaNova%20for%20our%20company's%20employee%20family%20benefits."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clay-pill px-4 py-2 text-xs font-black text-[#0B1B3D] inline-flex items-center gap-1.5 mb-4 hover:scale-105"
                >
                  <span>Partner With Us</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="relative h-44 rounded-2xl overflow-hidden mt-3 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.05)] border-2 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                  alt="Corporate Family Solutions"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Card 2: Our Vision */}
            <div className="clay-card-static p-7 flex flex-col justify-between border border-white shadow-md">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block mb-2 bg-emerald-50 px-2.5 py-1 rounded-md w-fit">
                  — Our Vision
                </span>
                <h4 className="text-xl font-black text-[#07132C] mb-2 leading-snug">
                  A future where every family thrives, everywhere.
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4">
                  Innovative solutions for modern families, today and tomorrow across maternal care, fatherhood, chronic health, and vehicle security.
                </p>
                <Link
                  href="/about"
                  className="clay-pill px-4 py-2 text-xs font-black text-[#0B1B3D] inline-flex items-center gap-1.5 mb-4 hover:scale-105"
                >
                  <span>About ParentaNova</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="relative h-44 rounded-2xl overflow-hidden mt-3 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.05)] border-2 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80"
                  alt="Family Vision"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Card 3: Stay Connected Newsletter */}
            <div className="clay-card-static bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-white p-7 flex flex-col justify-between border border-indigo-100 shadow-md">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center mb-4 shadow-[0_8px_16px_rgba(79,70,229,0.3),inset_2px_2px_4px_rgba(255,255,255,0.3)] border border-indigo-500">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-black text-[#07132C] mb-2">
                  Stay Connected
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium mb-6">
                  Get the latest ecosystem updates, subscriber offers, and family tips delivered straight to your inbox.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="space-y-3.5">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="clay-input w-full px-5 py-3.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="clay-btn-primary w-full py-3.5 text-xs font-black tracking-wide"
                >
                  Subscribe
                </button>
                {subscribed && (
                  <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5 mt-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" /> Thank you for subscribing to ParentaNova!
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 7. CLAY FOOTER WITH ALL 5 OFFICIAL LOGOS */}
      {/* ════════════════════════════════════════════════════════════ */}
      <footer className="bg-[#07132C] text-white pt-14 pb-10 border-t border-slate-800 mt-16 shadow-[inset_0_10px_20px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Top Row: ParentaNova + 4 Brand Logos */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
            {/* Left: ParentaNova Official Logo in Clean Capsule */}
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-48 bg-white/95 rounded-2xl px-3 py-1.5 flex items-center shadow-md border border-white">
                <Image
                  src="/ecosystem/logos/parentanova.png"
                  alt="ParentaNova - For Everyday family"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Right: 4 Official Brands Clickable Capsules */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {brands.map((b) => (
                <a
                  key={b.id}
                  href={b.url}
                  target={b.isExternal ? '_blank' : undefined}
                  rel={b.isExternal ? 'noopener noreferrer' : undefined}
                  className="bg-white/90 hover:bg-white px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:scale-105 transition-all group"
                  title={b.name}
                >
                  <div className="relative w-24 h-7">
                    <Image
                      src={b.logoImage}
                      alt={b.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Bottom Row: Links, Socials, Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-300 font-semibold">
            <div className="flex flex-wrap items-center gap-5 sm:gap-7">
              <Link href="/help" className="hover:text-white transition-colors">Help</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all"><Youtube className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all"><Instagram className="w-4 h-4" /></a>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              © {new Date().getFullYear()} ParentaNova. For Everyday family. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* 8. BRAND DETAILS 3D CLAY MODAL WITH OFFICIAL LOGO */}
      {/* ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeBrandModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="clay-card-static max-w-lg w-full p-8 shadow-2xl border-2 border-white relative overflow-hidden"
            >
              <button
                onClick={() => setActiveBrandModal(null)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-[inset_1px_1px_2px_rgba(255,255,255,1),inset_-1px_-1px_2px_rgba(148,163,184,0.2)] transition-all hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-10 w-36 bg-white rounded-xl px-2 py-1 flex items-center shadow-xs border border-slate-200">
                  <Image
                    src={activeBrandModal.logoImage}
                    alt={activeBrandModal.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${activeBrandModal.badgeClay}`}>
                  Ecosystem Pillar
                </span>
              </div>

              <p className="text-sm text-slate-800 mb-6 font-medium leading-relaxed">
                {activeBrandModal.description}
              </p>

              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                Key Offerings & Solutions
              </h4>
              <div className="space-y-3 mb-8">
                {activeBrandModal.services.map((svc, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/90 shadow-[inset_1px_1px_3px_rgba(255,255,255,1),inset_-1px_-1px_3px_rgba(148,163,184,0.1)] border border-slate-200/60">
                    <p className="font-black text-xs text-[#07132C]">{svc.name}</p>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">{svc.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                {activeBrandModal.isExternal ? (
                  <a
                    href={activeBrandModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="clay-btn-primary flex-1 py-3.5 px-5 text-xs font-black text-center tracking-wide flex items-center justify-center gap-2"
                  >
                    <span>Launch {activeBrandModal.name}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    href={activeBrandModal.url}
                    className="clay-btn-primary flex-1 py-3.5 px-5 text-xs font-black text-center tracking-wide flex items-center justify-center gap-2"
                  >
                    <span>Open {activeBrandModal.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                <button
                  onClick={() => setActiveBrandModal(null)}
                  className="clay-btn-secondary py-3.5 px-5 text-xs font-bold text-slate-700"
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
