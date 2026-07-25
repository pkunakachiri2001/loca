'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function SafetyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0E0E10' }}>
      <Navbar />
      <div className="section-container pt-32 pb-20 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-white mb-4">Safety & Verification</h1>
        <p className="text-xs mb-8" style={{ color: '#E8A547' }}>KUNAKA TECH Trust & Safety</p>
        
        <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#9A9A9E' }}>
          <section className="card p-6 space-y-2">
            <h2 className="font-bold text-white text-base">Verified Providers</h2>
            <p>Every transport provider registered on FleetNest undergoes a rigorous 3-step verification process including business registration and identity checks.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
