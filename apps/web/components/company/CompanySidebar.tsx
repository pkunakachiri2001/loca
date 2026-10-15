'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Car, Bookmark, BarChart3, Settings, Plus, Building2, MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/company/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/company/listings', label: 'Listings', icon: Car },
  { href: '/company/bookings', label: 'Bookings', icon: Bookmark },
  { href: '/company/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/tracking', label: 'GPS & Map', icon: MapPin },
];

export function CompanySidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 min-h-screen bg-white border-r border-slate-200 pt-6 pb-6 px-3">
      {/* Portal badge */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-[#E6F4F1] border border-[#B2E3D8] text-[#008767] flex items-center justify-center">
          <Building2 className="h-4 w-4" />
        </div>
        <div>
          <span className="font-display font-bold text-sm text-[#0B192C]">Provider Portal</span>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Zimbabwe Hub</p>
        </div>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
        Manage Fleet
      </p>

      <nav className="space-y-1 mb-6">
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

      {/* Quick action */}
      <Link
        href="/company/listings/new"
        className="mx-2 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007358] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
      >
        <Plus className="h-4 w-4" /> New Listing
      </Link>

      {/* Bottom */}
      <div className="mt-auto pt-4 border-t border-slate-200">
        <Link
          href="/company/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-[#008767] hover:bg-slate-50 transition"
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
