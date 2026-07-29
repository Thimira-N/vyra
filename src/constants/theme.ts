/**
 * Clinical RSS Design System — Spec §5
 * "Premium, Modern, Clinical" — calm, precise, high-contrast palette
 * that reads as clinical software, not a wellness app.
 */

// ---------------------------------------------------------------------------
// Colors — exact tokens from Spec §5's color palette table
// ---------------------------------------------------------------------------
export const Colors = {
  /** Deep teal-navy — Headers, primary buttons, active states */
  primary: '#0F4C5C',
  /** Secondary accents, links */
  primaryLight: '#1D7A8C',
  /** Screen background */
  background: '#F7F9FA',
  /** Cards, inputs */
  surface: '#FFFFFF',
  /** Body text */
  textPrimary: '#1A2B32',
  /** Labels, helper text */
  textSecondary: '#5C7079',
  /** Low risk badge/chart segment */
  riskLow: '#2E9E5B',
  /** Medium risk badge/chart segment */
  riskMedium: '#E0A100',
  /** High risk badge/chart segment */
  riskHigh: '#D14343',
  /** Dividers, input borders */
  border: '#E3E9EB',
} as const;

// ---------------------------------------------------------------------------
// Typography — Inter variable font (Spec §5)
// Font names match the exports from @expo-google-fonts/inter loaded via useFonts
// ---------------------------------------------------------------------------
export const Typography = {
  /** Body text, form inputs */
  regular: 'Inter_400Regular',
  /** Emphasized body, navigation labels */
  medium: 'Inter_500Medium',
  /** Sub-headers, button labels */
  semiBold: 'Inter_600SemiBold',
  /** Page headers, large titles */
  bold: 'Inter_700Bold',
} as const;

// ---------------------------------------------------------------------------
// Spacing scale — 4/8/12/16/24/32/48 (Spec §5)
// Consistent throughout, no arbitrary values.
// ---------------------------------------------------------------------------
export const Spacing = {
  /** 4px — tightest spacing (inner padding, icon gaps) */
  xxs: 4,
  /** 8px — small gaps between related elements */
  xs: 8,
  /** 12px — medium-small spacing */
  sm: 12,
  /** 16px — standard padding, component spacing */
  md: 16,
  /** 24px — section spacing, card padding */
  lg: 24,
  /** 32px — large spacing between sections */
  xl: 32,
  /** 48px — screen-level spacing, hero areas */
  xxl: 48,
} as const;

// ---------------------------------------------------------------------------
// Shadows — subtle clinical style (1px border preferred over heavy shadows)
// ---------------------------------------------------------------------------
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
} as const;

// ---------------------------------------------------------------------------
// Risk level color resolver
// ---------------------------------------------------------------------------
export type RiskLevel = 'Low' | 'Medium' | 'High';

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'Low':
      return Colors.riskLow;
    case 'Medium':
      return Colors.riskMedium;
    case 'High':
      return Colors.riskHigh;
  }
}

// ---------------------------------------------------------------------------
// Legacy compatibility — existing Expo template files reference these names.
// These files (explore.tsx, app-tabs.tsx, etc.) are dead code now but would
// block TypeScript compilation without these re-exports.
// ---------------------------------------------------------------------------

import { Platform } from 'react-native';

/** @deprecated Use Typography instead */
export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: { sans: 'var(--font-display)', serif: 'var(--font-serif)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
});

/** @deprecated Replaced by flat Colors object — legacy template compat only */
export type ThemeColor = string;

/** @deprecated Use Spacing.xxl instead */
export const MaxContentWidth = 800;

/** @deprecated Use Spacing.xxl instead */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
