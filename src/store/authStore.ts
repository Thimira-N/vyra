/**
 * Auth store — Zustand + expo-secure-store
 *
 * Skeleton for Phase F0. Full auth flow (login/register/consent) wired in F1.
 * Field names match the MongoDB `users` collection (Spec §2.1) exactly.
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

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
  last_login_at: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  /** Persist auth credentials after login/register */
  setAuth: (user: User, token: string) => Promise<void>;

  /** Clear credentials on logout or 401 */
  clearAuth: () => Promise<void>;

  /** Restore persisted token on app start (called from splash) */
  loadToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user: User, token: string) => {
    try {
      await SecureStore.setItemAsync(SECURE_STORE_TOKEN_KEY, token);
    } catch {
      // SecureStore may not be available on web
    }
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  clearAuth: async () => {
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
    } catch {
      // Ignore cleanup errors
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY);
      set({ token, isAuthenticated: !!token, isLoading: false });
      return token;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },
}));
