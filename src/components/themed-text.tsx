/**
 * ThemedText — Legacy Expo template text component.
 *
 * U1 restyle: removed hardcoded hex color (#3c87f7), removed Fonts import,
 * all colors resolved through useTheme().colors.
 */

import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { TypographyScale } from '@/constants/theme';
import type { ColorTokens } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: keyof ColorTokens;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const { colors } = useTheme();

  return (
    <Text
      style={[
        { color: themeColor ? colors[themeColor] : colors.textPrimary },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && { ...styles.linkPrimary, color: colors.primary },
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: TypographyScale.body.fontFamily,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: TypographyScale.button.fontFamily,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: TypographyScale.body.fontFamily,
  },
  title: {
    fontSize: 48,
    lineHeight: 52,
    fontFamily: TypographyScale.h1.fontFamily,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontFamily: TypographyScale.h1.fontFamily,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    // color set dynamically from theme
  },
  code: {
    fontFamily: Platform.select({
      ios: 'ui-monospace',
      android: 'monospace',
      web: 'var(--font-mono)',
    }),
    fontWeight: Platform.select({ android: '700' }) ?? '500',
    fontSize: 12,
  },
});
