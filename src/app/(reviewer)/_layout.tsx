/**
 * Reviewer group layout — Tab navigator: Dashboard, Profile
 * Uses VyraReviewerTabBar for an ultra-premium, modern floating clinical dock.
 * case/[id] is hidden from tabs (accessed via dashboard navigation).
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { VyraReviewerTabBar } from '@/components/ui/PremiumTabBar';

export default function ReviewerLayout() {
  return (
    <Tabs
      safeAreaInsets={{ bottom: 0, top: 0, left: 0, right: 0 }}
      tabBar={(props) => <VyraReviewerTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="case/[id]"
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
    </Tabs>
  );
}
