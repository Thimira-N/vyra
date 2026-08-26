/**
 * Screen — standard screen wrapper with gradient mesh background.
 *
 * Phase U0: Renders the gradient mesh (backgroundGradientStart/End) plus
 * two blurred decorative blob shapes (blobAccent1/2) per Spec §2.2 and §6.4.
 *
 * Individual screens wrap their content in <Screen> instead of hand-rolling
 * backgrounds. Handles SafeAreaView and StatusBar insets.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Additional styles for the content container */
  style?: StyleProp<ViewStyle>;
  /** Whether to apply safe area insets (default: true) */
  safeArea?: boolean;
  /** Whether to show decorative blob accents (default: true).
   *  Set to false on dense data screens per Spec §5 guidance. */
  showBlobs?: boolean;
}

export function Screen({
  children,
  style,
  safeArea = true,
  showBlobs = true,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Gradient mesh background */}
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative blurred blobs per §2.2 / §5 */}
      {showBlobs && (
        <>
          <View
            style={[
              styles.blob,
              styles.blob1,
              { backgroundColor: colors.blobAccent1 },
            ]}
          />
          <View
            style={[
              styles.blob,
              styles.blob2,
              { backgroundColor: colors.blobAccent2 },
            ]}
          />
        </>
      )}

      {/* Content */}
      <View
        style={[
          styles.content,
          safeArea && {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const BLOB_SIZE = 280;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
    // Soft-edged blurred circle — the opacity in blobAccent tokens
    // and the large border-radius create a naturally soft edge.
  },
  blob1: {
    top: -60,
    right: -40,
  },
  blob2: {
    top: 200,
    left: -80,
  },
});
