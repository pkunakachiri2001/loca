'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Car, Mail, Lock, User, Phone, ArrowRight, Loader2, Building2 } from 'lucide-react';
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
  role: z.enum(['CUSTOMER', 'COMPANY_OWNER']),
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
    <div className="min-h-screen flex" style={{ background: '#0E0E10' }}>
      {/* LEFT: Photo panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&h=1200&fit=crop"
          alt="Transport service"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom right, rgba(14,14,16,0.4) 0%, rgba(14,14,16,0.2) 40%, rgba(14,14,16,0.85) 100%)'
        }} />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8A547' }}>
              <Car className="h-4 w-4" style={{ color: '#0E0E10' }} />
            </div>
            <span className="font-display text-xl font-bold text-white">
              Fleet<span style={{ color: '#E8A547' }}>Nest</span>
            </span>
          </Link>
          <div>
            <div className="accent-line mb-4" />
            <p className="font-display text-2xl font-bold text-white mb-3 leading-tight">
              Join the leading transport
              <br />
              marketplace in Africa
            </p>
            <div className="space-y-2">
              {['Free to join · No hidden fees', 'Verified providers only', '24/7 customer support'].map(txt => (
                <p key={txt} className="text-sm flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  <span style={{ color: '#E8A547' }}>✓</span> {txt}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg py-8"
        >
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#E8A547' }}>
              <Car className="h-4 w-4" style={{ color: '#0E0E10' }} />
            </div>
            <span className="font-display text-xl font-bold" style={{ color: '#F5F0E8' }}>
              Fleet<span style={{ color: '#E8A547' }}>Nest</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl font-bold mb-1.5" style={{ color: '#F5F0E8' }}>Create account</h1>
          <p className="text-sm mb-8" style={{ color: '#6B6B72' }}>
            Already registered?{' '}
            <Link href="/auth/login" style={{ color: '#E8A547' }}>Sign in</Link>
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { value: 'CUSTOMER', label: 'I need transport', icon: User, desc: 'Book vehicles & services' },
              { value: 'COMPANY_OWNER', label: 'I offer transport', icon: Building2, desc: 'List & manage services' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('role', opt.value as 'CUSTOMER' | 'COMPANY_OWNER')}
                className="text-left p-4 rounded-xl transition-all"
                style={{
                  background: selectedRole === opt.value ? 'rgba(232,165,71,0.08)' : '#1A1A1C',
                  border: selectedRole === opt.value ? '1px solid rgba(232,165,71,0.4)' : '1px solid #2E2E34',
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{
                    background: selectedRole === opt.value ? 'rgba(232,165,71,0.15)' : '#242428',
                    border: selectedRole === opt.value ? '1px solid rgba(232,165,71,0.3)' : '1px solid #2E2E34',
                  }}>
                  <opt.icon className="h-4 w-4" style={{ color: selectedRole === opt.value ? '#E8A547' : '#6B6B72' }} />
                </div>
                <p className="font-semibold text-sm mb-0.5" style={{ color: selectedRole === opt.value ? '#E8A547' : '#F5F0E8' }}>
                  {opt.label}
                </p>
                <p className="text-xs" style={{ color: '#6B6B72' }}>{opt.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>First name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                  <input {...register('firstName')} className="input-dark pl-10" placeholder="John" />
                </div>
                {errors.firstName && <p className="text-xs mt-1" style={{ color: '#F87171' }}>{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Last name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                  <input {...register('lastName')} className="input-dark pl-10" placeholder="Doe" />
                </div>
                {errors.lastName && <p className="text-xs mt-1" style={{ color: '#F87171' }}>{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                <input {...register('email')} type="email" className="input-dark pl-10" placeholder="you@example.com" />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: '#F87171' }}>{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                <input {...register('phone')} className="input-dark pl-10" placeholder="+263 77 000 0000" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-dark pl-10 pr-11"
                  placeholder="At least 8 characters"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#5A5A60' }}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: '#F87171' }}>{errors.password.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide mb-1.5 block" style={{ color: '#6B6B72' }}>Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#5A5A60' }} />
                <input {...register('confirmPassword')} type="password" className="input-dark pl-10" placeholder="Repeat password" />
              </div>
              {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: '#F87171' }}>{errors.confirmPassword.message}</p>}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input {...register('agreeToTerms')} type="checkbox" className="sr-only" />
                <div className="w-5 h-5 rounded flex items-center justify-center transition-all"
                  style={{ background: watch('agreeToTerms') ? '#E8A547' : '#1A1A1C', border: '1px solid #2E2E34' }}>
                  {watch('agreeToTerms') && <span style={{ color: '#0E0E10', fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
              </div>
              <span className="text-sm leading-relaxed" style={{ color: '#9A9A9E' }}>
                I agree to the{' '}
                <a href="#" style={{ color: '#E8A547' }}>Terms of Service</a>
                {' '}and{' '}
                <a href="#" style={{ color: '#E8A547' }}>Privacy Policy</a>
              </span>
            </label>
            {errors.agreeToTerms && <p className="text-xs" style={{ color: '#F87171' }}>{errors.agreeToTerms.message}</p>}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
