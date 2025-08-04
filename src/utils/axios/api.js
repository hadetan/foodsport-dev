import axios from 'axios';
import { BASE_URLS, DEFAULT_TIMEOUT } from './config';
import { getSupabaseClient } from '../../lib/supabase/index'

const supabaseClient = getSupabaseClient();

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
        const { data: { session }, error: refreshError } = await supabaseClient.auth.refreshSession();
        if (refreshError || !session?.access_token) {
          showApiError(refreshError || { message: 'Failed to refresh session.' });
          document.cookie = 'auth_token=; Max-Age=0; path=/;';
          localStorage.removeItem('auth_token');
          return Promise.reject(error);
        }
        error.config.headers['Authorization'] = `Bearer ${session.access_token}`;
        document.cookie = `auth_token=${encodeURIComponent(session.access_token)}; path=/; max-age=${session.expires_in || 3600};`;
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