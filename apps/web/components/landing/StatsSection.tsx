'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, Building2, Car, Star } from 'lucide-react';

const stats = [
  { icon: Users, value: 25000, suffix: '+', label: 'Happy Customers', color: 'text-blue-400' },
  { icon: Building2, value: 500, suffix: '+', label: 'Verified Companies', color: 'text-purple-400' },
  { icon: Car, value: 2000, suffix: '+', label: 'Active Listings', color: 'text-emerald-400' },
  { icon: Star, value: 4.8, suffix: '★', label: 'Average Rating', color: 'text-amber-400', isDecimal: true },
];

function AnimatedCounter({
  target, suffix, isDecimal = false,
}: {
  target: number;
  suffix: string;
  isDecimal?: boolean;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target, isDecimal]);

  return (
    <span ref={ref}>
      {isDecimal ? count.toFixed(1) : count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.08) 50%, rgba(37, 99, 235, 0.1) 100%)',
        }}
      />
      <div className="absolute inset-0 border-y border-white/5" />

      <div className="relative section-container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="stat-card"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 bg-white/5 border border-white/10`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className={`font-display text-4xl font-black mb-2 ${stat.color}`}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} isDecimal={stat.isDecimal} />
              </div>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
