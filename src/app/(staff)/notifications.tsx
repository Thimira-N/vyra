/**
 * Notification Center Screen — Spec §6.2, UI Upgrade U4
 *
 * "Clinical Glass" restyle:
 * - Screen wrapper with gradient mesh + blob accents
 * - Notification items in GlassCards with semantic risk/status iconography
 * - Header clearance and floating tab bar padding
 * - Preserved logic: markAllAsRead on open, clearAll action
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { useNotificationStore, type AppNotification } from '@/store/notificationStore';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { notifications, markAllAsRead, clearAll } = useNotificationStore();

  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const renderIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color={colors.riskLow} />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color={colors.riskHigh} />;
      case 'warning':
        return <Ionicons name="warning" size={24} color={colors.riskMedium} />;
      case 'info':
      default:
        return <Ionicons name="information-circle" size={24} color={colors.primaryLight} />;
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const date = new Date(item.date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <GlassCard tint="default" elevation="raised" radius="md" style={styles.notificationCard}>
        <View style={styles.cardInner}>
          <View style={styles.iconContainer}>{renderIcon(item.type)}</View>
          <View style={styles.textContainer}>
            <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '600' }]}>
              {item.title}
            </Text>
            <Text style={[TypographyScale.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>
              {item.body}
            </Text>
            <Text style={[TypographyScale.caption, { color: colors.textTertiary, marginTop: 4 }]}>
              {date}
            </Text>
          </View>
        </View>
      </GlassCard>
    );
  };

  return (
    <Screen safeArea={true}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerRight: () =>
            notifications.length > 0 ? (
              <TouchableOpacity onPress={clearAll} style={styles.clearButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={[TypographyScale.button, { color: colors.primaryLight, fontSize: 14 }]}>
                  Clear all
                </Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={colors.borderStrong} />
          <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.lg }]}>
            All caught up!
          </Text>
          <Text style={[TypographyScale.body, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs }]}>
            You have no new notifications.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 56, // Header clearance
    paddingBottom: 96, // Floating TabBar clearance
  },
  notificationCard: {
    marginBottom: Spacing.sm,
  },
  cardInner: {
    flexDirection: 'row',
    padding: Spacing.md,
  },
  iconContainer: {
    marginRight: Spacing.md,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  clearButton: {
    marginRight: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
});
