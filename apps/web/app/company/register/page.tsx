'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Building2, MapPin, Globe, Phone, FileText, ChevronRight, CheckCircle, Loader2, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';

const CATEGORIES = [
  { value: 'CAR_RENTAL', label: 'Car Rental' },
  { value: 'BUS_RENTAL', label: 'Bus / Minibus Charter' },
  { value: 'DRIVER', label: 'Spare Parts' },
  { value: 'MECHANIC', label: 'Workshops & Repairs' },
  { value: 'CAR_WASH', label: 'Car Wash & Detailing' },
  { value: 'VEHICLE_DEALER', label: 'Vehicle Dealership' },
  { value: 'COURIER', label: 'Courier & Freight' },
  { value: 'EMERGENCY_ROADSIDE', label: 'Emergency / Roadside Towing' },
];

const steps = ['Business Info', 'Contact & Location', 'Documents', 'Done'];

export default function CompanyRegisterPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    email: user?.email || '',
    phone: '',
    website: '',
    address: '',
    city: 'Harare',
    state: 'Harare Metropolitan',
    country: 'Zimbabwe',
    registrationNumber: '',
    taxId: '',
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/company/register');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/companies', form);
      setStep(3);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0B192C]">
      <Navbar />

      <div className="pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-4">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>For Fleet & Auto Providers</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold mb-3 text-[#0B192C]">
              List Your Business on Famba
            </h1>
            <p className="text-sm text-slate-600">
              Join verified Zimbabwean vehicle rental fleets, workshops, and parts vendors earning across the country.
            </p>
          </motion.div>

          {/* Progress steps */}
          <div className="flex items-center justify-between mb-10">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      i < step
                        ? 'bg-[#008767] text-white'
                        : i === step
                        ? 'bg-[#E6F4F1] text-[#008767] border-2 border-[#008767]'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {i < step ? <CheckCircle className="h-4 w-4" strokeWidth={3} /> : i + 1}
                  </div>
                  <span className={`text-[11px] font-bold hidden sm:block ${i === step ? 'text-[#008767]' : 'text-slate-400'}`}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mt-[-14px] transition-colors ${
                      i < step ? 'bg-[#008767]' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl"
          >
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-[#0B192C]">Business Information</h2>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Company Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:bg-white transition"
                      placeholder="e.g. Harare Premier Car Hire"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Primary Category *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => update('category', cat.value)}
                        className={`text-left p-3 rounded-xl text-xs font-bold border transition-all ${
                          form.category === cat.value
                            ? 'bg-[#E6F4F1] border-[#B2E3D8] text-[#008767] shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:bg-white transition resize-none h-28"
                    placeholder="Tell Zimbabwean customers what makes your fleet or auto services special..."
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-[#0B192C]">Contact & Location</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Business Email *</label>
                    <input
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                      placeholder="hello@yourcompany.co.zw"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Phone / WhatsApp Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                        placeholder="+263 77 ..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Website (optional)</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={form.website}
                      onChange={(e) => update('website', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                      placeholder="https://yourcompany.co.zw"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Physical Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={form.address}
                      onChange={(e) => update('address', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                      placeholder="e.g. 45 Samora Machel Avenue, CBD"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">City *</label>
                    <input
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C]"
                      placeholder="Harare"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Province</label>
                    <input
                      value={form.state}
                      onChange={(e) => update('state', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C]"
                      placeholder="Harare Metropolitan"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Country</label>
                    <input
                      value={form.country}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-xs font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-bold text-[#0B192C]">Documents & Verification</h2>
                <p className="text-xs text-slate-600">
                  Provide your company details. Our Zimbabwe verification desk will audit your registration within 24-48 hours.
                </p>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Business Registration Number</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={form.registrationNumber}
                      onChange={(e) => update('registrationNumber', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                      placeholder="e.g. ZW-123456"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">BP Number / Tax ID (optional)</label>
                  <input
                    value={form.taxId}
                    onChange={(e) => update('taxId', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                    placeholder="Your tax identification number"
                  />
                </div>

                {/* Terms */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs leading-relaxed text-slate-600">
                    By submitting this registration, you agree to Famba Zimbabwe&apos;s{' '}
                    <Link href="/terms" className="text-[#008767] font-bold hover:underline">Provider Terms</Link> and{' '}
                    <Link href="/privacy" className="text-[#008767] font-bold hover:underline">Privacy Policy</Link>.
                    All listings will be verified for passenger safety and vehicle roadworthiness.
                  </p>
                </div>

                {error && (
                  <p className="text-xs rounded-xl p-3 bg-red-50 text-red-600 border border-red-200 font-semibold">
                    {error}
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h2 className="font-display text-2xl font-extrabold text-[#0B192C]">Application Submitted!</h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  We&apos;ve received your registration for <strong className="text-[#0B192C]">{form.name}</strong>.
                  Our team will review your fleet documentation and email confirmation to {form.email}.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link
                    href="/company/dashboard"
                    className="px-6 py-2.5 rounded-xl bg-[#008767] text-white font-bold text-xs hover:bg-[#007358] transition"
                  >
                    Go to Provider Portal
                  </Link>
                  <Link
                    href="/search"
                    className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {step < 3 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs disabled:opacity-30 hover:bg-slate-50 transition"
                >
                  Back
                </button>
                {step < 2 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    disabled={
                      (step === 0 && (!form.name || !form.category)) ||
                      (step === 1 && (!form.email || !form.phone || !form.city))
                    }
                    className="px-6 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-xs disabled:opacity-40 transition flex items-center gap-1.5"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-xs disabled:opacity-50 transition flex items-center gap-1.5"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Application'}
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Already have an account */}
          {!isAuthenticated && (
            <p className="text-center text-xs text-slate-500 mt-6">
              Already have a provider account?{' '}
              <Link href="/auth/login" className="text-[#008767] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
