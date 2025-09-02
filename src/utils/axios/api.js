import axios from 'axios';
import { BASE_URLS, DEFAULT_TIMEOUT } from './config';
import { setupGlobalLoadingBarForAxios } from '@/utils/loadingBarEvents';

const api = axios.create({
  baseURL: BASE_URLS.url,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup global loading bar for axios
if (typeof window !== 'undefined') {
  setupGlobalLoadingBarForAxios(api);
}

// Request interceptor is not needed in our app

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        // Admin API handling
        if (error.config?.url?.includes('/admin/')) {
          // ...existing code for admin refresh...
          if (error.config?.url?.includes('/admin/auth/refresh')) {
            await api.delete('/admin/auth/logout');
            localStorage.removeItem('admin_auth_token');
            localStorage.removeItem('admin_refresh_token');
            window.location.href = '/admin/login';
            return Promise.reject(error);
          }
          const refreshRes = await api.post('/admin/auth/refresh');
          const { session } = refreshRes.data;
          if (!session || !session.access_token) {
            showApiError({ message: 'Failed to refresh admin session.' });
            await api.delete('/admin/auth/logout');
            localStorage.removeItem('admin_auth_token');
            localStorage.removeItem('admin_refresh_token');
            window.location.href = '/admin/login';
            return Promise.reject(error);
          }
          error.config.headers['Authorization'] = `Bearer ${session.access_token}`;
          localStorage.setItem('admin_auth_token', session.access_token);
          if (session.refresh_token) {
            localStorage.setItem('admin_refresh_token', session.refresh_token);
          }
          return api.request(error.config);
        }
        // User API refresh logic
        // Avoid retry loop if the failing call is already the user refresh endpoint
        if (error.config?.url?.includes('/auth/refresh')) {
          // Only logout if refresh itself fails
          await api.delete('/auth/logout');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          return Promise.reject(error);
        }
        // Attempt to refresh user session
        const refreshRes = await api.post('/auth/refresh');
        const { session } = refreshRes.data;
        if (!session || !session.access_token) {
          showApiError({ message: 'Failed to refresh user session.' });
          await api.delete('/auth/logout');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          return Promise.reject(error);
        }
        // Update Authorization header and localStorage for user
        error.config.headers['Authorization'] = `Bearer ${session.access_token}`;
        localStorage.setItem('auth_token', session.access_token);
        if (session.refresh_token) {
          localStorage.setItem('refresh_token', session.refresh_token);
        }
        return api.request(error.config);
      } catch (refreshError) {
        showApiError(refreshError);
        // Determine if admin or user
        if (error.config?.url?.includes('/admin/')) {
          await api.delete('/admin/auth/logout');
          localStorage.removeItem('admin_auth_token');
          localStorage.removeItem('admin_refresh_token');
          window.location.href = '/admin/login';
        } else {
          await api.delete('/auth/logout');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }
    showApiError(error);
    return Promise.reject(error);
  }
);

function showApiError(error) {
  let message = 'An unexpected error occurred.';
  if (error.response && error.response.data && error.response.data.error) {
    message = error.response.data.error;
  } else if (error.message) {
    message = error.message;
  }
  console.error('API Error:', message);
}

export default api;