'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, Building2, Briefcase, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['CUSTOMER', 'COMPANY_OWNER', 'INSURANCE_AGENT']),
  agreeToTerms: z.boolean().refine((v) => v, 'You must agree to the terms'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CUSTOMER', agreeToTerms: false },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      if (user.role === 'COMPANY_OWNER') {
        router.push('/company/register');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFCFB] text-[#0B192C]">
      {/* LEFT: Branding panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-[#008767] to-[#0B192C]">
        <img
          src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1000&h=1200&fit=crop"
          alt="Famba Zimbabwe mobility"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          <Link href="/" className="inline-block group">
            <img src="/logo.jpeg" alt="Famba" className="h-11 w-auto object-contain bg-white/95 p-1.5 rounded-2xl shadow-md transition-transform group-hover:scale-105" />
          </Link>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300 bg-white/10 px-3 py-1 rounded-full border border-white/20 mb-4 inline-block">
              Famba Zimbabwe Network
            </span>
            <h2 className="font-display text-3xl font-extrabold text-white mb-4 leading-tight">
              Join Zimbabwe&apos;s Smartest Mobility Ecosystem
            </h2>
            <div className="space-y-3">
              {[
                'Verified vehicles, buses & workshops',
                'ZIMRA-benchmarked digital valuations',
                '24/7 Roadside and WhatsApp assistance',
              ].map((txt) => (
                <p key={txt} className="text-sm flex items-center gap-2 text-emerald-100 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {txt}
                </p>
              ))}
            </div>
          </div>

          <p className="text-xs text-emerald-200/70">
            © {new Date().getFullYear()} Famba Technologies Ltd. Powered by KUNAKA TECH.
          </p>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg py-8"
        >
          {/* Mobile logo */}
          <Link href="/" className="inline-block mb-6 lg:hidden">
            <img src="/logo.jpeg" alt="Famba" className="h-10 w-auto object-contain" />
          </Link>

          <h1 className="font-display text-3xl font-extrabold mb-1.5 text-[#0B192C]">Create Account</h1>
          <p className="text-xs sm:text-sm mb-8 text-slate-500 font-semibold">
            Already registered?{' '}
            <Link href="/auth/login" className="text-[#008767] font-bold hover:underline">
              Sign in
            </Link>
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {[
              { value: 'CUSTOMER', label: 'Customer', icon: User, desc: 'Book & Value' },
              { value: 'COMPANY_OWNER', label: 'Company', icon: Building2, desc: 'List Services' },
              { value: 'INSURANCE_AGENT', label: 'Agent', icon: Briefcase, desc: 'Underwrite' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('role', opt.value as 'CUSTOMER' | 'COMPANY_OWNER' | 'INSURANCE_AGENT')}
                className={cn(
                  'text-left p-3.5 rounded-2xl border transition-all',
                  selectedRole === opt.value
                    ? 'bg-[#E6F4F1] border-[#B2E3D8] shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center mb-2.5',
                    selectedRole === opt.value
                      ? 'bg-[#008767] text-white'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  <opt.icon className="h-4 w-4" />
                </div>
                <p className={cn('font-bold text-xs mb-0.5', selectedRole === opt.value ? 'text-[#008767]' : 'text-[#0B192C]')}>
                  {opt.label}
                </p>
                <p className="text-[11px] text-slate-500">{opt.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">First name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    {...register('firstName')}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:bg-white transition"
                    placeholder="John"
                  />
                </div>
                {errors.firstName && <p className="text-xs mt-1 text-red-500 font-semibold">{errors.firstName.message}</p>}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Last name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    {...register('lastName')}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:bg-white transition"
                    placeholder="Moyo"
                  />
                </div>
                {errors.lastName && <p className="text-xs mt-1 text-red-500 font-semibold">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:bg-white transition"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-xs mt-1 text-red-500 font-semibold">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register('phone')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:bg-white transition"
                  placeholder="+263 77 000 0000"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:bg-white transition"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1 text-red-500 font-semibold">{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block text-slate-600">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-semibold text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#008767] focus:bg-white transition"
                  placeholder="Repeat password"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs mt-1 text-red-500 font-semibold">{errors.confirmPassword.message}</p>}
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input {...register('agreeToTerms')} type="checkbox" className="mt-1 h-4 w-4 rounded text-[#008767] focus:ring-[#008767] border-slate-300" />
              <span className="text-xs text-slate-600 leading-relaxed">
                I agree to Famba Zimbabwe&apos;s{' '}
                <Link href="/terms" className="text-[#008767] font-bold hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-[#008767] font-bold hover:underline">Privacy Policy</Link>.
              </span>
            </label>
            {errors.agreeToTerms && <p className="text-xs text-red-500 font-semibold">{errors.agreeToTerms.message}</p>}

            {/* Error */}
            {error && (
              <div className="p-3.5 rounded-xl text-xs font-semibold bg-red-50 border border-red-200 text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
