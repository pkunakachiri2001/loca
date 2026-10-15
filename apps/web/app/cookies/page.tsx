'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Cookie } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
      <Navbar />
      <div className="section-container pt-36 pb-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider mb-4">
          <Cookie className="w-3.5 h-3.5" />
          <span>Cookies & Tracking</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#0B192C] mb-3">
          Cookie Policy
        </h1>
        <p className="text-xs font-bold text-slate-500 mb-8">
          Last Updated: 2026 | Powered by <span className="text-[#008767]">KUNAKA TECH</span>
        </p>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-[#0B192C] text-lg">How We Use Cookies</h2>
            <p>
              Famba uses essential cookies to authenticate your user session, remember vehicle search filters, and store session tokens securely. We do not use third-party invasive advertising trackers.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-[#0B192C] text-lg">Managing Your Preferences</h2>
            <p>
              You can configure your browser to decline non-essential cookies at any time. Essential cookies are required to process vehicle valuations, booking reservations, and dashboard access.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
