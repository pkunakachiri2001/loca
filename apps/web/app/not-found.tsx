'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, Car } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAFCFB] text-[#0B192C]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg mx-auto relative z-10 py-12"
      >
        {/* 404 big badge */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 rounded-3xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mx-auto shadow-sm">
            <Car className="w-10 h-10" />
          </div>
        </div>

        <span className="text-sm font-extrabold text-[#008767] uppercase tracking-widest bg-[#E6F4F1] px-4 py-1.5 rounded-full border border-[#B2E3D8]">
          Error 404
        </span>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold mt-4 mb-3 text-[#0B192C]">
          Page Not Found
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mb-8 leading-relaxed max-w-md mx-auto">
          The page you are looking for does not exist or may have been relocated. Let&apos;s get you back on the road.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link
            href="/search"
            className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-300 shadow-sm transition flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            Browse Services
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
