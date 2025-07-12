import axios from 'axios';
import { BASE_URLS, DEFAULT_TIMEOUT } from './config';
import { supabaseClient } from '@/lib/supabase/client';


const api = axios.create({
  baseURL: BASE_URLS.url,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session?.access_token) {
    config.headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        const { data: { session } } = await supabaseClient.auth.refreshSession();
        if (session?.access_token) {
          error.config.headers['Authorization'] = `Bearer ${session.access_token}`;
          return api.request(error.config);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
