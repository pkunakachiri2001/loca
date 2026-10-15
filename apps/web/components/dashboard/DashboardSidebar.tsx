'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Bookmark, Heart, Gift, User, Settings, Bell, MapPin, DollarSign, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/bookings', label: 'Bookings', icon: Bookmark },
  { href: '/dashboard/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/loyalty', label: 'Rewards', icon: Gift },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/tracking', label: 'GPS & Map', icon: MapPin },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 min-h-screen border-r border-slate-200 bg-white pt-8 pb-6 px-4">
      {/* Section label */}
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-3">
        My Account
      </p>

      <nav className="space-y-1.5">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                active
                  ? 'bg-[#E6F4F1] text-[#008767] font-bold shadow-sm'
                  : 'text-slate-600 hover:text-[#008767] hover:bg-slate-50'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Currency & Region Badge for Dashboard */}
      <div className="mt-8 p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Globe className="h-3.5 w-3.5 text-[#008767]" />
          <span>Region: Zimbabwe</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#008767]">
          <DollarSign className="h-3.5 w-3.5 text-[#008767]" />
          <span>Currency: USD ($)</span>
        </div>
      </div>

      {/* Bottom divider + settings shortcut */}
      <div className="mt-auto pt-6 border-t border-slate-200">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-[#008767] hover:bg-slate-50 transition-all"
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
