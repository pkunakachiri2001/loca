'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Building2, Mail, Phone, MapPin, Send, CheckCircle, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
      <Navbar />

      <section className="relative pt-36 pb-24">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Contact KUNAKA TECH</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-4 text-[#0B192C]">
              Get in Touch
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Have questions regarding Famba transport bookings, fleet partnerships, or vehicle valuations? Reach out to the KUNAKA TECH team.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Contact Details Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block mb-1 text-[#008767]">
                  Parent Organization
                </span>
                <h3 className="font-display text-2xl font-extrabold text-[#0B192C]">KUNAKA TECH</h3>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Department</p>
                    <p className="font-bold text-sm text-[#0B192C]">KUNAKA TECH</p>
                    <p className="text-xs text-[#008767]">Support & Operations Desk</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Email Address</p>
                    <a href="mailto:HRmanager@kunakatech.tech" className="font-bold text-sm text-[#0B192C] hover:text-[#008767] transition-colors">
                      HRmanager@kunakatech.tech
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Direct Phone</p>
                    <a href="tel:+917796787966" className="font-bold text-sm text-[#0B192C] hover:text-[#008767] transition-colors">
                      +91 7796787966
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Message Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
            >
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-[#008767]" />
                  <h3 className="font-display text-2xl font-bold mb-2 text-[#0B192C]">Message Received!</h3>
                  <p className="text-sm text-slate-600">
                    Thank you for contacting KUNAKA TECH. Our team will reach out to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Your Name</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                        placeholder="e.g. John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Email Address</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Subject</label>
                    <input
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                      placeholder="e.g. Corporate fleet partnership inquiry"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Message</label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                      placeholder="How can KUNAKA TECH assist you?"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" /> Send Message
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
