'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
      <Navbar />
      <div className="section-container pt-36 pb-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider mb-4">
          <Lock className="w-3.5 h-3.5" />
          <span>Data Privacy</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#0B192C] mb-3">
          Privacy Policy
        </h1>
        <p className="text-xs font-bold text-slate-500 mb-8">
          Last Updated: 2026 | Powered by <span className="text-[#008767]">KUNAKA TECH</span>
        </p>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-[#0B192C] text-lg">1. Information We Collect</h2>
            <p>
              KUNAKA TECH respects your privacy. When using Famba, we collect personal information such as your name, email, phone number, vehicle details, and GPS telemetry (when using live tracking) solely to facilitate bookings, insurance validation, and dispatch services.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-[#0B192C] text-lg">2. Data Security & Storage</h2>
            <p>
              We implement end-to-end 256-bit SSL encryption, database isolation, and tokenized session authentication to safeguard your personal information and financial records against unauthorized access.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <h2 className="font-display font-bold text-[#0B192C] text-lg">3. Third-Party Integrations</h2>
            <p>
              Information is only shared with verified transport providers, insurance underwriters (such as Zimnat), and payment processors necessary to execute your requested service. We never sell your personal data.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
