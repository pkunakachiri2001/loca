'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0E0E10' }}>
      <Navbar />
      <div className="section-container pt-32 pb-20 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-xs mb-8" style={{ color: '#E8A547' }}>Last Updated: July 2026 | KUNAKA TECH</p>
        
        <div className="space-y-6 text-sm leading-relaxed" style={{ color: '#9A9A9E' }}>
          <section className="card p-6 space-y-2">
            <h2 className="font-bold text-white text-base">1. Information We Collect</h2>
            <p>KUNAKA TECH respects your privacy. We collect personal information such as name, email address, phone number, and location data to facilitate bookings and improve platform services.</p>
          </section>
          
          <section className="card p-6 space-y-2">
            <h2 className="font-bold text-white text-base">2. Data Security</h2>
            <p>We implement end-to-end 256-bit SSL encryption and strict access controls to safeguard your data against unauthorized access or disclosure.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
