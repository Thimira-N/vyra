/**
 * Axios HTTP client for the Clinical RSS App Backend.
 *
 * - Base URL points at the deployed HF Space
 * - Request interceptor attaches JWT from expo-secure-store
 * - Response interceptor handles 401 (expired/invalid token)
 */

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/config';

const SECURE_STORE_TOKEN_KEY = 'auth_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach JWT from SecureStore on every request
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore may throw on web — proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor — handle 401 (token expired / invalid)
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
      } catch {
        // Ignore SecureStore errors during cleanup
      }
      // Auth store / navigation will handle the redirect to login
      // in Phase F1 when auth flow is fully wired.
    }
    return Promise.reject(error);
  },
);

export default api;
