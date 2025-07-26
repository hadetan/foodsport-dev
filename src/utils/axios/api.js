import axios from 'axios';
import { BASE_URLS, DEFAULT_TIMEOUT } from './config';
import { supabaseClient } from '@/lib/supabase/client';
// import { cookies } from 'next/headers';


/**
 * Axios API Utility
 *
 * Usage Example:
 * import api from '@/utils/axios/api';
 *
 * // GET request
 * api.get('/api/admin/dashboard').then(res => {
 *   console.log(res.data);
 * });
 *
 * // Extending interceptors
 * api.interceptors.response.use(
 *   response => response,
 *   error => {
 *     // Custom error handling
 *     return Promise.reject(error);
 *   }
 * );
 */
const api = axios.create({
  baseURL: BASE_URLS.url,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const tokenMatch = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        const refreshMatch = document.cookie.match(/(^|;)\s*refresh_token=([^;]*)/);
        const refreshToken = refreshMatch ? decodeURIComponent(refreshMatch[2]) : null;
        const { data: { session }, error: refreshError } = await supabaseClient.auth.refreshSession({ refresh_token: refreshToken});
        if (refreshError || !session?.access_token) {
          showApiError(refreshError || { message: 'Failed to refresh session.' });
          document.cookie = null;
          return Promise.reject(error);
        }
        error.config.headers['Authorization'] = `Bearer ${session.access_token}`;
        localStorage.setItem("auth_token", session.access_token);
        return api.request(error.config);
      } catch (refreshError) {
        showApiError(refreshError);
        console.error(refreshError || 'no refresh error found, and you have been logged out for some reason')
        return Promise.reject(refreshError);
      }
    }
    showApiError(error);
    return Promise.reject(error);
  }
);

/**
 * Displays a user-friendly error message for API failures.
 * You can replace this with a toast, modal, or any UI feedback system.
 */
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