'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Building2, Car, Bookmark, CreditCard, Star, Tag, Shield
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
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="hidden lg:flex flex-col w-56 shrink-0 min-h-screen border-r pt-8 pb-6 px-3"
      style={{ background: '#0E0E10', borderColor: '#1E1E22' }}
    >
      {/* Admin badge */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)' }}>
          <Shield className="h-4 w-4" style={{ color: '#F87171' }} />
        </div>
        <span className="font-display font-semibold text-sm" style={{ color: '#F5F0E8' }}>Admin Panel</span>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: '#3A3A3E' }}>
        Platform
      </p>

      <nav className="space-y-1">
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
    </aside>
  );
}
