import axios from 'axios';
import { BASE_URLS, DEFAULT_TIMEOUT } from './config';
import { getSupabaseClient } from '@/lib/supabase/index'

const api = axios.create({
  baseURL: BASE_URLS.url,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor is not needed in our app

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        // Avoid retry loop if the failing call is already the refresh endpoint
        if (error.config?.url?.includes('/auth/refresh')) {
          await api.delete('/auth/logout');
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Attempt to refresh session using Supabase client
        const { data: { session }, error: refreshError } = await getSupabaseClient().auth.refreshSession();
        if (refreshError || !session) {
          console.warn('Session refresh failed:', refreshError);
          showApiError(refreshError || { message: 'Failed to refresh session.' });
          await api.delete('/auth/logout');
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Send session to refresh API to update cookies
        const refreshRes = await api.post('/auth/refresh', { session });
        const { access_token } = refreshRes.data;
        if (!access_token) {
          console.warn('Refresh API did not return a new access token.');
          showApiError({ message: 'Failed to refresh session.' });
          await api.delete('/auth/logout');
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Update Authorization header and localStorage
        error.config.headers['Authorization'] = `Bearer ${access_token}`;
        localStorage.setItem('auth_token', access_token);
        return api.request(error.config);
      } catch (refreshError) {
        console.error('Unexpected error during session refresh:', refreshError);
        showApiError(refreshError);
        await api.delete('/auth/logout');
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
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