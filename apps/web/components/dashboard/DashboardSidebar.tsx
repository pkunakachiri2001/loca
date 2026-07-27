'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Bookmark, Heart, Gift, User, Settings, Bell, MapPin
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
    <aside
      className="hidden lg:flex flex-col w-56 shrink-0 min-h-screen border-r pt-8 pb-6 px-3"
      style={{ background: '#0E0E10', borderColor: '#1E1E22' }}
    >
      {/* Section label */}
      <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: '#3A3A3E' }}>
        My Account
      </p>

      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'sidebar-link',
                active && 'active'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom divider + settings shortcut */}
      <div className="mt-auto pt-6" style={{ borderTop: '1px solid #1E1E22' }}>
        <Link href="/dashboard/profile" className="sidebar-link">
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
