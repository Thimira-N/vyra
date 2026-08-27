/**
 * Staff Home — Spec §6.2, UI Upgrade U4
 *
 * Premium Clinical Command Center:
 * - Dynamic clinical shift & date header with live system indicator
 * - Prominent "New Assessment" gradient action card with glowing CTA
 * - KPI Metrics with clinical icons & numerical typography
 * - AI Model status pill
 * - Elevated patient assessment cards with avatar pills & risk badges
 * - Preserved logic: getMyAssessments, getPatientById, sorting, error handling, focus refetch
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import RiskBadge from '@/components/ui/RiskBadge';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { getMyAssessments, type AssessmentOut } from '@/services/assessmentsApi';
import { getPatientById, type PatientOut } from '@/services/patientsApi';

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  const now = new Date();
  return now.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();
}

function isWithinLast7Days(isoDate: string): boolean {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
}

export default function StaffHomeScreen() {
  const { colors, isDark } = useTheme();
  const user = useAuthStore((s) => s.user);

  const [assessments, setAssessments] = useState<AssessmentOut[]>([]);
  const [patients, setPatients] = useState<Record<string, PatientOut>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    setError('');
    try {
      const data = await getMyAssessments();
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAssessments(sorted);

      const recentThree = sorted.slice(0, 4);
      const patientIds = Array.from(new Set(recentThree.map((a) => a.patient_id)));
      const fetched = await Promise.all(
        patientIds.map((id) => getPatientById(id).catch(() => null))
      );
      const patientMap: Record<string, PatientOut> = {};
      fetched.forEach((p) => {
        if (p) patientMap[p._id] = p;
      });
      setPatients(patientMap);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || 'Failed to load your dashboard. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData(true);
  };

  const thisWeekCount = assessments.filter((a) => isWithinLast7Days(a.created_at)).length;
  const pendingReviewCount = assessments.filter((a) => a.status === 'pending_review').length;
  const highRiskCount = assessments.filter((a) => a.result?.overall_risk === 'High').length;
  const recentItems = assessments.slice(0, 4);

  return (
    <Screen safeArea={true}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ─── Top Clinical Status & Greeting Bar ─── */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerSection}>
          <View style={styles.topMetaRow}>
            <View style={styles.brandRow}>
              <Image
                source={require('../../../assets/images/icon.png')}
                style={styles.brandLogo}
                contentFit="contain"
              />
              <Text style={[styles.brandName, { color: colors.textPrimary }]}>Vyra</Text>

              <View style={[styles.datePill, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.12)' : 'rgba(15, 76, 92, 0.08)', borderColor: isDark ? 'rgba(79, 209, 224, 0.22)' : 'rgba(15, 76, 92, 0.12)' }]}>
                <View style={[styles.pulseDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.dateText, { color: colors.primary }]}>
                  {getFormattedDate()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.bellBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                  borderColor: colors.border,
                },
              ]}
              onPress={() => router.push('/(staff)/notifications')}
              activeOpacity={0.75}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
              {useNotificationStore.getState().notifications.length > 0 && (
                <View style={[styles.bellBadge, { backgroundColor: colors.riskHigh }]} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.greetingContainer}>
            <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>
              {getTimeOfDayGreeting()},
            </Text>
            <Text style={[styles.greetingName, { color: colors.textPrimary }]}>
              {user?.full_name ? user.full_name : 'Doctor'}
            </Text>

            {user?.facility_name ? (
              <View style={styles.facilityRow}>
                <View style={[styles.facilityPill, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.surfaceSunken, borderColor: colors.border }]}>
                  <Ionicons name="business" size={13} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.facilityText, { color: colors.textPrimary }]}>
                    {user.facility_name}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </Animated.View>

        {/* ─── Hero Primary Action: New Risk Assessment ─── */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push('/(staff)/new-assessment/patient-info')}
            style={[styles.heroActionWrapper, { shadowColor: colors.primary }]}
          >
            <LinearGradient
              colors={
                isDark
                  ? ['#0F3B4A', '#0A2530']
                  : [colors.primary, colors.primaryLight]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroActionGradient}
            >
              <View style={styles.heroActionContent}>
                <View style={styles.heroActionBadge}>
                  <Ionicons name="flash-outline" size={14} color="#4FD1E0" />
                  <Text style={styles.heroActionBadgeText}>AI-POWERED STRATIFICATION</Text>
                </View>
                <Text style={styles.heroActionTitle}>New Risk Assessment</Text>
                <Text style={styles.heroActionDesc}>
                  Multimodal deep learning evaluation of vital clinical indicators
                </Text>

                <View style={styles.heroActionBtnRow}>
                  <View style={styles.heroActionBtn}>
                    <Ionicons name="add" size={18} color={isDark ? '#0B1418' : colors.primary} />
                    <Text style={[styles.heroActionBtnText, { color: isDark ? '#0B1418' : colors.primary }]}>
                      Start Assessment
                    </Text>
                  </View>
                </View>
              </View>

              {/* Decorative circular pattern in card */}
              <View style={styles.heroDecoCircle1} />
              <View style={styles.heroDecoCircle2} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ─── KPI Quick Stats Row ─── */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.kpiRow}>
          {/* This Week */}
          <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.kpiCard}>
            <View style={styles.kpiInner}>
              <View style={[styles.kpiIconWrapper, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.12)' : 'rgba(15, 76, 92, 0.08)' }]}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              </View>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={styles.kpiSpinner} />
              ) : (
                <Text style={[styles.kpiNumber, { color: colors.textPrimary }]}>
                  {thisWeekCount}
                </Text>
              )}
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                This Week
              </Text>
            </View>
          </GlassCard>

          {/* Pending Review */}
          <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.kpiCard}>
            <View style={styles.kpiInner}>
              <View style={[styles.kpiIconWrapper, { backgroundColor: `${colors.riskMedium}18` }]}>
                <Ionicons name="hourglass-outline" size={18} color={colors.riskMedium} />
              </View>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.riskMedium} style={styles.kpiSpinner} />
              ) : (
                <Text style={[styles.kpiNumber, { color: pendingReviewCount > 0 ? colors.riskMedium : colors.textPrimary }]}>
                  {pendingReviewCount}
                </Text>
              )}
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                Pending Review
              </Text>
            </View>
          </GlassCard>

          {/* High Risk Alerts */}
          <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.kpiCard}>
            <View style={styles.kpiInner}>
              <View style={[styles.kpiIconWrapper, { backgroundColor: `${colors.riskHigh}18` }]}>
                <Ionicons name="alert-circle-outline" size={18} color={colors.riskHigh} />
              </View>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.riskHigh} style={styles.kpiSpinner} />
              ) : (
                <Text style={[styles.kpiNumber, { color: highRiskCount > 0 ? colors.riskHigh : colors.textPrimary }]}>
                  {highRiskCount}
                </Text>
              )}
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
                High Risk
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ─── AI Engine Status Bar ─── */}
        <Animated.View entering={FadeInDown.duration(600).delay(280)}>
          <View style={[styles.engineBar, { backgroundColor: isDark ? colors.surfaceSunken : 'rgba(255, 255, 255, 0.75)', borderColor: colors.border }]}>
            <Ionicons name="hardware-chip-outline" size={16} color={colors.primary} />
            <Text style={[styles.engineText, { color: colors.textSecondary }]}>
              Stratification Engine <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>v2.4 Active</Text> • Multimodal Risk Pipeline
            </Text>
          </View>
        </Animated.View>

        {/* ─── Recent Patient Assessments ─── */}
        <Animated.View entering={FadeInUp.duration(600).delay(350)} style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="time-outline" size={18} color={colors.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[TypographyScale.h3, { color: colors.textPrimary }]}>
                Recent Patients
              </Text>
            </View>
            {assessments.length > 0 ? (
              <Link href="/(staff)/history" style={[styles.seeAllLink, { color: colors.primary }]}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See all ({assessments.length})</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </Link>
            ) : null}
          </View>

          {isLoading ? (
            <GlassCard tint="default" elevation="raised" radius="lg" style={styles.loadingCard}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading patient records...</Text>
            </GlassCard>
          ) : error ? (
            <GlassCard tint="default" elevation="raised" radius="lg" style={styles.emptyCard}>
              <View style={styles.emptyCardInner}>
                <Ionicons name="alert-circle" size={36} color={colors.danger} />
                <Text style={[TypographyScale.body, { color: colors.danger, textAlign: 'center', marginTop: Spacing.xs }]}>
                  {error}
                </Text>
                <Button title="Retry" onPress={() => fetchDashboardData()} style={styles.retryButton} />
              </View>
            </GlassCard>
          ) : recentItems.length === 0 ? (
            <GlassCard tint="default" elevation="raised" radius="lg" style={styles.emptyCard}>
              <View style={styles.emptyCardInner}>
                <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary}12` }]}>
                  <Ionicons name="clipboard-outline" size={32} color={colors.primary} />
                </View>
                <Text style={[TypographyScale.h3, { color: colors.textPrimary, textAlign: 'center', marginTop: Spacing.sm }]}>
                  No assessments recorded
                </Text>
                <Text style={[TypographyScale.bodySm, { color: colors.textSecondary, marginTop: Spacing.xxs, textAlign: 'center' }]}>
                  Start a new risk assessment to stratify patient clinical factors.
                </Text>
                <Link href="/(staff)/new-assessment/patient-info" asChild>
                  <Button title="Start First Assessment" onPress={() => {}} style={{ marginTop: Spacing.md }} />
                </Link>
              </View>
            </GlassCard>
          ) : (
            recentItems.map((item, index) => {
              const patient = patients[item.patient_id];
              const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });
              const timeStr = new Date(item.created_at).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <GlassCard
                  key={item._id}
                  tint="elevated"
                  elevation="raised"
                  radius="lg"
                  style={styles.patientCard}
                >
                  <TouchableOpacity
                    style={styles.patientRow}
                    onPress={() => router.push(`/(staff)/history/${item._id}`)}
                    activeOpacity={0.7}
                  >
                    {/* Left Patient Initial Badge */}
                    <View style={[styles.avatarBadge, { backgroundColor: isDark ? colors.surfaceRaised : `${colors.primary}12` }]}>
                      <Text style={[styles.avatarText, { color: colors.primary }]}>
                        {patient?.full_name ? patient.full_name.charAt(0).toUpperCase() : 'P'}
                      </Text>
                    </View>

                    {/* Center Info */}
                    <View style={styles.patientInfo}>
                      <View style={styles.patientTitleRow}>
                        <Text style={[styles.patientName, { color: colors.textPrimary }]} numberOfLines={1}>
                          {patient?.full_name || 'Patient'}
                        </Text>
                        {patient?.patient_ref ? (
                          <View style={[styles.refBadge, { backgroundColor: colors.surfaceSunken }]}>
                            <Text style={[styles.refText, { color: colors.textSecondary }]}>
                              {patient.patient_ref}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.patientMetaRow}>
                        <Ionicons name="time-outline" size={12} color={colors.textTertiary} style={{ marginRight: 3 }} />
                        <Text style={[styles.patientMetaText, { color: colors.textSecondary }]}>
                          {dateStr} • {timeStr}
                        </Text>
                        {item.status === 'pending_review' ? (
                          <Text style={[styles.pendingDotText, { color: colors.riskMedium }]}>
                            • Pending Review
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {/* Right Risk Badge + Chevron */}
                    <View style={styles.patientRight}>
                      <RiskBadge level={item.result.overall_risk} size="small" />
                      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} style={{ marginLeft: 6 }} />
                    </View>
                  </TouchableOpacity>
                </GlassCard>
              );
            })
          )}
        </Animated.View>
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
    paddingTop: Spacing.lg,
    paddingBottom: 110, // Floating TabBar clearance
  },

  /* ── Header Section ── */
  headerSection: {
    marginBottom: Spacing.md,
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  brandName: {
    fontFamily: TypographyScale.h3.fontFamily,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginRight: 4,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  dateText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  bellBadge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  greetingContainer: {
    marginTop: 2,
  },
  greetingSub: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: 15,
  },
  greetingName: {
    fontFamily: TypographyScale.display.fontFamily,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  facilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  facilityText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },

  /* ── Hero Action Card ── */
  heroActionWrapper: {
    borderRadius: 24,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  heroActionGradient: {
    borderRadius: 24,
    padding: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  heroActionContent: {
    zIndex: 2,
  },
  heroActionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
    gap: 4,
  },
  heroActionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroActionTitle: {
    fontFamily: TypographyScale.h1.fontFamily,
    fontSize: 22,
    lineHeight: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroActionDesc: {
    fontFamily: TypographyScale.bodySm.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 3,
    marginBottom: Spacing.md,
    maxWidth: '90%',
  },
  heroActionBtnRow: {
    flexDirection: 'row',
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  heroActionBtnText: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  heroDecoCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroDecoCircle2: {
    position: 'absolute',
    bottom: -60,
    right: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  /* ── KPI Row ── */
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
    marginBottom: Spacing.sm,
  },
  kpiCard: {
    flex: 1,
  },
  kpiInner: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiNumber: {
    fontFamily: TypographyScale.display.fontFamily,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  kpiSpinner: {
    height: 30,
    justifyContent: 'center',
  },

  /* ── Engine Status Bar ── */
  engineBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: 8,
  },
  engineText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
    flex: 1,
  },

  /* ── Section Header ── */
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },

  /* ── Patient Assessment Cards ── */
  patientCard: {
    marginBottom: Spacing.xs + 2,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  avatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontFamily: TypographyScale.h3.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  patientInfo: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  patientTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  patientName: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  refBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  refText: {
    fontSize: 10,
    fontWeight: '600',
  },
  patientMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  patientMetaText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
  },
  pendingDotText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  patientRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* ── States ── */
  loadingCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 13,
  },
  emptyCard: {
    marginBottom: Spacing.sm,
  },
  emptyCardInner: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    marginTop: Spacing.md,
    minWidth: 120,
  },
});