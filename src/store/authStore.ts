/**
 * Auth store — Zustand + expo-secure-store
 *
 * Phase F1: Fully wired auth flow.
 * Field names match the MongoDB `users` collection (Spec §2.1) exactly.
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getMe } from '@/services/authApi';

const SECURE_STORE_TOKEN_KEY = 'auth_token';

// ---------------------------------------------------------------------------
// Types — mirrors the users collection (Spec §2.1), minus password_hash
// ---------------------------------------------------------------------------
export interface User {
  _id: string;
  full_name: string;
  email: string;
  role: 'staff' | 'reviewer';
  facility_name: string;
  consent_accepted_at: string | null;
  created_at: string;
  last_login_at: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  /** Persist auth credentials after login/register */
  setAuth: (user: User, token: string) => Promise<void>;

  /** Update user object without touching token (e.g. after consent) */
  setUser: (user: User) => void;

  /** Clear credentials on logout or 401 */
  clearAuth: () => Promise<void>;

  /**
   * Restore persisted token on app start.
   * Calls GET /auth/me to rehydrate the full user profile.
   * Returns the user if successful, null otherwise.
   */
  loadToken: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user: User, token: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.setItem(SECURE_STORE_TOKEN_KEY, token);
    } else {
      try {
        await SecureStore.setItemAsync(SECURE_STORE_TOKEN_KEY, token);
      } catch {
        // SecureStore may not be available
      }
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  setUser: (user: User) => {
    set({ user });
  },

  clearAuth: async () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.removeItem(SECURE_STORE_TOKEN_KEY);
    } else {
      try {
        await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
      } catch {
        // Ignore cleanup errors
      }
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  loadToken: async () => {
    try {
      let token: string | null = null;
      if (Platform.OS === 'web') {
        token = typeof window !== 'undefined' ? window.localStorage.getItem(SECURE_STORE_TOKEN_KEY) : null;
      } else {
        token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY);
      }

      if (!token) {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        return null;
      }

      // Token found — set it in state so the API interceptor can use it,
      // then call GET /auth/me to rehydrate the full user profile
      set({ token });

      const user = await getMe();
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch {
      // Token expired or invalid — clear everything
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.localStorage.removeItem(SECURE_STORE_TOKEN_KEY);
      } else {
        try {
          await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
        } catch {
          // Ignore
        }
      }
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },
}));
