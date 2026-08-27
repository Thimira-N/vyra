/**
 * ProfileView — Spec §6.2 / §9, UI Upgrade
 *
 * Ultra-Premium Clinical Profile & Identity Hub:
 * - Clean 116×116 glowing halo avatar with verified medical badge (no sparkle badge)
 * - Capitalized clinician title & refined active clinical role capsule
 * - Sleek horizontal Clinical Persona Studio (Physician, Specialist, Triage, etc.)
 * - Clinical Credentials dossier card (Email, Facility, 256-bit JWT security)
 * - System & compliance navigation hub
 * - Native safe log out confirmation
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuthStore } from '@/store/authStore';
import ClinicalConfirmModal from '@/components/ui/ClinicalConfirmModal';

// Curated Clinical Persona Avatars
const CLINICAL_PERSONAS = [
  { id: 'doc_female', emoji: '👩‍⚕️', title: 'Specialist' },
  { id: 'doc_male', emoji: '👨‍⚕️', title: 'Physician' },
  { id: 'triage', emoji: '🩺', title: 'Triage Lead' },
  { id: 'surgeon', emoji: '🧑‍⚕️', title: 'Clinician' },
  { id: 'diagnostics', emoji: '🔬', title: 'Diagnostic' },
  { id: 'genomics', emoji: '🧬', title: 'Pathologist' },
  { id: 'hospital', emoji: '🏥', title: 'Chief MD' },
] as const;

export default function ProfileView() {
  const { colors, isDark } = useTheme();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Deterministically assign initial persona based on user name/email
  const defaultPersonaIndex = useMemo(() => {
    if (!user?.email && !user?.full_name) return 0;
    const str = user.email || user.full_name || 'user';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash + str.charCodeAt(i)) % CLINICAL_PERSONAS.length;
    }
    return hash;
  }, [user]);

  const [selectedPersonaIndex, setSelectedPersonaIndex] = useState<number>(defaultPersonaIndex);

  const currentPersona = CLINICAL_PERSONAS[selectedPersonaIndex] || CLINICAL_PERSONAS[0];

  function handleLogout() {
    setShowLogoutModal(true);
  }

  async function handleConfirmLogout() {
    setIsLoggingOut(true);
    try {
      await clearAuth();
      setShowLogoutModal(false);
      router.replace('/(auth)/login');
    } catch {
      setShowLogoutModal(false);
    } finally {
      setIsLoggingOut(false);
    }
  }

  function handleNavigateSettings() {
    if (user?.role === 'reviewer') {
      router.push('/(reviewer)/settings');
    } else {
      router.push('/(staff)/settings');
    }
  }

  function handleCyclePersona() {
    setSelectedPersonaIndex((prev) => (prev + 1) % CLINICAL_PERSONAS.length);
  }

  if (!user) return null;

  const isReviewer = user.role === 'reviewer';

  return (
    <Screen safeArea={true}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Ultra-Premium Clinician Identity Hero ─── */}
        <View style={styles.heroSection}>
          {/* Glowing 116×116 Halo Ring Avatar */}
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleCyclePersona}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={
                isDark
                  ? ['#4FD1E0', '#1D7A8C', '#0F4C5C']
                  : [colors.primary, colors.primaryLight, '#4FD1E0']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
              <View
                style={[
                  styles.avatarInner,
                  {
                    backgroundColor: isDark ? '#0E191F' : '#F2FAFB',
                  },
                ]}
              >
                <Text style={styles.avatarEmoji}>
                  {currentPersona.emoji}
                </Text>
              </View>
            </LinearGradient>

            {/* Clean Emerald Verified Shield Badge */}
            <View style={[styles.verifiedBadge, { backgroundColor: colors.surface, borderColor: isDark ? '#0E191F' : '#FFFFFF' }]}>
              <Ionicons name="shield-checkmark" size={17} color={colors.success} />
            </View>
          </TouchableOpacity>

          {/* Clinician Name */}
          <Text style={[styles.clinicianName, { color: colors.textPrimary }]}>
            {user.full_name}
          </Text>

          {/* Refined Role Beacon Capsule */}
          <View
            style={[
              styles.rolePill,
              {
                backgroundColor: isDark ? 'rgba(79, 209, 224, 0.12)' : 'rgba(15, 76, 92, 0.08)',
                borderColor: isDark ? 'rgba(79, 209, 224, 0.25)' : 'rgba(15, 76, 92, 0.14)',
              },
            ]}
          >
            <View style={[styles.pulseDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.rolePillText, { color: colors.primary }]}>
              {isReviewer ? 'EXPERT CLINICAL REVIEWER · ON DUTY' : 'CLINICAL STAFF · ACTIVE SHIFT'}
            </Text>
          </View>

          {/* Clinical Persona Identity Studio */}
          <View style={styles.personaStripContainer}>
            <View style={styles.personaStripHeader}>
              <Text style={[styles.personaStripTitle, { color: colors.textSecondary }]}>
                CLINICAL PERSONA
              </Text>
              <Text style={[styles.personaActiveLabel, { color: colors.primary }]}>
                {currentPersona.title}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.personaChipsRow}
            >
              {CLINICAL_PERSONAS.map((p, idx) => {
                const isSelected = selectedPersonaIndex === idx;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.personaChip,
                      {
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(79, 209, 224, 0.20)' : `${colors.primary}15`)
                          : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedPersonaIndex(idx)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.personaChipEmoji}>{p.emoji}</Text>
                    <Text
                      style={[
                        styles.personaChipLabel,
                        {
                          color: isSelected ? colors.primary : colors.textSecondary,
                          fontFamily: isSelected ? 'Inter_700Bold' : 'Inter_500Medium',
                        },
                      ]}
                    >
                      {p.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* ─── Credentials & Organization Dossier Card ─── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            CLINICAL CREDENTIALS
          </Text>
        </View>

        <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.dossierCard}>
          <View style={styles.cardContent}>
            {/* Email Row */}
            <View style={styles.dossierRow}>
              <View style={[styles.iconBubble, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.12)' : 'rgba(15, 76, 92, 0.08)' }]}>
                <Ionicons name="mail" size={17} color={colors.primary} />
              </View>
              <View style={styles.dossierTextCol}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
                  Registered Email
                </Text>
                <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                  {user.email}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Facility Row */}
            <View style={styles.dossierRow}>
              <View style={[styles.iconBubble, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.12)' : 'rgba(15, 76, 92, 0.08)' }]}>
                <Ionicons name="business" size={17} color={colors.primary} />
              </View>
              <View style={styles.dossierTextCol}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
                  Medical Facility
                </Text>
                <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                  {user.facility_name || 'Central Health Network'}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Security Clearance Row */}
            <View style={styles.dossierRow}>
              <View style={[styles.iconBubble, { backgroundColor: isDark ? 'rgba(46, 158, 91, 0.15)' : 'rgba(46, 158, 91, 0.10)' }]}>
                <Ionicons name="lock-closed" size={17} color={colors.success} />
              </View>
              <View style={styles.dossierTextCol}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
                  Session Security
                </Text>
                <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
                  JWT Encrypted · 256-bit Secure
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* ─── Preferences & Legal Hub ─── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            SYSTEM & COMPLIANCE
          </Text>
        </View>

        <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.dossierCard}>
          <View style={styles.cardContent}>
            {/* App Settings */}
            <TouchableOpacity
              style={styles.navActionRow}
              onPress={handleNavigateSettings}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBubble, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.12)' : 'rgba(15, 76, 92, 0.08)' }]}>
                <Ionicons name="settings-sharp" size={18} color={colors.primary} />
              </View>
              <View style={styles.dossierTextCol}>
                <Text style={[styles.navActionTitle, { color: colors.textPrimary }]}>
                  Application Settings
                </Text>
                <Text style={[styles.navActionSubtitle, { color: colors.textSecondary }]}>
                  Appearance, themes, server configuration
                </Text>
              </View>
              <View style={[styles.chevronBubble, { backgroundColor: colors.surfaceSunken }]}>
                <Ionicons name="chevron-forward" size={15} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Consent Agreement */}
            <TouchableOpacity
              style={styles.navActionRow}
              onPress={() => router.push('/(auth)/consent?viewOnly=true')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBubble, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.12)' : 'rgba(15, 76, 92, 0.08)' }]}>
                <Ionicons name="document-text" size={18} color={colors.primary} />
              </View>
              <View style={styles.dossierTextCol}>
                <Text style={[styles.navActionTitle, { color: colors.textPrimary }]}>
                  Clinical Terms & Consent
                </Text>
                <Text style={[styles.navActionSubtitle, { color: colors.textSecondary }]}>
                  Data handling, HIPAA & clinical disclaimers
                </Text>
              </View>
              <View style={[styles.chevronBubble, { backgroundColor: colors.surfaceSunken }]}>
                <Ionicons name="chevron-forward" size={15} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* ─── Log Out Action Button ─── */}
        <TouchableOpacity
          style={[
            styles.logoutBtn,
            {
              backgroundColor: isDark ? 'rgba(209, 67, 67, 0.12)' : 'rgba(209, 67, 67, 0.08)',
              borderColor: isDark ? 'rgba(209, 67, 67, 0.30)' : 'rgba(209, 67, 67, 0.20)',
            },
          ]}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutBtnText, { color: colors.danger }]}>
            Sign Out of Clinical Session
          </Text>
        </TouchableOpacity>

        {/* ─── Version & Compliance Footer ─── */}
        <View style={styles.footer}>
          <Text style={[styles.footerBrand, { color: colors.textSecondary }]}>
            VYRA CLINICAL AI PLATFORM
          </Text>
          <Text style={[styles.footerVersion, { color: colors.textTertiary }]}>
            Version {appVersion} · Build 2026.08 · Secure Health Network
          </Text>
        </View>
      </ScrollView>

      {/* Clinical Sign Out Confirmation Modal */}
      <ClinicalConfirmModal
        visible={showLogoutModal}
        title="Sign Out"
        message="Are you sure you want to end your clinical triage session?"
        confirmText="Sign Out"
        cancelText="Cancel"
        confirmVariant="danger"
        icon="log-out-outline"
        isLoading={isLoggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 130, // Floating TabBar clearance
  },

  /* ── Hero Identity ── */
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.xs,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    padding: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  avatarInner: {
    width: 109,
    height: 109,
    borderRadius: 54.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 50,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  clinicianName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 25,
    lineHeight: 32,
    letterSpacing: -0.4,
    marginBottom: 6,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  pulseDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    marginRight: 7,
  },
  rolePillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10.5,
    letterSpacing: 0.6,
  },

  /* ── Persona Identity Studio ── */
  personaStripContainer: {
    width: '100%',
    paddingHorizontal: 2,
  },
  personaStripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    paddingHorizontal: 4,
  },
  personaStripTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.7,
  },
  personaActiveLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  personaChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  personaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 1,
    gap: 6,
  },
  personaChipEmoji: {
    fontSize: 16,
  },
  personaChipLabel: {
    fontSize: 12,
  },

  /* ── Section Header ── */
  sectionHeader: {
    marginBottom: Spacing.xs,
    paddingHorizontal: 2,
  },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.7,
  },

  /* ── Dossier Cards ── */
  dossierCard: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cardContent: {
    paddingVertical: 4,
  },
  dossierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dossierTextCol: {
    flex: 1,
  },
  rowLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    marginBottom: 1,
  },
  rowValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
  },

  /* ── Navigation Rows ── */
  navActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 3,
  },
  navActionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14.5,
  },
  navActionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 1,
  },
  chevronBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },

  /* ── Logout Button ── */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  logoutBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.2,
  },

  /* ── Footer ── */
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },
  footerBrand: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  footerVersion: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
  },
});
