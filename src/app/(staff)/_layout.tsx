/**
 * Staff group layout — Tab navigator: Home, New Assessment, History, Profile
 * Uses VyraStaffTabBar for an ultra-premium, modern floating clinical dock.
 */

import React from 'react';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Radius } from '@/constants/theme';
import { useNotificationStore } from '@/store/notificationStore';
import { VyraStaffTabBar } from '@/components/ui/PremiumTabBar';

function NotificationBell() {
  const { colors } = useTheme();
  const unreadCount = useNotificationStore((s) => s.unreadCount());

  return (
    <TouchableOpacity
      style={styles.bellButton}
      onPress={() => (router.push as any)('/(staff)/notifications')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityLabel="Notifications"
    >
      <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
      {unreadCount > 0 && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.riskHigh,
              borderColor: colors.surface,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: colors.surface }]}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function StaffLayout() {
  return (
    <Tabs
      safeAreaInsets={{ bottom: 0, top: 0, left: 0, right: 0 }}
      tabBar={(props) => <VyraStaffTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="new-assessment"
        options={{
          title: 'New',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="history/index"
        options={{
          title: 'History',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="history/[id]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          title: 'Settings',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: 'Notifications',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    marginRight: 16,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: Radius.pill,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
