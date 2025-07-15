import axios from 'axios';
import { BASE_URLS, DEFAULT_TIMEOUT } from './config';
import { supabaseClient } from '@/lib/supabase/client';


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
  const { data: { session } } = await supabaseClient.auth?.getSession();
  if (session?.access_token) {
    config.headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle authentication errors (token expired)
    if (error.response && error.response.status === 401) {
      try {
        const { data: { session } } = await supabaseClient.auth.refreshSession();
        if (session?.access_token) {
          error.config.headers['Authorization'] = `Bearer ${session.access_token}`;
          return api.request(error.config);
        }
      } catch (refreshError) {
        showApiError(refreshError);
        return Promise.reject(refreshError);
      }
    }
    // Global error handler for all API failures
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
  // For now, just log. Replace with your UI notification system as needed.
  // Example: toast.error(message);
  console.error('API Error:', message);
}

export default api;