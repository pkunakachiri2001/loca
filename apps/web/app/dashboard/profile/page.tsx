
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import { Camera, User, Mail, Phone, Lock, CheckCircle, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login?redirect=/dashboard/profile');
  }, [isAuthenticated, router]);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPass, setSavedPass] = useState(false);
  const [error, setError] = useState('');
  const [passError, setPassError] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await apiClient.put('/users/me', form);
      setUser(data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    if (passwords.next !== passwords.confirm) {
      setPassError('New passwords do not match');
      return;
    }
    setSavingPass(true);
    try {
      await apiClient.put('/users/me/password', {
        currentPassword: passwords.current,
        newPassword: passwords.next,
      });
      setPasswords({ current: '', next: '', confirm: '' });
      setSavedPass(true);
      setTimeout(() => setSavedPass(false), 3000);
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1" style={{ color: '#F5F0E8' }}>Profile Settings</h1>
        <p style={{ color: '#6B6B72' }}>Manage your personal information and account security.</p>
      </motion.div>

      {/* Avatar section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card p-6 mb-6"
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center font-display font-bold text-2xl"
              style={{ background: '#E8A547', color: '#0E0E10' }}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                `${user?.firstName?.[0]}${user?.lastName?.[0]}`
              )}
            </div>
            <button
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: '#1A1A1C', border: '1px solid #2E2E34' }}
            >
              <Camera className="h-3.5 w-3.5" style={{ color: '#9A9A9E' }} />
            </button>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold" style={{ color: '#F5F0E8' }}>
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm" style={{ color: '#6B6B72' }}>{user?.email}</p>
            <span className="badge-info mt-2">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
      </motion.div>

      {/* Personal Info Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6 mb-6"
      >
        <h3 className="font-display text-lg font-semibold mb-5" style={{ color: '#F5F0E8' }}>Personal Information</h3>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>First name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                <input
                  value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  className="input-dark pl-10"
                  placeholder="First name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Last name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                <input
                  value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  className="input-dark pl-10"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
              <input
                value={user?.email || ''}
                disabled
                className="input-dark pl-10 opacity-50 cursor-not-allowed"
              />
            </div>
            <p className="text-xs mt-1" style={{ color: '#5A5A60' }}>Email address cannot be changed.</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="input-dark pl-10"
                placeholder="+263 77 000 0000"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm rounded-lg p-3" style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.25)' }}>
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary px-6">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </button>
            {saved && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: '#34D399' }}>
                <CheckCircle className="h-4 w-4" /> Saved!
              </div>
            )}
          </div>
        </form>
      </motion.div>

      {/* Password Change */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-6"
      >
        <h3 className="font-display text-lg font-semibold mb-5" style={{ color: '#F5F0E8' }}>Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { label: 'Current password', key: 'current', placeholder: 'Your current password' },
            { label: 'New password', key: 'next', placeholder: 'At least 8 characters' },
            { label: 'Confirm new password', key: 'confirm', placeholder: 'Repeat new password' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                <input
                  type="password"
                  value={(passwords as any)[key]}
                  onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                  className="input-dark pl-10"
                  placeholder={placeholder}
                  required
                />
              </div>
            </div>
          ))}

          {passError && (
            <p className="text-sm rounded-lg p-3" style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.25)' }}>
              {passError}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={savingPass} className="btn-secondary px-6">
              {savingPass ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
            </button>
            {savedPass && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: '#34D399' }}>
                <CheckCircle className="h-4 w-4" /> Password updated!
              </div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
