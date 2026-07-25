/**
 * FleetNest — Axios API Client
 * Centralized HTTP client with interceptors
 */

import axios from 'axios';

// In the browser, always call /api (same origin) so Next.js rewrites proxy it
// to the Express backend — completely avoiding CORS restrictions.
// On the server side (SSR), use the full absolute API URL directly.
const baseURL =
  process.env.NEXT_PUBLIC_API_URL || 'https://loca-api.vercel.app/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true, // Send cookies for refresh token
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach access token from store
apiClient.interceptors.request.use(
  (config) => {
    // Token is set directly on axios defaults by the auth store
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason: any) => void }> = [];

function processQueue(error: Error | null, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }
      if (isRefreshing) {
        // Queue request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await apiClient.post('/auth/refresh');
        const { accessToken } = res.data.data;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        // Update Zustand store token
        const { useAuthStore } = await import('@/store/auth');
        useAuthStore.getState().refreshAuth();

        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        // Clear auth state
        const { useAuthStore } = await import('@/store/auth');
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login?session=expired';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
