'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Building2, User, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0E0E10' }}>
      <Navbar />

      <section className="relative pt-32 pb-24">
        <div className="section-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-badge mb-4">Contact KUNAKA TECH</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4" style={{ color: '#F5F0E8' }}>Get in Touch</h1>
            <p style={{ color: '#9A9A9E' }}>Have questions about FleetNest services or partnerships? Contact the KUNAKA TECH team.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Contact Details Card */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card p-8 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: '#E8A547' }}>Parent Organization</span>
                <h3 className="font-display text-2xl font-bold" style={{ color: '#F5F0E8' }}>KUNAKA TECH</h3>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(232,165,71,0.12)', border: '1px solid rgba(232,165,71,0.25)' }}>
                    <User className="h-5 w-5" style={{ color: '#E8A547' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#6B6B72' }}>Contact Person</p>
                    <p className="font-semibold text-sm" style={{ color: '#F5F0E8' }}>Locardia Munyuki</p>
                    <p className="text-xs" style={{ color: '#E8A547' }}>HR Manager</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(232,165,71,0.12)', border: '1px solid rgba(232,165,71,0.25)' }}>
                    <Mail className="h-5 w-5" style={{ color: '#E8A547' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#6B6B72' }}>Email Address</p>
                    <a href="mailto:HRmanager@kunakatech.tech" className="font-semibold text-sm hover:underline" style={{ color: '#F5F0E8' }}>
                      HRmanager@kunakatech.tech
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(232,165,71,0.12)', border: '1px solid rgba(232,165,71,0.25)' }}>
                    <Phone className="h-5 w-5" style={{ color: '#E8A547' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#6B6B72' }}>Direct Phone</p>
                    <a href="tel:+917796787966" className="font-semibold text-sm hover:underline" style={{ color: '#F5F0E8' }}>
                      +91 7796787966
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Message Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2 card p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3" style={{ color: '#34D399' }} />
                  <h3 className="font-display text-2xl font-bold mb-2" style={{ color: '#F5F0E8' }}>Message Received!</h3>
                  <p style={{ color: '#9A9A9E' }}>Thank you for contacting KUNAKA TECH. Locardia Munyuki will reach out to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Your Name</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-dark" placeholder="John Doe" required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Your Email</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-dark" placeholder="john@example.com" required />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Subject</label>
                    <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-dark" placeholder="Inquiry regarding transport partnership" required />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Message</label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="input-dark resize-none h-32" placeholder="Write your message here..." required />
                  </div>

                  <button type="submit" className="btn-primary py-3.5 px-8 text-sm">
                    <Send className="h-4 w-4" /> Send Message to KUNAKA TECH
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
