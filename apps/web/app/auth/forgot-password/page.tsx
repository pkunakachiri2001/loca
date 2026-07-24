'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Car, Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0E0E10' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm mb-8 hover:underline" style={{ color: '#6B6B72' }}>
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>

        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8A547' }}>
            <Car className="h-4 w-4" style={{ color: '#0E0E10' }} />
          </div>
          <span className="font-display text-xl font-bold" style={{ color: '#F5F0E8' }}>
            Fleet<span style={{ color: '#E8A547' }}>Nest</span>
          </span>
        </div>

        {submitted ? (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}>
              <CheckCircle className="h-7 w-7" style={{ color: '#34D399' }} />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2" style={{ color: '#F5F0E8' }}>Check your email</h2>
            <p className="text-sm mb-6" style={{ color: '#6B6B72' }}>
              We've sent a password reset link to <strong style={{ color: '#F5F0E8' }}>{email}</strong>.
            </p>
            <Link href="/auth/login" className="btn-primary w-full justify-center">Return to Login</Link>
          </div>
        ) : (
          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold mb-2" style={{ color: '#F5F0E8' }}>Reset password</h1>
            <p className="text-sm mb-6" style={{ color: '#6B6B72' }}>Enter your account email to receive a password reset link.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-dark pl-11"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-400 p-3 rounded-lg bg-red-500/10 border border-red-500/30">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
