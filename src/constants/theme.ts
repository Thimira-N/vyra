/**
 * Clinical RSS Design System — UI Upgrade Spec §2–§4
 * "Clinical Glass" dual-mode token system (light + dark).
 *
 * New consumers use `LightColors` / `DarkColors` via `useTheme()`.
 * Legacy `Colors` re-export points to `LightColors` so existing screens
 * keep compiling until they are migrated in later U-phases.
 */

import { Platform, TextStyle } from 'react-native';

// ---------------------------------------------------------------------------
// §2 Color Tokens — Light + Dark
// ---------------------------------------------------------------------------

/** Every color token that must resolve in both modes. */
export interface ColorTokens {
  // §2.1 Brand / semantic
  primary: string;
  primaryLight: string;
  primaryGradientStart: string;
  primaryGradientEnd: string;
  riskLow: string;
  riskMedium: string;
  riskHigh: string;
  danger: string;
  success: string;

  // §2.2 Backgrounds
  background: string;
  backgroundGradientStart: string;
  backgroundGradientEnd: string;
  blobAccent1: string;
  blobAccent2: string;

  // §2.3 Glass surfaces
  glassTint: string;
  glassTintElevated: string;
  glassBorder: string;
  glassBorderStrong: string;
  glassHighlight: string;

  // §2.4 Surface (opaque, non-glass)
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;

  // §2.5 Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textOnPrimary: string;
  textOnGlass: string;

  // §2.6 Borders / dividers
  border: string;
  borderStrong: string;
  divider: string;
}

export const LightColors: ColorTokens = {
  // §2.1 Brand / semantic
  primary: '#0F4C5C',
  primaryLight: '#1D7A8C',
  primaryGradientStart: '#0F4C5C',
  primaryGradientEnd: '#1D7A8C',
  riskLow: '#2E9E5B',
  riskMedium: '#E0A100',
  riskHigh: '#D14343',
  danger: '#D14343',
  success: '#2E9E5B',

  // §2.2 Backgrounds
  background: '#F4F7F9',
  backgroundGradientStart: '#EAF3F5',
  backgroundGradientEnd: '#F7F9FA',
  blobAccent1: 'rgba(15,76,92,0.10)',
  blobAccent2: 'rgba(29,122,140,0.08)',

  // §2.3 Glass surfaces
  glassTint: 'rgba(255,255,255,0.55)',
  glassTintElevated: 'rgba(255,255,255,0.78)',
  glassBorder: 'rgba(255,255,255,0.6)',
  glassBorderStrong: 'rgba(255,255,255,0.85)',
  glassHighlight: 'rgba(255,255,255,0.9)',

  // §2.4 Surface
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceSunken: '#F0F4F5',

  // §2.5 Text
  textPrimary: '#132229',
  textSecondary: '#5C7079',
  textTertiary: '#8FA1A8',
  textOnPrimary: '#FFFFFF',
  textOnGlass: '#132229',

  // §2.6 Borders / dividers
  border: '#E3E9EB',
  borderStrong: '#CBD7DA',
  divider: '#E9EEEF',
};

export const DarkColors: ColorTokens = {
  // §2.1 Brand / semantic
  primary: '#4FD1E0',
  primaryLight: '#7FE3EE',
  primaryGradientStart: '#123B47',
  primaryGradientEnd: '#1D5A66',
  riskLow: '#3FBE73',
  riskMedium: '#F0B429',
  riskHigh: '#EF5A5A',
  danger: '#EF5A5A',
  success: '#3FBE73',

  // §2.2 Backgrounds
  background: '#0B1418',
  backgroundGradientStart: '#0B1418',
  backgroundGradientEnd: '#101E24',
  blobAccent1: 'rgba(79,209,224,0.08)',
  blobAccent2: 'rgba(29,122,140,0.10)',

  // §2.3 Glass surfaces
  glassTint: 'rgba(18,28,32,0.55)',
  glassTintElevated: 'rgba(16,24,28,0.82)',
  glassBorder: 'rgba(255,255,255,0.08)',
  glassBorderStrong: 'rgba(255,255,255,0.14)',
  glassHighlight: 'rgba(255,255,255,0.06)',

  // §2.4 Surface
  surface: '#141F24',
  surfaceRaised: '#1A272D',
  surfaceSunken: '#0F1A1E',

  // §2.5 Text
  textPrimary: '#EAF3F5',
  textSecondary: '#8FA3AB',
  textTertiary: '#5C7079',
  textOnPrimary: '#0B1418',
  textOnGlass: '#EAF3F5',

  // §2.6 Borders / dividers
  border: '#233238',
  borderStrong: '#324349',
  divider: '#1C2A2F',
};

// ---------------------------------------------------------------------------
// §3 Elevation System (replaces Shadows.card as the canonical system)
// ---------------------------------------------------------------------------

export interface ElevationStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number; // Android
}

export interface ElevationTokens {
  flat: ElevationStyle;
  raised: ElevationStyle;
  floating: ElevationStyle;
  overlay: ElevationStyle;
}

export const ElevationLight: ElevationTokens = {
  flat: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  raised: {
    shadowColor: 'rgba(15,76,92,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: 'rgba(15,76,92,0.12)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  overlay: {
    shadowColor: 'rgba(15,76,92,0.18)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 48,
    elevation: 16,
  },
};

export const ElevationDark: ElevationTokens = {
  flat: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  raised: {
    shadowColor: 'rgba(0,0,0,0.45)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  floating: {
    shadowColor: 'rgba(0,0,0,0.55)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 28,
    elevation: 8,
  },
  overlay: {
    shadowColor: 'rgba(0,0,0,0.65)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 56,
    elevation: 16,
  },
};

// ---------------------------------------------------------------------------
// §3 Corner Radius Scale
// ---------------------------------------------------------------------------
export const Radius = {
  /** 8px — small elements */
  sm: 8,
  /** 14px — buttons, inputs */
  md: 14,
  /** 20px — glass cards */
  lg: 20,
  /** 28px — tab bar, bottom sheets (top corners) */
  xl: 28,
  /** 999px — pills, badges */
  pill: 999,
} as const;

// ---------------------------------------------------------------------------
// §4 Typography Scale
// ---------------------------------------------------------------------------

/** Font family names — must match useFonts() keys exactly */
const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
} as const;

export interface TypographyToken {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  fontWeight?: TextStyle['fontWeight'];
}

export const TypographyScale: Record<string, TypographyToken> = {
  display: { fontSize: 34, lineHeight: 40, fontFamily: FontFamily.extraBold },
  h1: { fontSize: 26, lineHeight: 32, fontFamily: FontFamily.bold },
  h2: { fontSize: 20, lineHeight: 26, fontFamily: FontFamily.semiBold },
  h3: { fontSize: 17, lineHeight: 22, fontFamily: FontFamily.semiBold },
  bodyLg: { fontSize: 16, lineHeight: 24, fontFamily: FontFamily.regular },
  body: { fontSize: 14, lineHeight: 20, fontFamily: FontFamily.regular },
  bodySm: { fontSize: 13, lineHeight: 18, fontFamily: FontFamily.regular },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: FontFamily.medium },
  numericLg: { fontSize: 40, lineHeight: 44, fontFamily: FontFamily.extraBold },
  button: { fontSize: 15, lineHeight: 20, fontFamily: FontFamily.semiBold },
} as const;

// ---------------------------------------------------------------------------
// §2.3 Glass Config (blur amounts + tint references)
// ---------------------------------------------------------------------------
export const Glass = {
  blur: {
    /** Standard card */
    card: { light: 20, dark: 24 },
    /** Tab bar / sticky header */
    header: { light: 30, dark: 36 },
    /** Modal / bottom sheet */
    modal: { light: 40, dark: 48 },
  },
} as const;

// ---------------------------------------------------------------------------
// Spacing scale — 4/8/12/16/24/32/48 (unchanged from original)
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

// ============================================================================
// LEGACY EXPORTS — preserved for backward compatibility
// Existing screens import these and will continue to do so until their
// respective U-phase migrates them to useTheme().
// ============================================================================

/**
 * Legacy flat `Colors` object — resolves to LightColors so existing
 * screens continue to compile and render identically.
 * @deprecated Use `useTheme().colors` instead — migrated per-phase in U1–U5.
 */
export const Colors = LightColors;

/**
 * Legacy Typography font family names.
 * New consumers should use `TypographyScale` tokens instead.
 */
export const Typography = {
  /** Body text, form inputs */
  regular: FontFamily.regular,
  /** Emphasized body, navigation labels */
  medium: FontFamily.medium,
  /** Sub-headers, button labels */
  semiBold: FontFamily.semiBold,
  /** Page headers, large titles */
  bold: FontFamily.bold,
} as const;

// Legacy shadows — kept for existing consumers
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
} as const;

// Risk level helpers
export type RiskLevel = 'Low' | 'Medium' | 'High';

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'Low':
      return LightColors.riskLow;
    case 'Medium':
      return LightColors.riskMedium;
    case 'High':
      return LightColors.riskHigh;
  }
}

// Legacy compatibility re-exports
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
