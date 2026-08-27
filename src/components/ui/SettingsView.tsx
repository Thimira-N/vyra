/**
 * SettingsView — Spec §9, UI Upgrade U5
 *
 * Full Spec §9 implementation:
 * - Account section (read-only info, change password, consent agreement)
 * - Appearance section:
 *     • Theme segmented control: System / Light / Dark (wires live to useTheme().setMode)
 *     • Reduce Motion toggle (wires live to useTheme().setReduceMotion)
 *     • Glass Intensity segmented control: Full / Reduced / Off (wires live to useTheme().setGlassIntensity)
 * - Notifications section (master toggle + sub-toggles stored client-side)
 * - Privacy & Data section (Clear local cache with confirmation dialog, Data export coming soon notice)
 * - Security section (Biometrics coming soon notice)
 * - Support & About section (App version, Clinical disclaimer)
 * - Danger Zone (Log Out, Delete account administrative info)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore, type ThemeMode, type GlassIntensity } from '@/store/settingsStore';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

interface SettingsViewProps {
  role?: 'staff' | 'reviewer';
}

export default function SettingsView({ role }: SettingsViewProps) {
  const { colors, mode, setMode, reduceMotion, setReduceMotion, glassIntensity, setGlassIntensity } = useTheme();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const notificationPrefs = useSettingsStore((s) => s.notificationPrefs);
  const setNotificationPrefs = useSettingsStore((s) => s.setNotificationPrefs);
  const resetDraft = useAssessmentDraftStore((s) => s.reset);

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const effectiveRole = role || user?.role || 'staff';

  async function handleLogout() {
    await clearAuth();
    router.replace('/(auth)/login');
  }

  function handleClearCache() {
    Alert.alert(
      'Clear Local Cache',
      'This will reset your local drafts and temporary cached data. Your submitted assessments on the server are unaffected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: () => {
            resetDraft();
            Alert.alert('Cache Cleared', 'Local assessment drafts and temporary data have been reset.');
          },
        },
      ],
    );
  }

  function handleComingSoon(feature: string, description: string) {
    Alert.alert(
      `${feature} — Coming Soon`,
      description,
      [{ text: 'OK' }],
    );
  }

  return (
    <Screen safeArea={true}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[TypographyScale.h1, styles.pageTitle, { color: colors.textPrimary }]}>
          Settings
        </Text>

        {/* 1. ACCOUNT */}
        <View style={styles.section}>
          <Text style={[TypographyScale.caption, styles.sectionHeader, { color: colors.textSecondary }]}>
            ACCOUNT
          </Text>
          <GlassCard tint="elevated" elevation="raised" radius="md">
            <View style={styles.cardInner}>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {user?.full_name || 'User'}
                  </Text>
                  <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {user?.email} · {user?.facility_name}
                  </Text>
                </View>
                <View style={[styles.rolePill, { backgroundColor: `${colors.primary}18` }]}>
                  <Text style={[TypographyScale.caption, { color: colors.primaryLight, fontWeight: '700', fontSize: 11 }]}>
                    {effectiveRole === 'reviewer' ? 'REVIEWER' : 'STAFF'}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => router.push('/(auth)/forgot-password')}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="key-outline" size={18} color={colors.primaryLight} />
                  <Text style={[TypographyScale.body, { color: colors.textPrimary, marginLeft: Spacing.sm }]}>
                    Change Password
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => router.push('/(auth)/consent?viewOnly=true')}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="document-text-outline" size={18} color={colors.primaryLight} />
                  <Text style={[TypographyScale.body, { color: colors.textPrimary, marginLeft: Spacing.sm }]}>
                    View Consent Agreement
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>

        {/* 2. APPEARANCE */}
        <View style={styles.section}>
          <Text style={[TypographyScale.caption, styles.sectionHeader, { color: colors.textSecondary }]}>
            APPEARANCE & DISPLAY
          </Text>
          <GlassCard tint="default" elevation="raised" radius="md">
            <View style={styles.cardInner}>
              {/* Theme Selector */}
              <View style={styles.optionBlock}>
                <Text style={[TypographyScale.bodySm, { color: colors.textPrimary, fontWeight: '600', marginBottom: Spacing.xs }]}>
                  Theme
                </Text>
                <View style={[styles.segmentedRow, { backgroundColor: colors.surfaceSunken, borderColor: colors.border }]}>
                  {(['system', 'light', 'dark'] as ThemeMode[]).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.segmentOption,
                        mode === t && { backgroundColor: colors.primary, borderRadius: Radius.sm },
                      ]}
                      onPress={() => setMode(t)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          TypographyScale.button,
                          {
                            color: mode === t ? colors.textOnPrimary : colors.textSecondary,
                            fontSize: 13,
                            textTransform: 'capitalize',
                          },
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Reduce Motion */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextContainer}>
                  <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                    Reduce Motion
                  </Text>
                  <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    Minimize entrance animations and visual transitions
                  </Text>
                </View>
                <Switch
                  value={reduceMotion}
                  onValueChange={setReduceMotion}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Glass Intensity */}
              <View style={styles.optionBlock}>
                <View style={{ marginBottom: Spacing.xs }}>
                  <Text style={[TypographyScale.bodySm, { color: colors.textPrimary, fontWeight: '600' }]}>
                    Glass Intensity
                  </Text>
                  <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    Escape hatch for blur sensitivity or low-power devices
                  </Text>
                </View>
                <View style={[styles.segmentedRow, { backgroundColor: colors.surfaceSunken, borderColor: colors.border }]}>
                  {(['full', 'reduced', 'off'] as GlassIntensity[]).map((gi) => (
                    <TouchableOpacity
                      key={gi}
                      style={[
                        styles.segmentOption,
                        glassIntensity === gi && { backgroundColor: colors.primary, borderRadius: Radius.sm },
                      ]}
                      onPress={() => setGlassIntensity(gi)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          TypographyScale.button,
                          {
                            color: glassIntensity === gi ? colors.textOnPrimary : colors.textSecondary,
                            fontSize: 13,
                            textTransform: 'capitalize',
                          },
                        ]}
                      >
                        {gi}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* 3. NOTIFICATIONS */}
        <View style={styles.section}>
          <Text style={[TypographyScale.caption, styles.sectionHeader, { color: colors.textSecondary }]}>
            NOTIFICATIONS (LOCAL PREFERENCES)
          </Text>
          <GlassCard tint="default" elevation="raised" radius="md">
            <View style={styles.cardInner}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleTextContainer}>
                  <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                    Push Notifications
                  </Text>
                  <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    Master notification toggle
                  </Text>
                </View>
                <Switch
                  value={notificationPrefs.pushEnabled}
                  onValueChange={(val) => setNotificationPrefs({ pushEnabled: val })}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              </View>

              {notificationPrefs.pushEnabled && (
                <>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  {effectiveRole === 'reviewer' ? (
                    <View style={styles.toggleRow}>
                      <View style={styles.toggleTextContainer}>
                        <Text style={[TypographyScale.bodySm, { color: colors.textPrimary }]}>
                          New Case Assigned
                        </Text>
                        <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>
                          Alerts when an assessment awaits clinical review
                        </Text>
                      </View>
                      <Switch
                        value={notificationPrefs.newCaseAssigned}
                        onValueChange={(val) => setNotificationPrefs({ newCaseAssigned: val })}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.surface}
                      />
                    </View>
                  ) : (
                    <View style={styles.toggleRow}>
                      <View style={styles.toggleTextContainer}>
                        <Text style={[TypographyScale.bodySm, { color: colors.textPrimary }]}>
                          Assessment Reviewed
                        </Text>
                        <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>
                          Alerts when a reviewer validates or overrides results
                        </Text>
                      </View>
                      <Switch
                        value={notificationPrefs.assessmentReviewed}
                        onValueChange={(val) => setNotificationPrefs({ assessmentReviewed: val })}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.surface}
                      />
                    </View>
                  )}

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <View style={styles.toggleRow}>
                    <View style={styles.toggleTextContainer}>
                      <Text style={[TypographyScale.bodySm, { color: colors.textPrimary }]}>
                        System Announcements
                      </Text>
                      <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>
                        Maintenance and clinical protocol updates
                      </Text>
                    </View>
                    <Switch
                      value={notificationPrefs.systemAnnouncements}
                      onValueChange={(val) => setNotificationPrefs({ systemAnnouncements: val })}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.surface}
                    />
                  </View>
                </>
              )}
            </View>
          </GlassCard>
        </View>

        {/* 4. PRIVACY & DATA */}
        <View style={styles.section}>
          <Text style={[TypographyScale.caption, styles.sectionHeader, { color: colors.textSecondary }]}>
            PRIVACY & DATA
          </Text>
          <GlassCard tint="default" elevation="raised" radius="md">
            <View style={styles.cardInner}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleClearCache}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="trash-outline" size={18} color={colors.riskMedium} />
                  <Text style={[TypographyScale.body, { color: colors.textPrimary, marginLeft: Spacing.sm }]}>
                    Clear Local Drafts & Cache
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TouchableOpacity
                style={styles.actionRow}
                onPress={() =>
                  handleComingSoon(
                    'Data Export',
                    'Direct export requests are undergoing hospital compliance audit. Please contact your system administrator.',
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="download-outline" size={18} color={colors.primaryLight} />
                  <Text style={[TypographyScale.body, { color: colors.textPrimary, marginLeft: Spacing.sm }]}>
                    Request Data Export
                  </Text>
                </View>
                <Text style={[TypographyScale.caption, { color: colors.textTertiary, fontStyle: 'italic' }]}>
                  Coming soon
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>

        {/* 5. SECURITY */}
        <View style={styles.section}>
          <Text style={[TypographyScale.caption, styles.sectionHeader, { color: colors.textSecondary }]}>
            SECURITY
          </Text>
          <GlassCard tint="default" elevation="raised" radius="md">
            <View style={styles.cardInner}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() =>
                  handleComingSoon(
                    'Biometric Unlock',
                    'Face ID / Biometric authentication will be enabled in the upcoming native app release.',
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="finger-print-outline" size={18} color={colors.primaryLight} />
                  <Text style={[TypographyScale.body, { color: colors.textPrimary, marginLeft: Spacing.sm }]}>
                    Biometric App Unlock
                  </Text>
                </View>
                <Text style={[TypographyScale.caption, { color: colors.textTertiary, fontStyle: 'italic' }]}>
                  Coming soon
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>

        {/* 6. SUPPORT & ABOUT */}
        <View style={styles.section}>
          <Text style={[TypographyScale.caption, styles.sectionHeader, { color: colors.textSecondary }]}>
            SUPPORT & ABOUT
          </Text>
          <GlassCard tint="default" elevation="raised" radius="md">
            <View style={styles.cardInner}>
              <View style={styles.actionRow}>
                <View style={styles.rowLeft}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.primaryLight} />
                  <Text style={[TypographyScale.body, { color: colors.textPrimary, marginLeft: Spacing.sm }]}>
                    App Version
                  </Text>
                </View>
                <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>
                  v{appVersion} (Production Build)
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TouchableOpacity
                style={styles.actionRow}
                onPress={() =>
                  Alert.alert(
                    'Clinical Disclaimer',
                    'VYRA AI risk scores are assistive probability models and do not replace professional medical judgment.',
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="medical-outline" size={18} color={colors.riskMedium} />
                  <Text style={[TypographyScale.body, { color: colors.textPrimary, marginLeft: Spacing.sm }]}>
                    Clinical Disclaimer
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>

        {/* 7. DANGER ZONE */}
        <View style={styles.section}>
          <Text style={[TypographyScale.caption, styles.sectionHeader, { color: colors.danger }]}>
            DANGER ZONE
          </Text>
          <GlassCard
            tint="elevated"
            elevation="raised"
            radius="md"
            style={[styles.dangerCard, { borderColor: `${colors.danger}40`, backgroundColor: `${colors.danger}08` }]}
          >
            <View style={styles.cardInner}>
              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <Ionicons name="log-out-outline" size={18} color={colors.danger} />
                  <Text style={[TypographyScale.body, { color: colors.danger, fontWeight: '700', marginLeft: Spacing.sm }]}>
                    Log Out of Session
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.danger} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: `${colors.danger}25` }]} />

              <View style={styles.dangerInfoRow}>
                <Text style={[TypographyScale.caption, { color: colors.textSecondary, lineHeight: 18 }]}>
                  To delete your clinical account or revoke access credentials, please contact your facility administrator.
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Back Button */}
        <Button
          title="Done"
          onPress={() => router.back()}
          variant="outline"
          style={styles.doneBtn}
        />
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
    paddingTop: 56, // Header clearance
    paddingBottom: 110, // Floating TabBar clearance
  },
  pageTitle: {
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  cardInner: {
    padding: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  rolePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    minHeight: 48,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
  },
  optionBlock: {
    padding: Spacing.md,
  },
  segmentedRow: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 3,
  },
  segmentOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    minHeight: 52,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  dangerCard: {
    borderWidth: 1,
  },
  dangerInfoRow: {
    padding: Spacing.md,
  },
  doneBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
});
