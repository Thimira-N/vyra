/**
 * Theme hook — re-exports useTheme from ThemeProvider.
 *
 * Phase U0: Fixes the original bug where `Colors[theme]` failed because
 * `Colors` had no `light`/`dark` keys. Now delegates to ThemeProvider context.
 *
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

export { useTheme } from '@/components/ThemeProvider';
