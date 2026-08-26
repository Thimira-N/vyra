/**
 * ThemeProvider — React context exposing the resolved theme.
 *
 * Phase U0: Combines settingsStore's user override with the OS color scheme
 * to resolve the correct color palette. Exposes `useTheme()` returning
 * `{ colors, elevation, isDark, mode, setMode, reduceMotion, glassIntensity }`.
 *
 * Spec §6: wraps around QueryClientProvider children in _layout.tsx.
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  type ColorTokens,
  LightColors,
  DarkColors,
  ElevationLight,
  ElevationDark,
  type ElevationTokens,
} from '@/constants/theme';
import {
  useSettingsStore,
  type ThemeMode,
  type GlassIntensity,
} from '@/store/settingsStore';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface ThemeContextValue {
  colors: ColorTokens;
  elevation: ElevationTokens;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  reduceMotion: boolean;
  glassIntensity: GlassIntensity;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const osScheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const glassIntensity = useSettingsStore((s) => s.glassIntensity);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const hydrate = useSettingsStore((s) => s.hydrate);

  // Hydrate persisted settings on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Resolve effective scheme
  const isDark = useMemo(() => {
    if (themeMode === 'light') return false;
    if (themeMode === 'dark') return true;
    // 'system' — follow OS
    return osScheme === 'dark';
  }, [themeMode, osScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: isDark ? DarkColors : LightColors,
      elevation: isDark ? ElevationDark : ElevationLight,
      isDark,
      mode: themeMode,
      setMode: setThemeMode,
      reduceMotion,
      glassIntensity,
    }),
    [isDark, themeMode, setThemeMode, reduceMotion, glassIntensity],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook — the single entry point for theme data across the app
// ---------------------------------------------------------------------------

/**
 * Returns the resolved theme for the current mode.
 *
 * Must be called within `<ThemeProvider>`. Every screen / component that
 * needs color/elevation tokens should use this instead of importing
 * `Colors` directly.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() must be used within <ThemeProvider>');
  }
  return ctx;
}
