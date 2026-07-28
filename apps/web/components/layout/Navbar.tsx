'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Menu, X, ChevronDown, Bell, Settings,
  LayoutDashboard, Building2, Shield, Heart, Bookmark, Gift, LogOut, Compass
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn, getInitials } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/search' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Live GPS', href: '/tracking' },
  { label: 'For Providers', href: '/company/register' },
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
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm'
            : 'bg-white/80 backdrop-blur-sm border-b border-slate-100'
        )}
      >
        <div className="section-container">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center group py-1">
              <img
                src="/logo.jpeg"
                alt="Famba"
                className="h-11 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-50/80 p-1.5 rounded-full border border-slate-200/80">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                  style={{
                    color: pathname === link.href ? '#008767' : '#475569',
                    background: pathname === link.href ? '#FFFFFF' : 'transparent',
                    boxShadow: pathname === link.href ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
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
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-all border border-slate-200"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white bg-[#008767]">
                      3
                    </span>
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm transition-all bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-[#0B192C]"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg font-display text-xs font-bold bg-[#008767] text-white">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.firstName} className="h-7 w-7 rounded-lg object-cover" />
                        ) : (
                          getInitials(user.firstName, user.lastName)
                        )}
                      </div>
                      <span className="max-w-[110px] truncate font-bold">{user.firstName}</span>
                      <ChevronDown className={cn('h-4 w-4 text-slate-500 transition-transform', isUserMenuOpen && 'rotate-180')} />
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-64 rounded-2xl p-2 shadow-xl border border-slate-200 bg-white z-50"
                        >
                          <div className="px-3.5 py-3 mb-1 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-sm font-bold text-[#0B192C] truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1.5 bg-[#E6F4F1] text-[#008767] border border-[#B2E3D8]">
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

                          <div className="mt-1 pt-1 border-t border-slate-100">
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
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
                  <Link href="/auth/login" className="px-5 py-2.5 rounded-full text-sm font-bold text-[#008767] bg-white border border-[#008767] hover:bg-[#E6F4F1] transition-all">
                    Login
                  </Link>
                  <Link href="/auth/register" className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-[#008767] hover:bg-[#007358] shadow-md shadow-[#008767]/20 transition-all">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="flex lg:hidden items-center justify-center h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-[#0B192C]"
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
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsMobileOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-xs bg-white border-l border-slate-200 p-6 pt-24 overflow-y-auto">
              {/* Mobile Nav Links */}
              <nav className="space-y-1.5 mb-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:text-[#008767] hover:bg-[#E6F4F1] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Auth */}
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <div className="card p-4 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm bg-[#008767] text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#0B192C]">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-[#008767] font-semibold">{user.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                  <Link href={getDashboardLink()} className="btn-primary w-full text-center">
                    Dashboard Portal
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary w-full justify-center text-red-600 border-red-200 hover:bg-red-50">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/auth/login" className="btn-secondary w-full justify-center rounded-full">Login</Link>
                  <Link href="/auth/register" className="btn-primary w-full justify-center rounded-full">Sign Up</Link>
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
