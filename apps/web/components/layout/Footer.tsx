'use client';

import Link from 'next/link';
import { Car, Twitter, Instagram, Linkedin, Facebook, Youtube, Mail, Phone, MapPin, Building2, User } from 'lucide-react';

const footerLinks = {
  services: [
    { label: 'Car Rentals', href: '/search?category=CAR_RENTAL' },
    { label: 'Bus Charters', href: '/search?category=BUS_RENTAL' },
    { label: 'Professional Drivers', href: '/search?category=DRIVER' },
    { label: 'Mechanics', href: '/search?category=MECHANIC' },
    { label: 'Car Wash', href: '/search?category=CAR_WASH' },
    { label: 'Vehicle Dealers', href: '/search?category=VEHICLE_DEALER' },
    { label: 'Courier Vehicles', href: '/search?category=COURIER' },
    { label: 'Emergency Roadside', href: '/search?category=EMERGENCY_ROADSIDE' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Careers', href: '/about#team' },
    { label: 'List Your Business', href: '/company/register' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Safety Guarantee', href: '/safety' },
    { label: 'Cancellation Policy', href: '/cancellation' },
  ],
};

const socials = [
  { Icon: Twitter, href: '#', label: 'Twitter' },
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Linkedin, href: '#', label: 'LinkedIn' },
  { Icon: Facebook, href: '#', label: 'Facebook' },
  { Icon: Youtube, href: '#', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="relative border-t" style={{ borderColor: '#1E1E22' }}>
      <div className="relative section-container pt-16 pb-8">
        {/* Top Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 mb-12">
          {/* Brand & Corporate info */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl font-bold" style={{ background: '#E8A547', color: '#0E0E10' }}>
                <Car className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Fleet<span style={{ color: '#E8A547' }}>Nest</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#9A9A9E' }}>
              Africa's premier transportation marketplace powered by <strong style={{ color: '#F5F0E8' }}>KUNAKA TECH</strong>.
            </p>

            {/* KUNAKA TECH Contact Info */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#E8A547' }}>
                <Building2 className="h-3.5 w-3.5" /> KUNAKA TECH
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#C8C0B0' }}>
                <User className="h-3.5 w-3.5" style={{ color: '#E8A547' }} />
                <span>Locardia Munyuki (HR Manager)</span>
              </div>
              <a href="mailto:HRmanager@kunakatech.tech" className="flex items-center gap-2 text-xs transition-colors hover:underline" style={{ color: '#9A9A9E' }}>
                <Mail className="h-3.5 w-3.5" style={{ color: '#E8A547' }} />
                HRmanager@kunakatech.tech
              </a>
              <a href="tel:+917796787966" className="flex items-center gap-2 text-xs transition-colors hover:underline" style={{ color: '#9A9A9E' }}>
                <Phone className="h-3.5 w-3.5" style={{ color: '#E8A547' }} />
                +91 7796787966
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4" style={{ color: '#F5F0E8' }}>Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors" style={{ color: '#9A9A9E' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4" style={{ color: '#F5F0E8' }}>Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors" style={{ color: '#9A9A9E' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4" style={{ color: '#F5F0E8' }}>Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors" style={{ color: '#9A9A9E' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-sm mb-4" style={{ color: '#F5F0E8' }}>Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors" style={{ color: '#9A9A9E' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="card p-6 mb-10 md:flex items-center justify-between gap-8">
          <div className="mb-4 md:mb-0">
            <h4 className="font-display font-semibold mb-1" style={{ color: '#F5F0E8' }}>Stay updated with KUNAKA TECH</h4>
            <p className="text-sm" style={{ color: '#6B6B72' }}>Get the latest fleet updates, deals, and announcements.</p>
          </div>
          <form className="flex gap-3 flex-1 max-w-md" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="input-dark flex-1"
            />
            <button type="submit" className="btn-primary px-6 py-3 text-sm shrink-0">
              Subscribe
            </button>
          </form>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6" style={{ borderTop: '1px solid #1E1E22' }}>
          <p className="text-xs" style={{ color: '#5A5A60' }}>
            © {new Date().getFullYear()} KUNAKA TECH — FleetNest. All rights reserved. Managed by Locardia Munyuki.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all"
                style={{ background: '#1A1A1C', borderColor: '#2E2E34', color: '#9A9A9E' }}
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs" style={{ color: '#5A5A60' }}>
            <span>Made by</span>
            <strong style={{ color: '#E8A547' }}>KUNAKA TECH</strong>
          </div>
        </div>
      </div>
    </footer>
  );
}
