/**
 * Toast Primitives — Simple implementation for FleetNest
 * A simplified version compatible with the toaster component
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ToastProps {
  className?: string;
  variant?: 'default' | 'destructive';
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function ToastViewport({ className }: { className?: string }) {
  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm',
      className
    )} />
  );
}

export function Toast({ className, variant = 'default', children, ...props }: ToastProps) {
  return (
    <div
      className={cn(
        'glass-card flex w-full items-center justify-between rounded-xl p-4 shadow-lg border',
        variant === 'destructive' ? 'border-red-500/30 bg-red-500/10' : 'border-white/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ToastTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-sm font-semibold text-white', className)}>{children}</p>;
}

export function ToastDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-xs text-slate-400 mt-0.5', className)}>{children}</p>;
}

export function ToastClose({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn('text-slate-500 hover:text-white transition-colors shrink-0 ml-2', className)}
    >
      <X className="h-4 w-4" />
    </button>
  );
}

export function ToastAction({ className, children, altText, onClick }: {
  className?: string;
  children: React.ReactNode;
  altText?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={altText}
      className={cn('text-xs text-blue-400 hover:text-blue-300 font-medium ml-2', className)}
    >
      {children}
    </button>
  );
}
