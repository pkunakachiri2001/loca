'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Car, Bus, User, Wrench, Utensils, Store, Package, TriangleAlert } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

const categories = [
  {
    icon: Car,
    label: 'Car Rentals',
    description: 'Self-drive & chauffeur-driven cars for any occasion',
    href: '/search?category=CAR_RENTAL',
    count: '250+ listings',
  },
  {
    icon: Bus,
    label: 'Bus Hire',
    description: 'Buses for events, group tours & corporate travel',
    href: '/search?category=BUS_RENTAL',
    count: '80+ listings',
  },
  {
    icon: User,
    label: 'Pro Drivers',
    description: 'Certified & background-checked executive drivers',
    href: '/search?category=DRIVER',
    count: '500+ drivers',
  },
  {
    icon: Wrench,
    label: 'Mechanics',
    description: 'Auto repair, maintenance & diagnostic services',
    href: '/search?category=MECHANIC',
    count: '120+ workshops',
  },
  {
    icon: Utensils,
    label: 'Restaurants & Dining',
    description: 'Find local eateries, diners & luxury restaurants',
    href: '/search?category=CAR_WASH',
    count: '200+ centers',
  },
  {
    icon: Store,
    label: 'Vehicle Dealers',
    description: 'Buy & sell verified new and used vehicles',
    href: '/search?category=VEHICLE_DEALER',
    count: '60+ dealers',
  },
  {
    icon: Package,
    label: 'Courier & Deliveries',
    description: 'Delivery vans, trucks & cargo transport',
    href: '/search?category=COURIER',
    count: '90+ vehicles',
  },
  {
    icon: TriangleAlert,
    label: 'Emergency Roadside',
    description: '24/7 breakdown recovery & towing assistance',
    href: '/search?category=EMERGENCY_ROADSIDE',
    count: '40+ teams',
  },
];

export function CategoriesSection() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  return (
    <section id="categories" className="py-24 relative bg-white border-t border-slate-200">
      <div className="section-container">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="section-badge mb-4 inline-flex">8 Service Categories</span>
          <h2 className="font-display text-4xl font-extrabold text-[#0B192C] md:text-5xl mb-4">
            Everything You Need,{' '}
            <span className="text-[#008767]">One Platform</span>
          </h2>
          <p className="max-w-xl mx-auto text-base text-slate-600 font-medium">
            From daily car rentals to emergency roadside assistance and deliveries, Famba connects you with Zimbabwe's best verified service providers.
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <div 
                className="block group cursor-pointer"
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push('/auth/login');
                  } else {
                    router.push(cat.href);
                  }
                }}
              >
                <div className="bg-white rounded-2xl p-6 h-full border border-slate-200 shadow-sm group-hover:border-[#008767] group-hover:-translate-y-1.5 group-hover:shadow-md transition-all duration-300">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                    <cat.icon className="h-6 w-6 text-[#008767]" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-bold text-lg text-[#0B192C] mb-1.5">{cat.label}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{cat.description}</p>

                  {/* Count */}
                  <div className="text-xs font-bold text-[#008767] flex items-center gap-1">
                    <span>{cat.count}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
