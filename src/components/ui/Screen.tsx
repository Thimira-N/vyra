/**
 * Screen — standard screen wrapper with gradient mesh background.
 *
 * Phase U0/U6: Renders the gradient mesh (backgroundGradientStart/End) plus
 * three blurred decorative luminous blob shapes (blobAccent1/2) per Spec §2.2 and §6.4.
 *
 * Individual screens wrap their content in <Screen> instead of hand-rolling
 * backgrounds. Handles SafeAreaView and StatusBar insets.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
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
  /** Whether to show decorative blob accents (default: true). */
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
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0;
  const topSafePadding = Math.max(insets.top, statusBarHeight);

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
        <View style={styles.blobLayer} pointerEvents="none">
          <View
            style={[
              styles.blob,
              styles.blob1,
              {
                backgroundColor: colors.blobAccent1,
                ...(Platform.OS === 'web'
                  ? {
                      filter: 'blur(60px)',
                      WebkitFilter: 'blur(60px)',
                    }
                  : {}),
              },
            ]}
          />
          <View
            style={[
              styles.blob,
              styles.blob2,
              {
                backgroundColor: colors.blobAccent2,
                ...(Platform.OS === 'web'
                  ? {
                      filter: 'blur(70px)',
                      WebkitFilter: 'blur(70px)',
                    }
                  : {}),
              },
            ]}
          />
          <View
            style={[
              styles.blob,
              styles.blob3,
              {
                backgroundColor: colors.blobAccent1,
                ...(Platform.OS === 'web'
                  ? {
                      filter: 'blur(65px)',
                      WebkitFilter: 'blur(65px)',
                    }
                  : {}),
              },
            ]}
          />
        </View>
      )}

      {/* Content */}
      <View
        style={[
          styles.content,
          safeArea && {
            paddingTop: topSafePadding,
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  blobLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
  },
  blob1: {
    top: -80,
    right: -60,
    width: 380,
    height: 380,
    borderRadius: 190,
  },
  blob2: {
    top: 240,
    left: -100,
    width: 340,
    height: 340,
    borderRadius: 170,
  },
  blob3: {
    bottom: 60,
    right: -40,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
});
