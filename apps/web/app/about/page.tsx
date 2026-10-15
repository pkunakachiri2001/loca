'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe, Award, Cpu, Code2, LineChart, Building2, Sparkles, CheckCircle2 } from 'lucide-react';

const stats = [
  { value: '50K+', label: 'Trips & Services Completed' },
  { value: '2,400+', label: 'Verified Zimbabwean Vehicles' },
  { value: '10', label: 'Provinces Covered in Zimbabwe' },
  { value: '4.9★', label: 'Customer Satisfaction Score' },
];

const pillars = [
  {
    icon: Code2,
    title: 'Mobility Engineering',
    lead: 'KUNAKA TECH Core Lab',
    desc: 'High-concurrency booking APIs, real-time vehicle GPS telemetry, and distributed cloud microservices built for African network conditions.',
  },
  {
    icon: Cpu,
    title: 'Automotive Valuation Engine',
    lead: 'KUNAKA TECH Data Science',
    desc: 'Independent Zimbabwean vehicle valuation algorithms factoring in ZIMRA duty surtaxes, mileage, local parts availability, and currency dynamics.',
  },
  {
    icon: LineChart,
    title: 'Fleet & Partner Operations',
    lead: 'KUNAKA TECH Field Ops',
    desc: 'Rigorous vetting of Zimbabwean rental companies, bus operators, workshops, and parts vendors to guarantee safety and verified pricing.',
  },
];

const values = [
  { icon: Shield, title: 'Trust First', desc: 'Every provider is verified, every vehicle inspected. We stake our reputation on each booking and valuation report.' },
  { icon: Zap, title: 'Speed Matters', desc: 'Book or value a vehicle in under 60 seconds. Instant digital certificates and real-time status updates.' },
  { icon: Globe, title: 'Zimbabwean Ground Truth', desc: 'Built specifically for Harare, Bulawayo, Mutare, and cross-country routes. Our pricing, logistics, and data reflect local realities.' },
  { icon: Award, title: 'Institutional Standards', desc: 'Enterprise-grade transparency trusted by insurers, financial institutions, and everyday motorists across Zimbabwe.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 pb-20 overflow-hidden bg-gradient-to-b from-[#E6F4F1]/60 via-[#FAFCFB] to-[#FAFCFB]">
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Our Vision & Story</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-[#0B192C] mb-6 leading-tight">
              Reinventing how Zimbabwe{' '}
              <span className="text-[#008767]">moves & values</span> mobility
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl">
              Famba was engineered to solve Zimbabwe&apos;s transportation and automotive verification challenges. 
              From transparent vehicle rentals and live tracking to defensible market valuations, we built 
              the all-in-one platform the country deserves.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/search"
                className="px-6 py-3 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-sm shadow-md shadow-[#008767]/20 flex items-center gap-2 transition"
              >
                Browse Services <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/valuation"
                className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#0B192C] font-bold text-sm border border-slate-300 shadow-sm transition"
              >
                Vehicle Valuation Engine
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Photo / Statement */}
      <section className="pb-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden shadow-xl"
            style={{ height: 440 }}
          >
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=600&fit=crop"
              alt="Zimbabwe transportation network"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B192C]/90 via-[#0B192C]/60 to-transparent flex items-center px-8 sm:px-16">
              <div className="max-w-xl text-white">
                <p className="font-display text-2xl sm:text-4xl font-extrabold leading-snug mb-4">
                  &ldquo;We move people and empower trust, not just vehicles.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#008767] flex items-center justify-center font-bold text-white text-sm">
                    KT
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">KUNAKA TECH</p>
                    <p className="text-xs text-emerald-300">Technology & Innovation Partner</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#008767] mb-2">{stat.value}</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="section-container">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008767] bg-[#E6F4F1] px-3 py-1 rounded-full border border-[#B2E3D8]">
              Core Principles
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B192C] mt-3">
              What We Stand For
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:border-[#008767] hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] flex items-center justify-center mb-5 text-[#008767]">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#0B192C] mb-2">{v.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Powered by KUNAKA TECH Section (Replaces personal names) */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="section-container">
          <div className="mb-14 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#008767] bg-[#E6F4F1] px-3 py-1 rounded-full border border-[#B2E3D8]">
              Technology & Execution
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0B192C] mt-3">
              Powered by KUNAKA TECH
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3">
              Famba is designed, developed, and maintained by KUNAKA TECH — building resilient, scalable technology infrastructure for Zimbabwe and southern Africa.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#FAFCFB] rounded-2xl p-7 border border-slate-200 shadow-sm hover:border-[#008767] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mb-5">
                    <pillar.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#008767]">
                    {pillar.lead}
                  </span>
                  <h3 className="font-display text-lg font-bold text-[#0B192C] mt-1 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200/80 flex items-center gap-2 text-xs font-bold text-[#008767]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>KUNAKA TECH Verified Engine</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#008767] to-[#0B192C] text-white">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-4">
              Ready to Experience Better Mobility?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 mb-8 leading-relaxed">
              Join thousands of customers and verified providers across Zimbabwe moving with confidence.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-3.5 rounded-xl bg-white text-[#008767] hover:bg-emerald-50 font-extrabold text-sm shadow-lg transition"
              >
                Create Free Account
              </Link>
              <Link
                href="/search"
                className="px-8 py-3.5 rounded-xl bg-[#008767]/40 hover:bg-[#008767]/60 text-white font-bold text-sm border border-emerald-400/30 transition"
              >
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
