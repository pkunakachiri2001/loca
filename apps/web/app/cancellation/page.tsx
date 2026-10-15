'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RotateCcw, Clock, CheckCircle2 } from 'lucide-react';

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
      <Navbar />
      <div className="section-container pt-36 pb-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider mb-4">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refunds & Cancellations</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#0B192C] mb-3">
          Cancellation Policy
        </h1>
        <p className="text-xs font-bold text-slate-500 mb-8">
          Famba Guidelines | Powered by <span className="text-[#008767]">KUNAKA TECH</span>
        </p>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-[#0B192C] text-lg">1. 24-Hour Free Cancellation</h2>
            <p>
              Customers can cancel any confirmed vehicle rental or bus charter booking free of charge up to 24 hours prior to the scheduled pickup time for a 100% full refund to their original payment method.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-[#0B192C] text-lg">2. Late Cancellations & No-Shows</h2>
            <p>
              Cancellations made within 24 hours of scheduled dispatch may be subject to a one-day rental fee or administrative deposit retention as compensation to the transport provider who reserved the vehicle.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-[#0B192C] text-lg">3. Provider Cancellation Guarantee</h2>
            <p>
              In the rare event that a verified provider cancels your confirmed reservation, Famba will immediately source an equal or upgraded replacement vehicle at no extra charge or issue an immediate full refund.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
