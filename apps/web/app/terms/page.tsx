'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
      <Navbar />
      <div className="section-container pt-36 pb-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider mb-4">
          <FileText className="w-3.5 h-3.5" />
          <span>Legal Agreement</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#0B192C] mb-3">
          Terms of Service
        </h1>
        <p className="text-xs font-bold text-slate-500 mb-8">
          Last Updated: 2026 | Powered by <span className="text-[#008767]">KUNAKA TECH</span>
        </p>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-[#0B192C] text-lg">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Famba platform operated by KUNAKA TECH in Zimbabwe, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-[#0B192C] text-lg">2. Zimbabwe Mobility & Marketplace Services</h2>
            <p>
              Famba provides an all-in-one verified marketplace connecting users with vehicle rentals, passenger coaches, spare parts suppliers, certified workshops, and valuation tools across Zimbabwe. All bookings and valuations are subject to provider confirmation and vehicle availability.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-[#0B192C] text-lg">3. Pricing & Currency</h2>
            <p>
              All rates, sum-insured figures, and service fees on Famba are denominated in United States Dollars (USD) as standard for Zimbabwe cross-border and corporate travel. Local payment methods including EcoCash, Zipit, and USD Cash on Handover are accommodated per provider agreement.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-[#0B192C] text-lg">4. Cancellations & Guarantees</h2>
            <p>
              Bookings cancelled more than 24 hours prior to the scheduled service start time are eligible for a 100% full refund in accordance with the Famba Zimbabwe Cancellation Policy.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
