'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function CancellationPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0E0E10' }}>
      <Navbar />
      <div className="section-container pt-32 pb-20 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-white mb-4">Cancellation Policy</h1>
        <p className="text-xs mb-8" style={{ color: '#E8A547' }}>KUNAKA TECH Guidelines</p>
        
        <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#9A9A9E' }}>
          <section className="card p-6 space-y-2">
            <h2 className="font-bold text-white text-base">Flexible Cancellation</h2>
            <p>Customers can cancel bookings up to 24 hours prior to the scheduled pickup time for a 100% full refund.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
