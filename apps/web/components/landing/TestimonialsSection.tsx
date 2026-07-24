'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Adaeze Okonkwo',
    role: 'Marketing Manager, Lagos',
    avatar: 'AO',
    avatarColor: 'from-pink-600 to-rose-600',
    rating: 5,
    text: 'FleetNest completely transformed how our company handles corporate travel. We booked a Toyota Land Cruiser for a 3-day client trip, and the entire process was seamless — from the beautiful booking interface to real-time tracking. The vehicle was in immaculate condition.',
    service: 'Land Cruiser V8 — Lagos Premier Motors',
    date: 'June 2026',
  },
  {
    name: 'Emeka Obi',
    role: 'Event Planner, Abuja',
    avatar: 'EO',
    avatarColor: 'from-blue-600 to-indigo-600',
    rating: 5,
    text: 'I organized a wedding for 200 guests and needed reliable bus transportation. FleetNest connected me with Speedy Rides in minutes. The pricing was transparent, the buses were luxurious, and the drivers were incredibly professional. My clients were absolutely impressed.',
    service: 'Luxury Coach — Speedy Rides Transport',
    date: 'May 2026',
  },
  {
    name: 'Dr. Fatima Suleiman',
    role: 'Consultant, Kano',
    avatar: 'FS',
    avatarColor: 'from-emerald-600 to-teal-600',
    rating: 5,
    text: "The mechanic service I found through FleetNest was outstanding. Road Master Mechanics diagnosed and fixed my BMW in a single day. They even provided a detailed report with photos. I've never trusted my car to anyone else since. FleetNest is a game-changer.",
    service: 'Full Diagnostics — Road Master Mechanics',
    date: 'April 2026',
  },
  {
    name: 'Chidi Nwachukwu',
    role: 'CEO, Port Harcourt',
    avatar: 'CN',
    avatarColor: 'from-purple-600 to-violet-600',
    rating: 5,
    text: "As a business owner, I've used FleetNest to book couriers, rent executive cars for client meetings, and even get an emergency roadside service when my car broke down at midnight. The 24/7 availability and instant booking are what set this platform apart.",
    service: 'Multiple Services — Various Providers',
    date: 'March 2026',
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const navigate = (dir: number) => {
    setDirection(dir);
    setCurrentIndex((prev) => (prev + dir + testimonials.length) % testimonials.length);
  };

  const t = testimonials[currentIndex];

  return (
    <section className="py-24">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-badge mb-4 inline-flex">Testimonials</span>
          <h2 className="font-display text-4xl font-bold text-white md:text-5xl mb-4">
            Trusted by{' '}
            <span className="gradient-text">Thousands</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Real reviews from real customers across Nigeria.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative glass-card p-8 md:p-12">
            {/* Quote icon */}
            <Quote className="absolute top-6 left-6 h-8 w-8 text-blue-500/30" />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-lg text-slate-200 leading-relaxed mb-8 italic">
                  "{t.text}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${t.avatarColor} text-sm font-bold text-white`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-sm text-slate-400">{t.role}</p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-blue-400">{t.service}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{t.date}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                    className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-blue-500' : 'w-2 bg-white/20'}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
