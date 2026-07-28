'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Tarisai Moyo',
    role: 'Marketing Manager, Harare',
    avatar: 'TM',
    avatarColor: 'from-[#008767] to-[#005E47]',
    rating: 5,
    text: 'Famba completely transformed how our company handles corporate travel and deliveries across Zimbabwe. We booked a Toyota Land Cruiser for a 3-day executive safari trip to Victoria Falls, and the entire process was seamless — from live tracking to transparent USD pricing.',
    service: 'Land Cruiser V8 — Harare Executive Motors',
    date: 'June 2026',
  },
  {
    name: 'Farai Ndlovu',
    role: 'Event Coordinator, Bulawayo',
    avatar: 'FN',
    avatarColor: 'from-blue-600 to-indigo-600',
    rating: 5,
    text: 'I organized a tour across Matabeleland and needed reliable luxury coach transportation. Famba connected me with Victoria Falls Safaris in minutes. The pricing in USD was clear, the buses were luxurious, and the drivers were top-class.',
    service: 'Luxury Coach — Victoria Falls & Safari Transport',
    date: 'May 2026',
  },
  {
    name: 'Chiedza Chimutengwende',
    role: 'Tourism Consultant, Victoria Falls',
    avatar: 'FS',
    avatarColor: 'from-emerald-600 to-teal-600',
    rating: 5,
    text: "The mechanic service I found through Famba was outstanding. Road Master Mechanics diagnosed and fixed my BMW in a single day. They even provided a detailed report with photos. Famba is a total game-changer for Zimbabwe.",
    service: 'Full Diagnostics — Road Master Mechanics',
    date: 'April 2026',
  },
  {
    name: 'Blessing Mutasa',
    role: 'Operations Lead, Mutare',
    avatar: 'BM',
    avatarColor: 'from-purple-600 to-violet-600',
    rating: 5,
    text: "As a business owner, I've used Famba to book couriers, rent executive cars for client meetings, and even get emergency roadside service. The 24/7 availability, delivery tracking, and instant booking set this platform apart.",
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
    <section className="py-24 bg-[#FAFCFB] border-t border-slate-200">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-badge mb-4 inline-flex">Testimonials</span>
          <h2 className="font-display text-4xl font-extrabold text-[#0B192C] md:text-5xl mb-4">
            Trusted by <span className="text-[#008767]">Thousands</span>
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto font-medium text-base">
            Real reviews from real customers across Zimbabwe.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl">
            {/* Quote icon */}
            <Quote className="absolute top-6 left-6 h-10 w-10 text-[#008767]/15" />

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
                <p className="text-lg text-slate-700 leading-relaxed mb-8 font-medium italic">
                  "{t.text}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${t.avatarColor} text-sm font-bold text-white shadow-md`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-[#0B192C] text-base">{t.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-[#008767]">{t.service}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.date}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-[#008767]' : 'w-2.5 bg-slate-200'}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-[#008767] hover:bg-[#E6F4F1] transition-all"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-[#008767] hover:bg-[#E6F4F1] transition-all"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
