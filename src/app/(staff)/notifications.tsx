/**
 * Notification Center Screen
 * 
 * Displays historical notifications (toasts/pushes) inside the app.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import { useNotificationStore, AppNotification } from '@/store/notificationStore';

export default function NotificationsScreen() {
  const { notifications, markAllAsRead, clearAll } = useNotificationStore();

  useEffect(() => {
    // Mark all as read when user opens the screen
    markAllAsRead();
  }, [markAllAsRead]);

  const renderIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color={Colors.riskHigh} />;
      case 'warning':
        return <Ionicons name="warning" size={24} color={Colors.riskMedium} />;
      case 'info':
      default:
        return <Ionicons name="information-circle" size={24} color={Colors.primaryLight} />;
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
      <View style={[styles.card, Shadows.card]}>
        <View style={styles.iconContainer}>{renderIcon(item.type)}</View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerRight: () => (
            notifications.length > 0 ? (
              <TouchableOpacity onPress={clearAll} style={{ marginRight: Spacing.md }}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            ) : null
          ),
        }}
      />

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyBody}>You have no new notifications.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: Typography.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  body: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  date: {
    fontFamily: Typography.medium,
    fontSize: 12,
    color: Colors.border,
  },
  clearText: {
    fontFamily: Typography.semiBold,
    color: Colors.surface,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyTitle: {
    fontFamily: Typography.semiBold,
    fontSize: 20,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  emptyBody: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
