/**
 * Settings store — Zustand + expo-secure-store persistence
 *
 * Phase U0: Holds user preferences for theming and accessibility.
 * Mirrors authStore conventions (same persistence pattern).
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SETTINGS_STORE_KEY = 'vyra_settings';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeMode = 'system' | 'light' | 'dark';
export type GlassIntensity = 'off' | 'reduced' | 'full';

export interface NotificationPrefs {
  /** Master push notification toggle */
  pushEnabled: boolean;
  /** New case assigned (reviewer-only) */
  newCaseAssigned: boolean;
  /** Assessment reviewed / risk result ready (staff-only) */
  assessmentReviewed: boolean;
  /** System announcements */
  systemAnnouncements: boolean;
}

interface SettingsState {
  themeMode: ThemeMode;
  reduceMotion: boolean;
  glassIntensity: GlassIntensity;
  notificationPrefs: NotificationPrefs;
  isHydrated: boolean;

  /** Update theme mode */
  setThemeMode: (mode: ThemeMode) => void;

  /** Update reduce motion preference */
  setReduceMotion: (enabled: boolean) => void;

  /** Update glass intensity */
  setGlassIntensity: (intensity: GlassIntensity) => void;

  /** Update notification preferences */
  setNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;

  /** Hydrate from persistent storage on app start */
  hydrate: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Persistence helpers (mirror authStore's pattern)
// ---------------------------------------------------------------------------

async function persistSettings(state: Pick<SettingsState, 'themeMode' | 'reduceMotion' | 'glassIntensity' | 'notificationPrefs'>) {
  const json = JSON.stringify({
    themeMode: state.themeMode,
    reduceMotion: state.reduceMotion,
    glassIntensity: state.glassIntensity,
    notificationPrefs: state.notificationPrefs,
  });

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SETTINGS_STORE_KEY, json);
    }
  } else {
    try {
      await SecureStore.setItemAsync(SETTINGS_STORE_KEY, json);
    } catch {
      // SecureStore may not be available in some environments
    }
  }
}

async function loadSettings(): Promise<Partial<SettingsState> | null> {
  try {
    let json: string | null = null;
    if (Platform.OS === 'web') {
      json = typeof window !== 'undefined' ? window.localStorage.getItem(SETTINGS_STORE_KEY) : null;
    } else {
      json = await SecureStore.getItemAsync(SETTINGS_STORE_KEY);
    }
    if (json) {
      return JSON.parse(json);
    }
  } catch {
    // Ignore parse/read errors, fall back to defaults
  }
  return null;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  pushEnabled: true,
  newCaseAssigned: true,
  assessmentReviewed: true,
  systemAnnouncements: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  themeMode: 'system',
  reduceMotion: false,
  glassIntensity: 'full',
  notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS },
  isHydrated: false,

  setThemeMode: (mode: ThemeMode) => {
    set({ themeMode: mode });
    const state = get();
    persistSettings(state);
  },

  setReduceMotion: (enabled: boolean) => {
    set({ reduceMotion: enabled });
    const state = get();
    persistSettings(state);
  },

  setGlassIntensity: (intensity: GlassIntensity) => {
    set({ glassIntensity: intensity });
    const state = get();
    persistSettings(state);
  },

  setNotificationPrefs: (prefs: Partial<NotificationPrefs>) => {
    const current = get().notificationPrefs;
    const updated = { ...current, ...prefs };
    set({ notificationPrefs: updated });
    const state = get();
    persistSettings(state);
  },

  hydrate: async () => {
    const saved = await loadSettings();
    if (saved) {
      set({
        themeMode: saved.themeMode ?? 'system',
        reduceMotion: saved.reduceMotion ?? false,
        glassIntensity: saved.glassIntensity ?? 'full',
        notificationPrefs: saved.notificationPrefs
          ? { ...DEFAULT_NOTIFICATION_PREFS, ...saved.notificationPrefs }
          : { ...DEFAULT_NOTIFICATION_PREFS },
        isHydrated: true,
      });
    } else {
      set({ isHydrated: true });
    }
  },
}));
