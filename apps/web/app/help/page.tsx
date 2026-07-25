'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0E0E10' }}>
      <Navbar />
      <div className="section-container pt-32 pb-20 max-w-4xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-white mb-4">Help & Support Center</h1>
        <p className="text-xs mb-8" style={{ color: '#E8A547' }}>KUNAKA TECH Support</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-3">
            <h3 className="font-bold text-white">How do I book a vehicle?</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#9A9A9E' }}>Use our search bar to find available rentals, select your dates, and confirm your booking securely online.</p>
          </div>
          <div className="card p-6 space-y-3">
            <h3 className="font-bold text-white">Need Support?</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#9A9A9E' }}>Contact Locardia Munyuki at <a href="mailto:HRmanager@kunakatech.tech" className="underline text-amber-400">HRmanager@kunakatech.tech</a> or call +91 7796787966.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
