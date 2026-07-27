'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Car, DollarSign, MapPin, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'CAR_RENTAL', label: 'Car Rental' },
  { value: 'BUS_RENTAL', label: 'Bus / Minibus Rental' },
  { value: 'DRIVER', label: 'Professional Driver' },
  { value: 'MECHANIC', label: 'Auto Mechanic' },
  { value: 'CAR_WASH', label: 'Restaurants' },
  { value: 'VEHICLE_DEALER', label: 'Vehicle Dealership' },
  { value: 'COURIER', label: 'Courier Vehicle' },
  { value: 'EMERGENCY_ROADSIDE', label: 'Emergency Roadside' },
];

export default function NewListingPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'COMPANY_OWNER') {
      router.push('/auth/login?redirect=/company/listings/new');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'CAR_RENTAL',
    pricePerDay: '',
    pricePerHour: '',
    city: 'Harare',
    state: 'Harare',
    country: 'Zimbabwe',
    make: '',
    model: '',
    year: '2023',
    features: 'AC, GPS, Bluetooth',
    primaryImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        pricePerDay: parseFloat(form.pricePerDay),
        pricePerHour: form.pricePerHour ? parseFloat(form.pricePerHour) : undefined,
        year: parseInt(form.year),
        features: form.features.split(',').map(f => f.trim()).filter(Boolean),
        images: [{ url: form.primaryImage, isPrimary: true }],
      };
      await apiClient.post('/listings', payload);
      router.push('/company/listings');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/company/listings" className="text-sm flex items-center gap-1 mb-2 hover:underline" style={{ color: '#6B6B72' }}>
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>
        <h1 className="font-display text-3xl font-bold" style={{ color: '#F5F0E8' }}>Add New Listing</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Listing Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Toyota Camry 2023 Executive Sedan"
              className="input-dark"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Category *</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="input-dark"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-navy-900">{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Price per day ($ USD) *</label>
              <input
                type="number"
                value={form.pricePerDay}
                onChange={e => setForm(f => ({ ...f, pricePerDay: e.target.value }))}
                placeholder="45"
                className="input-dark"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe your vehicle or service features, condition, terms..."
              className="input-dark resize-none h-28"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Make</label>
              <input value={form.make} onChange={e => setForm(f => ({ ...f, make: e.target.value }))} placeholder="Toyota" className="input-dark" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Model</label>
              <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Camry" className="input-dark" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>City *</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Harare" className="input-dark" required />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Features (comma separated)</label>
            <input value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} className="input-dark" />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Image URL</label>
            <input value={form.primaryImage} onChange={e => setForm(f => ({ ...f, primaryImage: e.target.value }))} className="input-dark" />
          </div>

          {error && <p className="text-sm text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/30">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Publish Listing'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
