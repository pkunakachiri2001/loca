/**
 * FleetNest — Utility Functions
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format currency in USD */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format date */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-ZW', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

/** Truncate text */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/** Generate star array for ratings */
export function getStars(rating: number): ('full' | 'half' | 'empty')[] {
  const stars: ('full' | 'half' | 'empty')[] = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push('full');
    else if (rating >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }
  return stars;
}

/** Get booking status color */
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    CONFIRMED: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    ACTIVE: 'text-green-400 bg-green-400/10 border-green-400/30',
    COMPLETED: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    CANCELLED: 'text-red-400 bg-red-400/10 border-red-400/30',
    REJECTED: 'text-red-400 bg-red-400/10 border-red-400/30',
  };
  return map[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/30';
}

/** Get category label */
export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    CAR_RENTAL: 'Car Rental',
    BUS_RENTAL: 'Bus Rental',
    DRIVER: 'Professional Driver',
    MECHANIC: 'Mechanic',
    CAR_WASH: 'Restaurants',
    VEHICLE_DEALER: 'Vehicle Dealer',
    COURIER: 'Courier Vehicle',
    EMERGENCY_ROADSIDE: 'Emergency Roadside',
  };
  return map[category] || category;
}

/** Calculate number of days between dates */
export function daysBetween(start: Date, end: Date): number {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

/** Get initials from name */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/** Format a number with K/M suffix */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/** Debounce function */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** WhatsApp link generator */
export function getWhatsAppLink(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message || 'Hello, I found you on FleetNest and I am interested in your service.');
  return `https://wa.me/${cleaned}?text=${encoded}`;
}
