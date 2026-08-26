/**
 * ProfileView — Spec §6.2 / §9, UI Upgrade U5
 *
 * "Clinical Glass" restyle:
 * - Clean identity summary (avatar, name, role, email, facility)
 * - Navigation rows for Settings and Consent Agreement
 * - Primary Log Out action
 * - Safe area & bottom tab bar clearance
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function ProfileView() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  async function handleLogout() {
    await clearAuth();
    router.replace('/(auth)/login');
  }

  function handleNavigateSettings() {
    if (user?.role === 'reviewer') {
      router.push('/(reviewer)/settings');
    } else {
      router.push('/(staff)/settings');
    }
  }

  if (!user) return null;

  return (
    <Screen safeArea={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & Hero Identity */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: `${colors.primary}20`, borderColor: colors.primaryLight }]}>
            <Text style={[TypographyScale.h1, { color: colors.primaryLight, fontSize: 32 }]}>
              {user.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[TypographyScale.h2, styles.name, { color: colors.textPrimary }]}>
            {user.full_name}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[TypographyScale.caption, { color: colors.primaryLight, fontWeight: '700', letterSpacing: 0.5 }]}>
              {user.role === 'reviewer' ? 'CLINICAL REVIEWER' : 'STAFF MEMBER'}
            </Text>
          </View>
        </View>

        {/* Account Details Card */}
        <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.card}>
          <View style={styles.cardInner}>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.primaryLight} />
              <View style={styles.infoTextContainer}>
                <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>Email</Text>
                <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '500' }]}>
                  {user.email}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color={colors.primaryLight} />
              <View style={styles.infoTextContainer}>
                <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>Facility</Text>
                <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '500' }]}>
                  {user.facility_name}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Navigation Actions */}
        <GlassCard tint="default" elevation="raised" radius="md" style={styles.card}>
          <View style={styles.cardInner}>
            <TouchableOpacity
              style={styles.navRow}
              onPress={handleNavigateSettings}
              activeOpacity={0.7}
            >
              <View style={styles.navLeft}>
                <Ionicons name="settings-outline" size={20} color={colors.primaryLight} />
                <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '600', marginLeft: Spacing.md }]}>
                  App Settings
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.navRow}
              onPress={() => router.push('/(auth)/consent?viewOnly=true')}
              activeOpacity={0.7}
            >
              <View style={styles.navLeft}>
                <Ionicons name="document-text-outline" size={20} color={colors.primaryLight} />
                <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '600', marginLeft: Spacing.md }]}>
                  View Consent Agreement
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Logout Action */}
        <View style={styles.actions}>
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="outline"
            style={styles.actionBtn}
          />
        </View>

        {/* Version Footer */}
        <View style={styles.footer}>
          <Text style={[TypographyScale.caption, { color: colors.textTertiary }]}>
            VYRA Clinical AI · Version {appVersion}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 96 : 84, // Header clearance
    paddingBottom: 96, // Floating TabBar clearance
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    marginBottom: Spacing.xs,
  },
  roleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardInner: {
    padding: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  infoTextContainer: {
    marginLeft: Spacing.md,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    minHeight: 48,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
  },
  actions: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
});
