'use client';

import { Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const DEMO_ACCOUNTS = [
  { label: 'Customer', email: 'john.doe@example.com', role: 'Customer' },
  { label: 'Company', email: 'harare.motors@famba.co.zw', role: 'Provider' },
  { label: 'Admin', email: 'admin@famba.co.zw', role: 'Admin' },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('session') === 'expired';
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/auth/login', { email: data.email, password: data.password });
      const { user, accessToken } = res.data.data;

      setAuth(user, accessToken);

      // Redirect according to user role
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (user.role === 'COMPANY_OWNER') {
        router.push('/company/dashboard');
      } else if (user.role === 'INSURANCE_AGENT') {
        router.push('/insurance/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoUser = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#FAFCFB] text-[#0B192C]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-3xl p-8 z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 group">
            <img src="/logo.jpeg" alt="Famba" className="h-12 w-auto mx-auto object-contain transition-transform group-hover:scale-105" />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Famba Zimbabwe</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[#0B192C] mb-1">Welcome Back</h1>
          <p className="text-xs text-slate-500 font-semibold">Sign in to manage your bookings, fleet, and valuations</p>
        </div>

        {isExpired && (
          <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            Your session has expired. Please sign in again to continue.
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                {...register('email')}
                type="email"
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:bg-white transition"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-[#008767] font-bold hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-extrabold text-sm shadow-md transition mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Sign In</span>}
          </button>
        </form>

        {/* Demo Accounts Helper */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-center text-slate-400 font-semibold mb-3">Quick Demo Login (1-Click Fill)</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => setDemoUser(acc.email)}
                className="px-2 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700 hover:border-[#008767] hover:text-[#008767] hover:bg-[#E6F4F1] transition-all text-center"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-[#008767] font-bold hover:underline">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-[#008767] bg-[#FAFCFB]">
        <Loader2 className="h-8 w-8 animate-spin text-[#008767]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
