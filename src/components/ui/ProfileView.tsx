import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileView() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  async function handleLogout() {
    await clearAuth();
    router.replace('/(auth)/login');
  }

  if (!user) return null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.full_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user.full_name}</Text>
        <Text style={styles.role}>
          {user.role === 'reviewer' ? 'Clinical Reviewer' : 'Staff Member'}
        </Text>
      </View>

      <View style={[styles.card, Shadows.card]}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={20} color={Colors.textSecondary} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Facility (Read-only)</Text>
            <Text style={styles.infoValue}>{user.facility_name}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="View Consent Agreement"
          onPress={() => router.push('/(auth)/consent?viewOnly=true')}
          variant="outline"
          style={styles.actionBtn}
        />
        <Button
          title="Log Out"
          onPress={handleLogout}
          variant="primary"
          style={styles.actionBtn}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>App Version {appVersion}</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontFamily: Typography.bold,
    fontSize: 32,
    color: Colors.primary,
  },
  name: {
    fontFamily: Typography.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  role: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  infoTextContainer: {
    marginLeft: Spacing.md,
  },
  infoLabel: {
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: Typography.medium,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 52, // Align with text
  },
  actions: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  actionBtn: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
  },
  versionText: {
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
