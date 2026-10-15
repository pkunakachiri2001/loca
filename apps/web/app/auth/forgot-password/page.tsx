'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFCFB] text-[#0B192C]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-6 hover:text-[#008767] transition">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Link href="/">
            <img src="/logo.jpeg" alt="Famba" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center mx-auto">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-[#0B192C]">Check your email</h2>
            <p className="text-sm text-slate-600">
              We&apos;ve sent a password reset link to <strong className="text-[#0B192C]">{email}</strong>.
            </p>
            <Link
              href="/auth/login"
              className="inline-block w-full py-3 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-xs transition"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-5">
            <div>
              <h1 className="font-display text-2xl font-extrabold text-[#0B192C] mb-1">Reset password</h1>
              <p className="text-xs text-slate-500 font-semibold">Enter your account email to receive a recovery link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:bg-white transition"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-semibold p-3 rounded-xl bg-red-50 border border-red-200">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
