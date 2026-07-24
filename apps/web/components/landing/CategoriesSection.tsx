'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Car, Bus, User, Wrench, Droplets, Store, Package, TriangleAlert } from 'lucide-react';

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
    label: 'Bus Charters',
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
    icon: Droplets,
    label: 'Car Wash & Spa',
    description: 'Professional cleaning, detailing & ceramic coating',
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
    label: 'Courier Vehicles',
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
  return (
    <section id="categories" className="py-24 relative" style={{ borderTop: '1px solid #1E1E22' }}>
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
          <h2 className="font-display text-4xl font-bold text-white md:text-5xl mb-4">
            Everything You Need,{' '}
            <span style={{ color: '#E8A547' }}>One Platform</span>
          </h2>
          <p className="max-w-xl mx-auto text-base" style={{ color: '#9A9A9E' }}>
            From daily car rentals to emergency roadside assistance, FleetNest connects you with Nigeria's best verified service providers.
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <Link href={cat.href} className="block group">
                <div
                  className="card p-6 h-full transition-all duration-300 group-hover:-translate-y-1"
                  style={{
                    background: '#1A1A1C',
                    border: '1px solid #2E2E34',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#E8A547';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2E2E34';
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: 'rgba(232,165,71,0.1)',
                      border: '1px solid rgba(232,165,71,0.25)',
                    }}
                  >
                    <cat.icon className="h-5 w-5" style={{ color: '#E8A547' }} />
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-semibold text-lg mb-1" style={{ color: '#F5F0E8' }}>{cat.label}</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: '#6B6B72' }}>{cat.description}</p>

                  {/* Count */}
                  <div className="text-xs font-medium flex items-center gap-1" style={{ color: '#E8A547' }}>
                    <span>{cat.count}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
