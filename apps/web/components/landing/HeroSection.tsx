'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, ArrowRight, Shield, Star, Zap, Car, Bus, Cog, Wrench, User,
  Package, ShoppingBag, Utensils, Headphones, Clock, ArrowUpRight, CheckCircle2,
  Send, Bot, Sparkles, RotateCcw, ChevronLeft, Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';

const CATEGORY_TABS = [
  { label: 'Car Rental', value: 'CAR_RENTAL', icon: Car },
  { label: 'Bus Hire', value: 'BUS_RENTAL', icon: Bus },
  { label: 'Spare Parts', value: 'DRIVER', icon: Cog },
  { label: 'Workshops', value: 'MECHANIC', icon: Wrench },
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

  // Interactive Hero Mobile Phone AI Copilot (Groq-Powered)
  const [heroInput, setHeroInput] = useState('');
  const [heroLoading, setHeroLoading] = useState(false);
  const [showChatView, setShowChatView] = useState(false);
  const [heroMessages, setHeroMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showChatView) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [heroMessages, heroLoading, showChatView]);

  const handleHeroSubmit = async (queryText?: string) => {
    const textToSend = (queryText || heroInput).trim();
    if (!textToSend || heroLoading) return;

    setShowChatView(true);
    setHeroInput('');
    setHeroLoading(true);

    const updated = [...heroMessages, { sender: 'user' as const, text: textToSend }];
    setHeroMessages(updated);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: updated.slice(-8),
        }),
      });

      const data = await res.json();
      const reply = res.ok ? data.reply : (data.error || 'Sorry, I could not retrieve an answer right now.');
      setHeroMessages((prev) => [...prev, { sender: 'bot' as const, text: reply }]);
    } catch {
      setHeroMessages((prev) => [
        ...prev,
        { sender: 'bot' as const, text: 'Network connection issue. Please try asking again shortly.' },
      ]);
    } finally {
      setHeroLoading(false);
    }
  };

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
              <div className="bg-white rounded-[32px] p-5 shadow-2xl border-4 border-slate-900/10 text-slate-900">
                {!showChatView ? (
                  <div className="space-y-3.5">
                    {/* Status bar header */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                      <div className="flex items-center gap-1.5">
                        <span>9:41</span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-[#008767] border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#008767] animate-pulse" />
                          Groq AI Live
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-900" />
                        <span className="w-2 h-2 rounded-full bg-slate-900" />
                      </div>
                    </div>

                    {/* User Greeting */}
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                          <span>Hello, Tapiwa</span>
                          <span className="text-[10px] text-[#008767] bg-[#E6F4F1] px-1.5 py-0.5 rounded-full font-bold">Harare, ZW</span>
                        </p>
                        <p className="text-base font-extrabold text-[#0B192C]">Where to today?</p>
                      </div>
                      <div className="relative">
                        <img
                          src="/avatars/tapiwa.jpg"
                          alt="Tapiwa"
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#008767]"
                          onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#008767] border-2 border-white rounded-full ring-2 ring-emerald-400/50" />
                      </div>
                    </div>

                    {/* Interactive Search / Ask Input */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleHeroSubmit();
                      }}
                      className="relative"
                    >
                      <input
                        type="text"
                        value={heroInput}
                        onChange={(e) => setHeroInput(e.target.value)}
                        placeholder="Ask anything about Famba services..."
                        className="w-full bg-slate-100/90 border border-slate-200 hover:border-[#008767]/50 focus:border-[#008767] rounded-xl py-3 pl-4 pr-10 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all shadow-inner"
                      />
                      <button
                        type="submit"
                        disabled={!heroInput.trim() || heroLoading}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#008767] hover:bg-[#007358] disabled:opacity-50 rounded-lg flex items-center justify-center text-white transition-all shadow-sm"
                        title="Ask Tapiwa AI"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </form>

                    {/* Service Icons Grid with direct Groq AI prompts */}
                    <div className="grid grid-cols-4 gap-2 text-center pt-1">
                      <button
                        type="button"
                        onClick={() => handleHeroSubmit('What car rental and bus hire options are available on Famba?')}
                        className="bg-[#E6F4F1] hover:bg-[#d5eee8] p-2.5 rounded-2xl border border-[#B2E3D8] flex flex-col items-center transition-all group cursor-pointer"
                      >
                        <Car className="h-4 w-4 text-[#008767] mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-[#008767]">Transport</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHeroSubmit('How does Famba vetted School Run shuttle work for kids in Harare & Bulawayo?')}
                        className="bg-blue-50 hover:bg-blue-100 p-2.5 rounded-2xl border border-blue-100 flex flex-col items-center transition-all group cursor-pointer"
                      >
                        <Shield className="h-4 w-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-blue-700">School Run</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHeroSubmit('Where are verified mechanics and auto spare parts available in Zimbabwe?')}
                        className="bg-amber-50 hover:bg-amber-100 p-2.5 rounded-2xl border border-amber-100 flex flex-col items-center transition-all group cursor-pointer"
                      >
                        <Wrench className="h-4 w-4 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-amber-700">Workshops</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHeroSubmit('How do I get an AI vehicle valuation certificate with QR code verification on Famba?')}
                        className="bg-purple-50 hover:bg-purple-100 p-2.5 rounded-2xl border border-purple-100 flex flex-col items-center transition-all group cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-purple-700">Valuation</span>
                      </button>
                    </div>

                    {/* Quick Highlights / Direct Questions */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#0B192C] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#008767]" /> Platform Copilot
                        </span>
                        <span
                          className="text-[#008767] font-semibold text-[11px] cursor-pointer hover:underline"
                          onClick={() => setShowChatView(true)}
                        >
                          Open Chat
                        </span>
                      </div>
                      <div
                        onClick={() => handleHeroSubmit('What payment methods are supported on Famba? Can I pay with EcoCash and USD cash?')}
                        className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 cursor-pointer p-2.5 rounded-xl border border-slate-100 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#008767] flex items-center justify-center font-bold text-[11px]">
                            $
                          </div>
                          <div>
                            <p className="font-bold text-[#0B192C] text-[11px]">EcoCash & USD Payments</p>
                            <p className="text-[9px] text-slate-400">Paynow, Zipit, OneMoney & Cash</p>
                          </div>
                        </div>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                      </div>
                      <div
                        onClick={() => handleHeroSubmit('How do transport companies and mechanics register on Famba?')}
                        className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 cursor-pointer p-2.5 rounded-xl border border-slate-100 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Zap className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="font-bold text-[#0B192C] text-[11px]">Vendor Registration</p>
                            <p className="text-[9px] text-slate-400">List fleets, spare parts & workshops</p>
                          </div>
                        </div>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Active Groq Chat View */
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowChatView(false)}
                        className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Back</span>
                      </button>
                      <div className="flex items-center gap-1.5 font-bold text-[#0B192C]">
                        <span className="w-2 h-2 rounded-full bg-[#008767] animate-pulse" />
                        <span>Tapiwa • Famba AI</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setHeroMessages([]);
                          setShowChatView(false);
                        }}
                        title="Clear & Reset"
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Message stream */}
                    <div className="h-[230px] overflow-y-auto pr-1 space-y-2 text-xs">
                      {heroMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-400">
                          <Bot className="h-7 w-7 text-[#008767] mb-2 animate-bounce" />
                          <p className="font-semibold text-slate-700">Ask Tapiwa about Famba</p>
                          <p className="text-[11px] mt-1 text-slate-500">I know every detail about car rentals, school runs, spare parts, valuation, and payments.</p>
                        </div>
                      ) : (
                        heroMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex gap-1.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {msg.sender === 'bot' && (
                              <div className="w-5 h-5 rounded-full bg-[#008767] text-white flex-shrink-0 flex items-center justify-center mt-0.5">
                                <Bot className="h-3 w-3" />
                              </div>
                            )}
                            <div
                              className={`max-w-[85%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed shadow-sm ${
                                msg.sender === 'user'
                                  ? 'bg-[#008767] text-white rounded-br-none'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-none whitespace-pre-wrap'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))
                      )}

                      {heroLoading && (
                        <div className="flex gap-1.5 justify-start items-center">
                          <div className="w-5 h-5 rounded-full bg-[#008767] text-white flex-shrink-0 flex items-center justify-center">
                            <Bot className="h-3 w-3" />
                          </div>
                          <div className="bg-slate-100 border border-slate-200/80 px-3 py-2 rounded-2xl rounded-bl-none flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Loader2 className="h-3 w-3 animate-spin text-[#008767]" />
                            <span>Tapiwa is consulting Groq...</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input Bar */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleHeroSubmit();
                      }}
                      className="relative pt-1"
                    >
                      <input
                        type="text"
                        value={heroInput}
                        onChange={(e) => setHeroInput(e.target.value)}
                        placeholder="Ask follow-up about Famba..."
                        disabled={heroLoading}
                        className="w-full bg-slate-100/90 border border-slate-200 focus:border-[#008767] rounded-xl py-2.5 pl-3 pr-9 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all shadow-inner"
                      />
                      <button
                        type="submit"
                        disabled={!heroInput.trim() || heroLoading}
                        className="absolute right-1 top-2 w-7 h-7 bg-[#008767] hover:bg-[#007358] disabled:opacity-50 rounded-lg flex items-center justify-center text-white transition-all shadow-sm"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Floating User Person Silhouette overlay */}
              <div className="absolute -bottom-6 -right-6 hidden sm:block pointer-events-none">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-emerald-700">
                  <img
                    src="/avatars/hero-user.jpg"
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
