/**
 * FleetNest — Toast Hook (simplified)
 * Compatible with shadcn/ui toast pattern
 */

import { useState } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

// Global toast state (simplified implementation)
let toastFn: ((options: ToastOptions) => void) | null = null;

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastOptions & { id: string }>>([]);

  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...options, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, options.duration || 5000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toast, toasts, dismiss };
}

export type { ToastOptions };
