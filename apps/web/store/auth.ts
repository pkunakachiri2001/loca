/**
 * FleetNest — Auth Store (Zustand)
 * Global client-side authentication state with SSR hydration tracking
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'COMPANY_OWNER' | 'ADMIN';
  avatar?: string;
  phone?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  loyaltyPoints: number;
  company?: {
    id: string;
    name: string;
    slug: string;
    status: string;
    logo?: string;
  };
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;

  // Actions
  setAuth: (user: AuthUser, accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  setHydrated: (hydrated: boolean) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,

      setAuth: (user, accessToken) => {
        set({ user, accessToken, isAuthenticated: true, isHydrated: true });
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      },

      setUser: (user) => {
        set({ user });
      },

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },

      updateUser: (partialUser) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...partialUser } });
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch {
          // Ignore errors on logout
        }
        delete apiClient.defaults.headers.common['Authorization'];
        set({ user: null, accessToken: null, isAuthenticated: false, isHydrated: true });
      },

      refreshAuth: async () => {
        try {
          set({ isLoading: true });
          const res = await apiClient.post('/auth/refresh');
          const { accessToken } = res.data.data;
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          set({ accessToken, isLoading: false, isHydrated: true });

          const meRes = await apiClient.get('/auth/me');
          set({ user: meRes.data.data, isAuthenticated: true, isHydrated: true });
        } catch {
          delete apiClient.defaults.headers.common['Authorization'];
          set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, isHydrated: true });
        }
      },
    }),
    {
      name: 'fleetnest-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`;
        }
        state?.setHydrated(true);
      },
    }
  )
);
