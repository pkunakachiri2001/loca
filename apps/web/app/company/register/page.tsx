'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import {
  Building2, MapPin, Globe, Phone, FileText, ChevronRight, CheckCircle, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';

const CATEGORIES = [
  { value: 'CAR_RENTAL', label: 'Car Rental' },
  { value: 'BUS_RENTAL', label: 'Bus / Minibus Rental' },
  { value: 'DRIVER', label: 'Professional Drivers' },
  { value: 'MECHANIC', label: 'Auto Mechanics' },
  { value: 'CAR_WASH', label: 'Restaurants' },
  { value: 'VEHICLE_DEALER', label: 'Vehicle Dealership' },
  { value: 'COURIER', label: 'Courier Vehicles' },
  { value: 'EMERGENCY_ROADSIDE', label: 'Emergency / Roadside' },
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
    city: '',
    state: '',
    country: 'Nigeria',
    registrationNumber: '',
    taxId: '',
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/company/register');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/companies', form);
      setSubmitted(true);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0E0E10' }}>
      <Navbar />

      <div className="pt-24 pb-24">
        <div className="max-w-2xl mx-auto px-4">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
            <span className="section-badge mb-4">For Providers</span>
            <h1 className="font-display text-4xl font-bold mb-3" style={{ color: '#F5F0E8' }}>
              List your business on FleetNest
            </h1>
            <p style={{ color: '#6B6B72' }}>
              Join 2,400+ transport providers earning on the platform. Free to register, no hidden fees.
            </p>
          </motion.div>

          {/* Progress steps */}
          <div className="flex items-center justify-between mb-10">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold font-display transition-all duration-300"
                    style={{
                      background: i < step ? '#E8A547' : i === step ? 'rgba(232,165,71,0.15)' : '#1A1A1C',
                      border: i === step ? '2px solid #E8A547' : i < step ? '2px solid #E8A547' : '2px solid #2E2E34',
                      color: i <= step ? '#E8A547' : '#5A5A60',
                    }}
                  >
                    {i < step ? <CheckCircle className="h-4 w-4" style={{ color: '#0E0E10' }} strokeWidth={3} /> : i + 1}
                  </div>
                  <span className="text-xs hidden sm:block" style={{ color: i === step ? '#E8A547' : '#5A5A60' }}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px mx-2 mt-[-12px]" style={{
                    background: i < step ? '#E8A547' : '#2E2E34',
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-8"
          >
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-semibold" style={{ color: '#F5F0E8' }}>Business Information</h2>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Company Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                    <input
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      className="input-dark pl-10"
                      placeholder="e.g. Lagos Premier Car Hire"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Business Category *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => update('category', cat.value)}
                        className="text-left p-3 rounded-xl text-sm transition-all"
                        style={{
                          background: form.category === cat.value ? 'rgba(232,165,71,0.1)' : '#242428',
                          border: form.category === cat.value ? '1px solid rgba(232,165,71,0.4)' : '1px solid #2E2E34',
                          color: form.category === cat.value ? '#E8A547' : '#9A9A9E',
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                    className="input-dark resize-none h-28"
                    placeholder="Tell customers what makes your business special..."
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-semibold" style={{ color: '#F5F0E8' }}>Contact & Location</h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Business Email *</label>
                    <input value={form.email} onChange={e => update('email', e.target.value)} className="input-dark" placeholder="hello@yourcompany.com" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                      <input value={form.phone} onChange={e => update('phone', e.target.value)} className="input-dark pl-10" placeholder="+234 ..." />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Website (optional)</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                    <input value={form.website} onChange={e => update('website', e.target.value)} className="input-dark pl-10" placeholder="https://yourcompany.com" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Street Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                    <input value={form.address} onChange={e => update('address', e.target.value)} className="input-dark pl-10" placeholder="12 Broad Street" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>City *</label>
                    <input value={form.city} onChange={e => update('city', e.target.value)} className="input-dark" placeholder="Lagos" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>State</label>
                    <input value={form.state} onChange={e => update('state', e.target.value)} className="input-dark" placeholder="Lagos State" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Country</label>
                    <input value={form.country} onChange={e => update('country', e.target.value)} className="input-dark" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-xl font-semibold" style={{ color: '#F5F0E8' }}>Documents & Verification</h2>
                <p className="text-sm" style={{ color: '#6B6B72' }}>
                  Provide your registration details. Our team will verify your business within 48-72 hours.
                </p>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Business Registration Number</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                    <input value={form.registrationNumber} onChange={e => update('registrationNumber', e.target.value)} className="input-dark pl-10" placeholder="RC123456" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Tax ID (optional)</label>
                  <input value={form.taxId} onChange={e => update('taxId', e.target.value)} className="input-dark" placeholder="Your tax identification number" />
                </div>

                {/* Terms */}
                <div className="p-4 rounded-xl" style={{ background: '#242428', border: '1px solid #2E2E34' }}>
                  <p className="text-xs leading-relaxed" style={{ color: '#6B6B72' }}>
                    By submitting this form you agree to FleetNest's{' '}
                    <a href="#" style={{ color: '#E8A547' }}>Provider Terms of Service</a> and{' '}
                    <a href="#" style={{ color: '#E8A547' }}>Privacy Policy</a>.
                    Your business will be reviewed before appearing publicly on the platform.
                  </p>
                </div>

                {error && (
                  <p className="text-sm rounded-lg p-3" style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.25)' }}>
                    {error}
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
                  <CheckCircle className="h-8 w-8" style={{ color: '#34D399' }} />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#F5F0E8' }}>Application submitted!</h2>
                <p className="mb-8 max-w-sm mx-auto" style={{ color: '#6B6B72' }}>
                  We've received your application for <strong style={{ color: '#F5F0E8' }}>{form.name}</strong>.
                  Our team will review it within 48-72 hours and email you at {form.email}.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/company/dashboard" className="btn-primary">Go to Dashboard</Link>
                  <Link href="/search" className="btn-secondary">Browse Platform</Link>
                </div>
              </div>
            )}

            {/* Navigation */}
            {step < 3 && (
              <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid #1E1E22' }}>
                <button
                  onClick={() => setStep(s => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="btn-secondary px-5 disabled:opacity-30"
                >
                  Back
                </button>
                {step < 2 ? (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    disabled={
                      (step === 0 && (!form.name || !form.category)) ||
                      (step === 1 && (!form.email || !form.phone || !form.city))
                    }
                    className="btn-primary px-5 disabled:opacity-40"
                  >
                    Continue <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={loading} className="btn-primary px-6">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Application'}
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Already have an account */}
          {!isAuthenticated && (
            <p className="text-center text-sm mt-6" style={{ color: '#6B6B72' }}>
              Already have a company account?{' '}
              <Link href="/auth/login" style={{ color: '#E8A547' }}>Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
