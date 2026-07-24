'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0E0E10' }}>
      {/* Background texture */}
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(232,165,71,0.06) 0%, transparent 70%)'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg mx-auto relative z-10"
      >
        {/* 404 big number */}
        <div className="mb-8 relative">
          <span
            className="block font-display font-bold leading-none select-none"
            style={{
              fontSize: 'clamp(120px, 20vw, 180px)',
              color: 'transparent',
              WebkitTextStroke: '1px rgba(232,165,71,0.2)',
            }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(232,165,71,0.1)', border: '1px solid rgba(232,165,71,0.25)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8A547" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold mb-3" style={{ color: '#F5F0E8' }}>
          Page Not Found
        </h1>
        <p className="text-base mb-10" style={{ color: '#6B6B72', lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back on the road.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary px-8 py-3">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link href="/search" className="btn-secondary px-8 py-3">
            <Search className="h-4 w-4" />
            Browse Services
          </Link>
        </div>

        {/* Subtle decoration */}
        <div className="mt-16 flex items-center justify-center gap-2">
          <div style={{ width: 32, height: 1, background: '#2E2E34' }} />
          <span style={{ color: '#3A3A3E', fontSize: 12 }}>FleetNest</span>
          <div style={{ width: 32, height: 1, background: '#2E2E34' }} />
        </div>
      </motion.div>
    </div>
  );
}
