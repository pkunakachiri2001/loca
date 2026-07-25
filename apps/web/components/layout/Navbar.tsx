'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Menu, X, ChevronDown, Bell, Settings,
  LayoutDashboard, Building2, Shield, Heart, Bookmark, Gift, LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn, getInitials } from '@/lib/utils';

const navLinks = [
  { label: 'Find Services', href: '/search' },
  { label: 'Live GPS Tracking', href: '/tracking' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'For Companies', href: '/company/register' },
  { label: 'About', href: '/about' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/auth/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'COMPANY_OWNER') return '/company/dashboard';
    return '/dashboard';
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'border-b border-[#1E1E22] shadow-xl'
            : 'bg-transparent'
        )}
        style={isScrolled ? { background: 'rgba(14,14,16,0.96)', backdropFilter: 'blur(20px)' } : {}}
      >
        <div className="section-container">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#E8A547' }}>
                <Car className="h-4 w-4" style={{ color: '#0E0E10' }} />
              </div>
              <span className="font-display text-xl font-bold" style={{ color: '#F5F0E8' }}>
                Fleet<span style={{ color: '#E8A547' }}>Nest</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  style={{
                    color: pathname === link.href ? '#F5F0E8' : '#9A9A9E',
                    background: pathname === link.href ? 'rgba(255,255,255,0.06)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth & User CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  {/* Notification Bell */}
                  <Link
                    href="/dashboard/notifications"
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all"
                    style={{ background: '#1A1A1C', border: '1px solid #2E2E34', color: '#9A9A9E' }}
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-black" style={{ background: '#E8A547' }}>
                      3
                    </span>
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 text-sm transition-all"
                      style={{ background: '#1A1A1C', border: '1px solid #2E2E34', color: '#F5F0E8' }}
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg font-display text-xs font-bold"
                        style={{ background: '#E8A547', color: '#0E0E10' }}>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.firstName} className="h-7 w-7 rounded-lg object-cover" />
                        ) : (
                          getInitials(user.firstName, user.lastName)
                        )}
                      </div>
                      <span className="max-w-[110px] truncate font-medium">{user.firstName}</span>
                      <ChevronDown className={cn('h-4 w-4 transition-transform', isUserMenuOpen && 'rotate-180')} style={{ color: '#6B6B72' }} />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-60 rounded-xl p-1.5 shadow-2xl z-50"
                          style={{ background: '#1A1A1C', border: '1px solid #2E2E34' }}
                        >
                          <div className="px-3 py-2.5 mb-1 rounded-lg" style={{ background: '#242428' }}>
                            <p className="text-sm font-semibold truncate" style={{ color: '#F5F0E8' }}>{user.firstName} {user.lastName}</p>
                            <p className="text-xs truncate" style={{ color: '#6B6B72' }}>{user.email}</p>
                            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded mt-1.5"
                              style={{
                                background: user.role === 'ADMIN' ? 'rgba(248,113,113,0.15)' : user.role === 'COMPANY_OWNER' ? 'rgba(232,165,71,0.15)' : 'rgba(96,165,250,0.15)',
                                color: user.role === 'ADMIN' ? '#F87171' : user.role === 'COMPANY_OWNER' ? '#E8A547' : '#60A5FA',
                              }}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Customer options */}
                          {user.role === 'CUSTOMER' && (
                            <>
                              <Link href="/dashboard" className="sidebar-link">
                                <LayoutDashboard className="h-4 w-4 shrink-0" /> Overview Dashboard
                              </Link>
                              <Link href="/dashboard/bookings" className="sidebar-link">
                                <Bookmark className="h-4 w-4 shrink-0" /> My Bookings
                              </Link>
                              <Link href="/dashboard/wishlist" className="sidebar-link">
                                <Heart className="h-4 w-4 shrink-0" /> Saved Wishlist
                              </Link>
                              <Link href="/dashboard/loyalty" className="sidebar-link">
                                <Gift className="h-4 w-4 shrink-0" /> Loyalty Rewards
                              </Link>
                            </>
                          )}

                          {/* Company options */}
                          {user.role === 'COMPANY_OWNER' && (
                            <>
                              <Link href="/company/dashboard" className="sidebar-link">
                                <Building2 className="h-4 w-4 shrink-0" /> Provider Portal
                              </Link>
                              <Link href="/company/listings" className="sidebar-link">
                                <Car className="h-4 w-4 shrink-0" /> Manage Listings
                              </Link>
                              <Link href="/company/bookings" className="sidebar-link">
                                <Bookmark className="h-4 w-4 shrink-0" /> Customer Bookings
                              </Link>
                            </>
                          )}

                          {/* Admin options */}
                          {user.role === 'ADMIN' && (
                            <>
                              <Link href="/admin" className="sidebar-link">
                                <Shield className="h-4 w-4 shrink-0" /> Admin Control Center
                              </Link>
                              <Link href="/admin/companies" className="sidebar-link">
                                <Building2 className="h-4 w-4 shrink-0" /> Moderate Companies
                              </Link>
                            </>
                          )}

                          <Link href="/dashboard/profile" className="sidebar-link">
                            <Settings className="h-4 w-4 shrink-0" /> Account Settings
                          </Link>

                          <div className="mt-1 pt-1" style={{ borderTop: '1px solid #2E2E34' }}>
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
                              style={{ color: '#F87171' }}
                            >
                              <LogOut className="h-4 w-4" /> Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-ghost text-sm">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="btn-primary py-2 text-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="flex lg:hidden items-center justify-center h-9 w-9 rounded-xl"
              style={{ background: '#1A1A1C', border: '1px solid #2E2E34', color: '#F5F0E8' }}
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMobileOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-xs border-l p-6 pt-20 overflow-y-auto"
              style={{ background: '#0E0E10', borderColor: '#2E2E34' }}>
              {/* Mobile Nav Links */}
              <nav className="space-y-1 mb-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      className="block rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                      style={{ color: '#9A9A9E' }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Auth */}
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="card p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl font-display font-bold text-sm"
                        style={{ background: '#E8A547', color: '#0E0E10' }}>
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#F5F0E8' }}>{user.firstName} {user.lastName}</p>
                        <p className="text-xs" style={{ color: '#E8A547' }}>{user.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                  <Link href={getDashboardLink()} className="btn-primary w-full text-center">
                    Dashboard Portal
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary w-full justify-center" style={{ color: '#F87171', borderColor: 'rgba(248,113,113,0.3)' }}>
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/auth/login" className="btn-secondary w-full justify-center">Sign In</Link>
                  <Link href="/auth/register" className="btn-primary w-full justify-center">Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
      )}
    </>
  );
}
