'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HelpCircle, Phone, Mail, MessageCircle, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
      <Navbar />
      <div className="section-container pt-36 pb-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Support Center</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#0B192C] mb-3">
          Help & Support Center
        </h1>
        <p className="text-xs font-bold text-slate-500 mb-8">
          Customer & Partner Support | Powered by <span className="text-[#008767]">KUNAKA TECH</span>
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-display font-bold text-base text-[#0B192C]">How do I book a vehicle?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse our <Link href="/search" className="text-[#008767] font-bold hover:underline">Services page</Link>, filter by city (Harare, Bulawayo, etc.) and category, select your dates, and click &ldquo;Request to Book&rdquo; or inquire directly via WhatsApp.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-display font-bold text-base text-[#0B192C]">How does vehicle valuation work?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use our <Link href="/valuation" className="text-[#008767] font-bold hover:underline">Vehicle Valuation Platform</Link> to generate an independent ZIMRA-benchmarked digital certificate for insurance, financing, or private sale.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-display font-bold text-base text-[#0B192C]">What payment methods are supported?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Famba providers accept USD Cash on Handover/Collection, EcoCash, Zipit bank transfers, and international cards.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-display font-bold text-base text-[#0B192C]">Contact KUNAKA TECH Support</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Email our support desk at{' '}
              <a href="mailto:HRmanager@kunakatech.tech" className="text-[#008767] font-bold hover:underline">
                HRmanager@kunakatech.tech
              </a>{' '}
              or reach direct phone support at{' '}
              <a href="tel:+917796787966" className="text-[#008767] font-bold hover:underline">
                +91 7796787966
              </a>.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#008767] to-[#0B192C] text-white rounded-3xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-xl font-bold mb-1">Still need personalized assistance?</h3>
            <p className="text-xs text-emerald-100">Our team is available 24/7 to resolve dispatch or booking queries.</p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl bg-white text-[#008767] hover:bg-emerald-50 font-extrabold text-xs shrink-0 shadow-md transition"
          >
            Contact Desk
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
