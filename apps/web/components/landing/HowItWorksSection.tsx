'use client';

import { motion } from 'framer-motion';
import { Search, CreditCard, Car, CheckCircle } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Search,
    title: 'Search & Compare',
    description: 'Browse hundreds of verified vehicle and service listings. Filter by price, location, rating, availability, and features to find your perfect match.',
    color: 'text-blue-400',
    glow: 'rgba(37, 99, 235, 0.3)',
    bg: 'bg-blue-600/10 border-blue-500/20',
  },
  {
    step: '02',
    icon: CreditCard,
    title: 'Book & Pay Securely',
    description: 'Choose your dates, apply promo codes, and pay securely online. Your payment is protected until the service is delivered.',
    color: 'text-purple-400',
    glow: 'rgba(124, 58, 237, 0.3)',
    bg: 'bg-purple-600/10 border-purple-500/20',
  },
  {
    step: '03',
    icon: Car,
    title: 'Enjoy the Ride',
    description: 'Track your booking in real-time. Get live updates, GPS directions, and direct WhatsApp contact with your provider.',
    color: 'text-emerald-400',
    glow: 'rgba(16, 185, 129, 0.3)',
    bg: 'bg-emerald-600/10 border-emerald-500/20',
  },
  {
    step: '04',
    icon: CheckCircle,
    title: 'Review & Earn',
    description: 'Leave a verified review to help the community. Earn loyalty points with every booking and unlock exclusive rewards.',
    color: 'text-gold-400',
    glow: 'rgba(245, 158, 11, 0.3)',
    bg: 'bg-amber-600/10 border-amber-500/20',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative">
      {/* Background accent */}
      <div
        className="absolute left-0 top-0 h-full w-1/2 opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at left, #2563EB, transparent 60%)' }}
      />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-badge mb-4 inline-flex">How It Works</span>
          <h2 className="font-display text-4xl font-bold text-white md:text-5xl mb-4">
            From Search to{' '}
            <span className="gradient-text">On The Road</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Booking transportation services has never been easier. Four simple steps to get you moving.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="absolute top-16 left-[12.5%] right-[12.5%] h-px hidden lg:block"
            style={{ background: 'linear-gradient(90deg, transparent, #2563EB, #7C3AED, #2563EB, transparent)' }}
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative"
              >
                {/* Step number circle */}
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 mb-6 ${step.bg}`}
                    style={{ boxShadow: `0 0 30px ${step.glow}` }}
                  >
                    <step.icon className={`h-7 w-7 ${step.color}`} />
                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 border border-white/10 text-[10px] font-bold text-slate-300">
                      {step.step}
                    </div>
                  </div>

                  <h3 className="font-semibold text-white text-lg mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
