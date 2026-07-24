'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Car, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
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
  { label: 'Company', email: 'lagos.motors@fleetnest.com', role: 'Provider' },
  { label: 'Admin', email: 'admin@fleetnest.com', role: 'Admin' },
];

export default function LoginPage() {
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
      const redirect = searchParams.get('redirect');
      if (redirect && redirect !== '/dashboard') {
        router.push(redirect);
      } else if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (user.role === 'COMPANY_OWNER') {
        router.push('/company/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0E0E10' }}>
      {/* LEFT: Photo panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&h=1200&fit=crop"
          alt="Luxury car"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom right, rgba(14,14,16,0.5) 0%, rgba(14,14,16,0.2) 50%, rgba(14,14,16,0.8) 100%)'
        }} />
        {/* Overlay content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8A547' }}>
              <Car className="h-4 w-4" style={{ color: '#0E0E10' }} />
            </div>
            <span className="font-display text-xl font-bold text-white">
              Fleet<span style={{ color: '#E8A547' }}>Nest</span>
            </span>
          </Link>
          <div>
            <p className="font-display text-3xl font-bold text-white mb-3 leading-tight">
              Africa's premier
              <br />
              transport marketplace
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              50,000+ customers · 2,400+ verified providers
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8A547' }}>
              <Car className="h-4 w-4" style={{ color: '#0E0E10' }} />
            </div>
            <span className="font-display text-xl font-bold" style={{ color: '#F5F0E8' }}>
              Fleet<span style={{ color: '#E8A547' }}>Nest</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl font-bold mb-1.5" style={{ color: '#F5F0E8' }}>Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: '#6B6B72' }}>
            Don't have an account?{' '}
            <Link href="/auth/register" style={{ color: '#E8A547' }}>Sign up free</Link>
          </p>

          {/* Session expired notice */}
          {isExpired && (
            <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#FBBF24' }}>
              Your session expired. Please sign in again.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="input-dark pl-11"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-xs mt-1.5" style={{ color: '#F87171' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B6B72' }}>Password</label>
                <Link href="/auth/forgot-password" className="text-xs" style={{ color: '#E8A547' }}>Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input-dark pl-11 pr-11"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#5A5A60' }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1.5" style={{ color: '#F87171' }}>{errors.password.message}</p>}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: '#1E1E22' }} />
              <span className="text-xs" style={{ color: '#5A5A60' }}>Demo accounts</span>
              <div className="flex-1 h-px" style={{ background: '#1E1E22' }} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => {
                    setValue('email', acc.email);
                    setValue('password', 'Password123!');
                  }}
                  className="text-center p-3 rounded-xl transition-all text-xs"
                  style={{ background: '#1A1A1C', border: '1px solid #2E2E34', color: '#9A9A9E' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8A547'; (e.currentTarget as HTMLElement).style.color = '#E8A547'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2E2E34'; (e.currentTarget as HTMLElement).style.color = '#9A9A9E'; }}
                >
                  <p className="font-semibold mb-0.5">{acc.label}</p>
                  <p style={{ fontSize: 10, color: 'inherit', opacity: 0.7 }}>{acc.role}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-center mt-2" style={{ color: '#5A5A60' }}>Password: Password123!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
