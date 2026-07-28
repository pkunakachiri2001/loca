'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle } from 'lucide-react';

const perks = [
  'No setup fees or listing costs',
  'Reach 50,000+ active customers across Zimbabwe',
  'Accept bookings 24/7 automatically',
  '5% commission only on completed bookings',
];

export function CtaSection() {
  return (
    <section className="py-24 bg-white border-t border-slate-200">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E6F4F1] via-white to-emerald-50/50 border border-[#B2E3D8] shadow-lg p-10 md:p-16"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6 section-badge">
                <Building2 className="h-3.5 w-3.5" />
                For Transport Providers
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[#0B192C] mb-4 leading-tight">
                Ready to grow your
                <br />
                <span className="text-[#008767]">transport business?</span>
              </h2>
              <p className="mb-8 leading-relaxed text-slate-600 text-base font-medium">
                Join thousands of companies already using Famba to reach more customers,
                manage bookings, and grow their revenue — effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/company/register" className="btn-primary px-8 py-4 text-base shadow-md">
                  List Your Business Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/search" className="btn-secondary px-8 py-4 text-base">
                  Browse Services
                </Link>
              </div>
            </div>

            {/* Right: Perks */}
            <div className="space-y-4 bg-white/80 p-8 rounded-2xl border border-slate-200/80 shadow-sm backdrop-blur-sm">
              <h3 className="font-display font-bold text-lg text-[#0B192C] mb-4">Why Providers Choose Famba</h3>
              {perks.map((perk, i) => (
                <div key={perk} className="flex items-center gap-3 text-slate-700 font-semibold text-sm">
                  <div className="w-6 h-6 rounded-full bg-[#E6F4F1] text-[#008767] flex items-center justify-center shrink-0">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
