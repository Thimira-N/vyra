/**
 * ThemedView — Legacy Expo template view component.
 *
 * U1 restyle: properly typed with ColorTokens, no ThemeColor import needed.
 * All colors through useTheme().colors.
 */

import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { ColorTokens } from '@/constants/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: keyof ColorTokens;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const { colors } = useTheme();

  return <View style={[{ backgroundColor: type ? colors[type] : colors.background }, style]} {...otherProps} />;
}
