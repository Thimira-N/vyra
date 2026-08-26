/**
 * Staff Home — Spec §6.2, UI Upgrade U4
 *
 * "Clinical Glass" restyle:
 * - Screen wrapper with gradient mesh + blob accents
 * - Stat cards & recent items in elevated GlassCards
 * - Safe area & header clearance (paddingTop for translucent header, paddingBottom for floating tab bar)
 * - Preserved logic: getMyAssessments & getPatientById loading, sorting, error handling, focus refetch
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
} from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import RiskBadge from '@/components/ui/RiskBadge';
import { useAuthStore } from '@/store/authStore';
import { getMyAssessments, type AssessmentOut } from '@/services/assessmentsApi';
import { getPatientById, type PatientOut } from '@/services/patientsApi';

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function isWithinLast7Days(isoDate: string): boolean {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
}

export default function StaffHomeScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);

  const [assessments, setAssessments] = useState<AssessmentOut[]>([]);
  const [patients, setPatients] = useState<Record<string, PatientOut>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getMyAssessments();
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAssessments(sorted);

      const recentThree = sorted.slice(0, 3);
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
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const thisWeekCount = assessments.filter((a) => isWithinLast7Days(a.created_at)).length;
  const pendingReviewCount = assessments.filter((a) => a.status === 'pending_review').length;
  const recentThree = assessments.slice(0, 3);

  return (
    <Screen safeArea={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={[TypographyScale.bodyLg, { color: colors.textSecondary }]}>
            {getTimeOfDayGreeting()}
          </Text>
          <Text style={[TypographyScale.h1, { color: colors.textPrimary, marginTop: Spacing.xxs }]}>
            {user?.full_name || 'there'}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.statCard}>
            <View style={styles.statCardInner}>
              {isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={[TypographyScale.h1, styles.statNumber, { color: colors.primary }]}>
                  {thisWeekCount}
                </Text>
              )}
              <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: Spacing.xxs }]}>
                This Week
              </Text>
            </View>
          </GlassCard>

          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.statCard}>
            <View style={styles.statCardInner}>
              {isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={[TypographyScale.h1, styles.statNumber, { color: colors.primary }]}>
                  {pendingReviewCount}
                </Text>
              )}
              <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: Spacing.xxs }]}>
                Pending Review
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* New Assessment CTA */}
        <Link href="/(staff)/new-assessment/patient-info" asChild>
          <Button title="＋  New Assessment" onPress={() => {}} style={styles.ctaButton} />
        </Link>

        {/* Recent Assessments */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[TypographyScale.h3, { color: colors.textPrimary }]}>
              Recent Assessments
            </Text>
            {assessments.length > 0 ? (
              <Link href="/(staff)/history" style={[styles.seeAllLink, { color: colors.primaryLight }]}>
                See all
              </Link>
            ) : null}
          </View>

          {isLoading ? (
            <GlassCard tint="default" elevation="raised" radius="md" style={styles.emptyCard}>
              <View style={styles.emptyCardInner}>
                <ActivityIndicator color={colors.primary} />
              </View>
            </GlassCard>
          ) : error ? (
            <GlassCard tint="default" elevation="raised" radius="md" style={styles.emptyCard}>
              <View style={styles.emptyCardInner}>
                <Text style={styles.emptyIcon}>⚠️</Text>
                <Text style={[TypographyScale.body, { color: colors.danger, textAlign: 'center' }]}>
                  {error}
                </Text>
                <Button title="Retry" onPress={fetchDashboardData} style={styles.retryButton} />
              </View>
            </GlassCard>
          ) : recentThree.length === 0 ? (
            <GlassCard tint="default" elevation="raised" radius="md" style={styles.emptyCard}>
              <View style={styles.emptyCardInner}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={[TypographyScale.h3, { color: colors.textPrimary, textAlign: 'center' }]}>
                  No assessments yet
                </Text>
                <Text style={[TypographyScale.bodySm, { color: colors.textSecondary, marginTop: Spacing.xxs, textAlign: 'center' }]}>
                  Start a new assessment to see results here
                </Text>
              </View>
            </GlassCard>
          ) : (
            recentThree.map((item) => {
              const patient = patients[item.patient_id];
              return (
                <GlassCard key={item._id} tint="default" elevation="raised" radius="md" style={styles.assessmentCard}>
                  <TouchableOpacity
                    style={styles.assessmentRow}
                    onPress={() => router.push(`/(staff)/history/${item._id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.assessmentRowLeft}>
                      <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                        {patient?.full_name || 'Unknown patient'}
                      </Text>
                      <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <RiskBadge level={item.result.overall_risk} size="small" />
                  </TouchableOpacity>
                </GlassCard>
              );
            })
          )}
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
  greetingSection: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
  },
  statCardInner: {
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  statNumber: {
    fontVariant: ['tabular-nums'],
  },
  ctaButton: {
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  seeAllLink: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  assessmentCard: {
    marginBottom: Spacing.xs,
  },
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  assessmentRowLeft: {
    flex: 1,
  },
  emptyCard: {
    marginBottom: Spacing.sm,
  },
  emptyCardInner: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  retryButton: {
    marginTop: Spacing.md,
    minWidth: 120,
  },
});