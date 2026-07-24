'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Building2, Mail, Phone, MapPin, Globe, CheckCircle, Loader2 } from 'lucide-react';

export default function CompanySettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || user?.role !== 'COMPANY_OWNER') {
      router.push('/auth/login?redirect=/company/settings');
    }
  }, [isAuthenticated, isHydrated, user, router]);

  const { data } = useQuery({
    queryKey: ['company-settings'],
    queryFn: () => apiClient.get('/companies/me/dashboard').then(r => r.data.data.company),
    enabled: !!isAuthenticated && user?.role === 'COMPANY_OWNER',
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    city: '',
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || '',
        description: data.description || '',
        phone: data.phone || '',
        email: data.email || '',
        city: data.city || '',
      });
    }
  }, [data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.id) return;
    setSaving(true);
    try {
      await apiClient.put(`/companies/${data.id}`, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Company Settings</h1>
        <p style={{ color: '#6B6B72' }}>Manage your public company profile and contact info.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-8">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-dark pl-11" required />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-dark resize-none h-28" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Business Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input-dark pl-11" required />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-dark pl-11" required />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>City</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="input-dark pl-11" required />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Settings'}
            </button>
            {saved && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: '#34D399' }}>
                <CheckCircle className="h-4 w-4" /> Company profile updated!
              </div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
