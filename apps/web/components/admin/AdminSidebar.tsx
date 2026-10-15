'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, Car, Bookmark, CreditCard, Star, Tag, Shield, MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/companies', label: 'Companies', icon: Building2 },
  { href: '/admin/listings', label: 'Listings', icon: Car },
  { href: '/admin/bookings', label: 'Bookings', icon: Bookmark },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/tracking', label: 'GPS & Map', icon: MapPin },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 min-h-screen bg-white border-r border-slate-200 pt-6 pb-6 px-3">
      {/* Admin badge */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
          <Shield className="h-4 w-4" />
        </div>
        <div>
          <span className="font-display font-bold text-sm text-[#0B192C]">Super Admin</span>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Famba Zimbabwe</p>
        </div>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
        Platform Operations
      </p>

      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all',
                active
                  ? 'bg-[#E6F4F1] text-[#008767] border border-[#B2E3D8] shadow-sm'
                  : 'text-slate-600 hover:text-[#008767] hover:bg-slate-50'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
