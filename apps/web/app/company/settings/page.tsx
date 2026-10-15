'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Building2, Mail, Phone, MapPin, CheckCircle, Loader2, Sparkles } from 'lucide-react';

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
    queryFn: () => apiClient.get('/companies/me/dashboard').then((r) => r.data.data.company),
    enabled: !!isAuthenticated && user?.role === 'COMPANY_OWNER',
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    city: 'Harare',
  });

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || '',
        description: data.description || '',
        phone: data.phone || '',
        email: data.email || '',
        city: data.city || 'Harare',
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
    <div className="max-w-3xl mx-auto text-[#0B192C]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vendor Identity</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-[#0B192C] mb-1">Company Settings</h1>
        <p className="text-xs sm:text-sm font-semibold text-slate-500">
          Manage your verified Zimbabwean corporate details, contact numbers, and public business profile.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8"
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
              Business Legal / Trading Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
              Company Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="About our fleet, customer service values, and fleet coverage in Zimbabwe..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] resize-none h-28"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Official Business Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Primary Phone / WhatsApp Line
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+263 77 123 4567"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
              Headquarters City (Zimbabwe)
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="Harare"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767]"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Profile Changes'}
            </button>
            {saved && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#008767]">
                <CheckCircle className="h-4 w-4" /> Company profile updated!
              </div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
