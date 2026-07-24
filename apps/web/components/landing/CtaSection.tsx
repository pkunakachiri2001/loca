'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle } from 'lucide-react';
import { BackgroundVideo } from '@/components/ui/BackgroundVideo';

const perks = [
  'No setup fees or listing costs',
  'Reach 50,000+ active customers',
  'Accept bookings 24/7 automatically',
  '5% commission only on completed bookings',
];

export function CtaSection() {
  return (
    <section className="py-24" style={{ borderTop: '1px solid #1E1E22' }}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: 'linear-gradient(145deg, rgba(26,26,28,0.85) 0%, rgba(18,18,20,0.92) 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >

          {/* Content */}
          <div className="relative z-20 p-12 md:p-16 grid md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6 section-badge">
                <Building2 className="h-3.5 w-3.5" />
                For Transport Providers
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ color: '#F5F0E8' }}>
                Ready to grow your
                <br />
                <span className="gradient-text">transport business?</span>
              </h2>
              <p className="mb-8 leading-relaxed" style={{ color: '#9A9A9E', fontSize: 16 }}>
                Join thousands of companies already using FleetNest to reach more customers,
                manage bookings, and grow their revenue — effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/company/register" className="btn-primary px-8 py-3.5 text-base">
                  List Your Business Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/search" className="btn-secondary px-8 py-3.5 text-base">
                  Browse Services
                </Link>
              </div>
            </div>

            {/* Right: Perks */}
            <div className="space-y-4">
              {perks.map((perk, i) => (
                <motion.div
                  key={perk}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(26,26,28,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(232,165,71,0.15)', border: '1px solid rgba(232,165,71,0.3)' }}>
                    <CheckCircle className="h-4 w-4" style={{ color: '#E8A547' }} />
                  </div>
                  <span style={{ color: '#F5F0E8', fontSize: 14 }}>{perk}</span>
                </motion.div>
              ))}
              <p className="text-xs pt-2" style={{ color: '#6B6B72' }}>
                Approval in 48–72 hours · No contract required
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
