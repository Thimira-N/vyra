/**
 * PremiumTabBar — Ultra-Premium Floating Glass Dock & Tab Navigator.
 *
 * Designed to feel like an elite medical workstation control dock:
 * - Frosted crystal glass chassis with top specular highlight sheen & subsurface glow
 * - Elevated center "New Assessment" clinical jewel action button
 * - Illuminated gradient active capsules with glowing micro-beacon LEDs
 * - Full support for both 'history' and 'history/index' routes
 * - Smooth physics-based Reanimated transitions
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';

/* ── Tab Configuration Types ── */
interface TabConfig {
  name: string;
  label: string;
  iconOutline: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
  isAction?: boolean;
}

const STAFF_TAB_CONFIGS: Record<string, TabConfig> = {
  home: {
    name: 'home',
    label: 'Home',
    iconOutline: 'home-outline',
    iconFilled: 'home',
  },
  'new-assessment': {
    name: 'new-assessment',
    label: 'New',
    iconOutline: 'add-circle-outline',
    iconFilled: 'add-circle',
  },
  history: {
    name: 'history',
    label: 'History',
    iconOutline: 'time-outline',
    iconFilled: 'time',
  },
  'history/index': {
    name: 'history/index',
    label: 'History',
    iconOutline: 'time-outline',
    iconFilled: 'time',
  },
  profile: {
    name: 'profile',
    label: 'Profile',
    iconOutline: 'person-outline',
    iconFilled: 'person',
  },
};

const REVIEWER_TAB_CONFIGS: Record<string, TabConfig> = {
  dashboard: {
    name: 'dashboard',
    label: 'Dashboard',
    iconOutline: 'grid-outline',
    iconFilled: 'grid',
  },
  profile: {
    name: 'profile',
    label: 'Profile',
    iconOutline: 'person-outline',
    iconFilled: 'person',
  },
};

/* ── Tab Item Component ── */
function StandardTabItem({
  config,
  isFocused,
  onPress,
  onLongPress,
  isDark,
  primaryColor,
}: {
  config: TabConfig;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  isDark: boolean;
  primaryColor: string;
}) {
  const inactiveColor = isDark ? '#7E9AA8' : '#708690';
  const activeColor = primaryColor;

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, {
      duration: 180,
      easing: Easing.out(Easing.cubic),
    }),
    transform: [
      {
        scale: withSpring(isFocused ? 1 : 0.8, {
          damping: 14,
          stiffness: 160,
        }),
      },
    ],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isFocused ? 1.08 : 1, {
          damping: 14,
          stiffness: 170,
        }),
      },
    ],
  }));

  const beaconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, { duration: 160 }),
    transform: [
      {
        scale: withSpring(isFocused ? 1 : 0.3, {
          damping: 12,
          stiffness: 180,
        }),
      },
    ],
  }));

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={config.label}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={styles.tabButton}
    >
      {/* Active Illuminated Pill Container */}
      <Animated.View style={[styles.activePillContainer, pillAnimatedStyle]}>
        <LinearGradient
          colors={
            isDark
              ? ['rgba(79, 209, 224, 0.16)', 'rgba(29, 122, 140, 0.06)']
              : ['rgba(15, 76, 92, 0.12)', 'rgba(29, 122, 140, 0.05)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(79, 209, 224, 0.30)' : 'rgba(15, 76, 92, 0.18)',
            },
          ]}
        />
      </Animated.View>

      {/* Icon */}
      <Animated.View style={[styles.iconHousing, iconAnimatedStyle]}>
        <Ionicons
          name={isFocused ? config.iconFilled : config.iconOutline}
          size={23}
          color={isFocused ? activeColor : inactiveColor}
        />
      </Animated.View>

      {/* Label */}
      <Text
        style={[
          styles.tabText,
          {
            color: isFocused ? activeColor : inactiveColor,
            fontFamily: isFocused ? 'Inter_700Bold' : 'Inter_500Medium',
          },
        ]}
        numberOfLines={1}
      >
        {config.label}
      </Text>

      {/* Active Glowing Micro Beacon LED */}
      <Animated.View
        style={[
          styles.activeBeaconPill,
          { backgroundColor: activeColor },
          beaconAnimatedStyle,
        ]}
      />
    </TouchableOpacity>
  );
}

/* ── Main Unified Custom Tab Bar ── */
export function VyraStaffTabBar(props: any) {
  return (
    <VyraTabBarCore
      {...props}
      tabConfigs={STAFF_TAB_CONFIGS}
      allowedRoutes={['home', 'new-assessment', 'history', 'history/index', 'profile']}
    />
  );
}

export function VyraReviewerTabBar(props: any) {
  return (
    <VyraTabBarCore
      {...props}
      tabConfigs={REVIEWER_TAB_CONFIGS}
      allowedRoutes={['dashboard', 'profile']}
    />
  );
}

function VyraTabBarCore({
  state,
  navigation,
  tabConfigs,
  allowedRoutes,
}: {
  state: any;
  descriptors: any;
  navigation: any;
  tabConfigs: Record<string, TabConfig>;
  allowedRoutes: string[];
}) {
  const { colors, isDark, glassIntensity } = useTheme();

  // Filter routes to strictly only the allowed visible tabs
  const validRoutes = state.routes.filter((route: any) =>
    allowedRoutes.includes(route.name)
  );

  const blurAmount = glassIntensity === 'off' ? 0 : 55;

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View style={styles.dockHousing}>
        {/* ── Frosted Multi-Layer Glass Chassis ── */}
        <View style={StyleSheet.absoluteFill}>
          {glassIntensity !== 'off' && (
            <BlurView
              intensity={blurAmount}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* Ambient Surface Gradient Tint */}
          <LinearGradient
            colors={
              isDark
                ? ['rgba(15, 27, 36, 0.92)', 'rgba(8, 15, 20, 0.96)']
                : ['rgba(255, 255, 255, 0.96)', 'rgba(242, 247, 250, 0.92)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Top Hairline Specular Highlight Edge */}
          <LinearGradient
            colors={
              isDark
                ? [
                    'rgba(79, 209, 224, 0.40)',
                    'rgba(255, 255, 255, 0.20)',
                    'rgba(79, 209, 224, 0.40)',
                  ]
                : [
                    'rgba(255, 255, 255, 0.98)',
                    'rgba(255, 255, 255, 0.65)',
                    'rgba(255, 255, 255, 0.98)',
                  ]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topSpecularLine}
          />
        </View>

        {/* ── Interactive Tab Items Row ── */}
        <View style={styles.tabsRow}>
          {validRoutes.map((route: any) => {
            const config = tabConfigs[route.name];
            if (!config) return null;

            const realIndex = state.routes.indexOf(route);
            const isFocused = state.index === realIndex;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <StandardTabItem
                key={route.key}
                config={config}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                isDark={isDark}
                primaryColor={colors.primary}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dockHousing: {
    width: '100%',
    maxWidth: 440,
    height: 70,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.18)',
      android: 'rgba(255, 255, 255, 0.12)',
      default: 'rgba(255, 255, 255, 0.18)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  topSpecularLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 4,
    paddingBottom: 4,
  },
  activePillContainer: {
    position: 'absolute',
    width: 50,
    height: 38,
    borderRadius: 16,
    top: 6,
    overflow: 'hidden',
  },
  iconHousing: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  activeBeaconPill: {
    position: 'absolute',
    bottom: 3.5,
    width: 14,
    height: 3,
    borderRadius: 1.5,
  },
});

