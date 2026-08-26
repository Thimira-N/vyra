import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const { colors } = useTheme();

  return <View style={[{ backgroundColor: (colors as unknown as Record<string, string>)[type ?? 'background'] ?? colors.background }, style]} {...otherProps} />;
}
