'use client';

import Link from 'next/link';
import { Twitter, Instagram, Linkedin, Facebook, Youtube, Mail, Phone, MapPin, Building2, User } from 'lucide-react';

const footerLinks = {
  services: [
    { label: 'Car Rentals', href: '/search?category=CAR_RENTAL' },
    { label: 'Bus Hire', href: '/search?category=BUS_RENTAL' },
    { label: 'Spare Parts', href: '/search?category=DRIVER' },
    { label: 'Workshops & Repairs', href: '/search?category=MECHANIC' },
    { label: 'Deliveries & Courier', href: '/search?category=COURIER' },
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
    <footer className="bg-white border-t border-slate-200 text-slate-700">
      <div className="section-container pt-16 pb-8">
        {/* Top Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 mb-12">
          {/* Brand & Corporate info */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4 group">
              <img
                src="/logo.jpeg"
                alt="Famba"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Zimbabwe&apos;s all-in-one smart travel, transportation, and vehicle services marketplace. Move more, live better.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-bold text-sm text-[#0B192C] mb-4">Services</h4>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-[#008767] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-sm text-[#0B192C] mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-[#008767] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-bold text-sm text-[#0B192C] mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-[#008767] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-bold text-sm text-[#0B192C] mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-600 hover:text-[#008767] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Famba Technologies Ltd (KUNAKA TECH). All rights reserved.</p>
          <div className="flex items-center gap-3">
            {socials.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#E6F4F1] hover:text-[#008767] transition-colors"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
