'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, CheckCircle2, UserCheck, Car, PhoneCall } from 'lucide-react';

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
      <Navbar />
      <div className="section-container pt-36 pb-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Trust & Safety</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#0B192C] mb-3">
          Safety & Verification
        </h1>
        <p className="text-xs font-bold text-slate-500 mb-8">
          Famba Security Protocol | Powered by <span className="text-[#008767]">KUNAKA TECH</span>
        </p>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] text-[#008767] flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-[#0B192C] text-lg">1. Verified Zimbabwean Providers</h2>
            </div>
            <p>
              Every transport provider, bus charter company, and workshop listed on Famba undergoes a mandatory 3-step verification process, including valid business registration, identity checks, and operational depot audits across Zimbabwe.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] text-[#008767] flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-[#0B192C] text-lg">2. Vehicle Roadworthiness & Insurance</h2>
            </div>
            <p>
              Listed vehicles must present valid road fitness documentation and active passenger liability or comprehensive insurance (underwritten by institutional partners like Zimnat) prior to being approved for public hire.
            </p>
          </section>

          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#E6F4F1] text-[#008767] flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-[#0B192C] text-lg">3. 24/7 Roadside Assistance</h2>
            </div>
            <p>
              In the event of an emergency or unexpected breakdown on highways between Harare, Bulawayo, Mutare, or Victoria Falls, Famba emergency roadside coordination is available 24/7.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
