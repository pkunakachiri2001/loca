'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe, Users, Award, Clock } from 'lucide-react';

const stats = [
  { value: '50K+', label: 'Customers served' },
  { value: '2,400+', label: 'Verified providers' },
  { value: '35', label: 'Cities covered' },
  { value: '4.8★', label: 'Average rating' },
];

const team = [
  {
    name: 'Locardia Munyuki',
    role: 'HR Manager & Executive Leadership',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
    bio: 'HR Manager at KUNAKA TECH leading global team recruitment and culture.',
    email: 'HRmanager@kunakatech.tech',
    phone: '+91 7796787966',
  },
  {
    name: 'Adewale Okonkwo',
    role: 'Co-Founder & CEO',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    bio: 'Former logistics director with 14 years in fleet management.',
  },
  {
    name: 'Chioma Eze',
    role: 'Co-Founder & CTO',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop&crop=face',
    bio: 'Software engineer who previously built infrastructure at Paystack.',
  },
];

const values = [
  { icon: Shield, title: 'Trust First', desc: 'Every provider is verified, every vehicle inspected. We stake our reputation on each booking.' },
  { icon: Zap, title: 'Speed Matters', desc: 'Book in under 60 seconds. Instant confirmation. Real-time updates, no waiting.' },
  { icon: Globe, title: 'Local Expertise', desc: 'We are built for African cities — our pricing, logistics, and support reflect local realities.' },
  { icon: Award, title: 'Quality Standard', desc: 'Only the top 15% of applicants become FleetNest providers. High bar, happy customers.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0E0E10' }}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,165,71,0.08) 0%, transparent 70%)'
        }} />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="section-badge mb-6">Our Story</span>
            <h1 className="font-display text-5xl sm:text-6xl font-bold mb-6 leading-tight" style={{ color: '#F5F0E8' }}>
              Reinventing how Africa
              <br />
              <span className="gradient-text">moves</span>
            </h1>
            <p className="text-lg leading-relaxed mb-10" style={{ color: '#9A9A9E', maxWidth: '56ch' }}>
              FleetNest was born from a simple frustration: booking a reliable vehicle in Lagos
              should not require three phone calls and a prayer. We built the platform we wished existed.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/search" className="btn-primary px-6 py-3">
                Browse Services <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/company/register" className="btn-secondary px-6 py-3">
                Join as a Provider
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero Photo */}
      <section className="pb-24">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden"
            style={{ height: 480 }}
          >
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=600&fit=crop"
              alt="Lagos cityscape with vehicles"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to right, rgba(14,14,16,0.85) 0%, rgba(14,14,16,0.3) 60%, transparent 100%)'
            }} />
            <div className="absolute inset-0 flex items-center px-12">
              <div>
                <p className="font-display text-4xl font-bold text-white mb-3">
                  "We move people,<br />not just vehicles."
                </p>
                <p style={{ color: '#9A9A9E' }}>— Adewale Okonkwo, CEO</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20" style={{ borderTop: '1px solid #1E1E22', borderBottom: '1px solid #1E1E22' }}>
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: '#1E1E22' }}>
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center py-12 px-6"
                style={{ background: '#0E0E10' }}
              >
                <p className="font-display text-4xl font-bold mb-2" style={{ color: '#E8A547' }}>{stat.value}</p>
                <p style={{ color: '#6B6B72', fontSize: 14 }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="section-container">
          <div className="mb-14">
            <span className="section-badge mb-4">What we stand for</span>
            <h2 className="font-display text-4xl font-bold" style={{ color: '#F5F0E8' }}>
              Our principles
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card p-8"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(232,165,71,0.1)', border: '1px solid rgba(232,165,71,0.2)' }}>
                  <v.icon className="h-5 w-5" style={{ color: '#E8A547' }} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2" style={{ color: '#F5F0E8' }}>{v.title}</h3>
                <p style={{ color: '#6B6B72', lineHeight: 1.7 }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24" style={{ borderTop: '1px solid #1E1E22' }}>
        <div className="section-container">
          <div className="mb-14">
            <span className="section-badge mb-4">The people</span>
            <h2 className="font-display text-4xl font-bold" style={{ color: '#F5F0E8' }}>
              Who built this
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-16 h-16 rounded-xl object-cover mb-4"
                  style={{ border: '2px solid #2E2E34' }}
                />
                <h3 className="font-display text-lg font-semibold mb-0.5" style={{ color: '#F5F0E8' }}>{member.name}</h3>
                <p className="text-sm mb-3" style={{ color: '#E8A547' }}>{member.role}</p>
                <p className="text-sm leading-relaxed" style={{ color: '#6B6B72' }}>{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ borderTop: '1px solid #1E1E22' }}>
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl font-bold mb-4" style={{ color: '#F5F0E8' }}>
              Ready to get moving?
            </h2>
            <p className="mb-8 max-w-md mx-auto" style={{ color: '#6B6B72' }}>
              Join thousands of customers who trust FleetNest for reliable transportation services.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/auth/register" className="btn-primary px-8 py-3 text-base">
                Create an Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/search" className="btn-secondary px-8 py-3 text-base">
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
