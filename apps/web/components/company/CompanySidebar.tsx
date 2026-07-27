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
    <aside
      className="hidden lg:flex flex-col w-56 shrink-0 min-h-screen border-r pt-8 pb-6 px-3"
      style={{ background: '#0E0E10', borderColor: '#1E1E22' }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(232,165,71,0.15)', border: '1px solid rgba(232,165,71,0.3)' }}>
          <Building2 className="h-4 w-4" style={{ color: '#E8A547' }} />
        </div>
        <span className="font-display font-semibold text-sm" style={{ color: '#F5F0E8' }}>Company Portal</span>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: '#3A3A3E' }}>
        Manage
      </p>

      <nav className="space-y-1 mb-6">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn('sidebar-link', active && 'active')}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Quick action */}
      <Link href="/company/listings/new" className="btn-primary mx-3 justify-center text-sm py-2.5">
        <Plus className="h-4 w-4" /> New Listing
      </Link>

      {/* Bottom */}
      <div className="mt-auto pt-6" style={{ borderTop: '1px solid #1E1E22' }}>
        <Link href="/company/settings" className="sidebar-link">
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
