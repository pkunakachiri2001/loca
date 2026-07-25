'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0E0E10' }}>
      <Navbar />
      <div className="section-container pt-32 pb-20 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-xs mb-8" style={{ color: '#E8A547' }}>Last Updated: July 2026 | KUNAKA TECH</p>
        
        <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#9A9A9E' }}>
          <section className="card p-6 space-y-2">
            <h2 className="font-bold text-white text-base">1. Acceptance of Terms</h2>
            <p>By using the FleetNest platform operated by KUNAKA TECH, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>
          
          <section className="card p-6 space-y-2">
            <h2 className="font-bold text-white text-base">2. Service Usage & Bookings</h2>
            <p>FleetNest provides a marketplace connecting customers with verified vehicle rental, driver, mechanic, and car wash service providers. All bookings are subject to availability and provider confirmation.</p>
          </section>

          <section className="card p-6 space-y-2">
            <h2 className="font-bold text-white text-base">3. Payments & Cancellations</h2>
            <p>Payments are processed securely. Cancellations made 24 hours prior to the scheduled service start time are eligible for full refunds in accordance with our Cancellation Policy.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
