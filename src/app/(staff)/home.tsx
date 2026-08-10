/**
 * Staff Home — Spec §6.2
 * Dashboard summary with greeting, quick stats, new assessment CTA,
 * and recent assessments list.
 *
 * FIXED (post-F6 audit): Phase F0 left this screen wired to hardcoded
 * placeholder content ("Dr. Staff User", static "—" stats, always-empty
 * recent list) that was never revisited once real auth/assessment data
 * existed from later phases. This version follows the same
 * loading/error/empty pattern already used correctly in
 * (staff)/history/index.tsx, reusing the same API services.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
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
      // Most recent first
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

  // Refetch every time this screen comes into focus (e.g. after submitting
  // a new assessment and navigating back) — not just on first mount.
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const thisWeekCount = assessments.filter((a) => isWithinLast7Days(a.created_at)).length;
  const pendingReviewCount = assessments.filter((a) => a.status === 'pending_review').length;
  const recentThree = assessments.slice(0, 3);

  const firstName = user?.full_name?.split(' ')[0] ?? '';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>{getTimeOfDayGreeting()}</Text>
        <Text style={styles.userName}>{user?.full_name || 'there'}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, Shadows.card]}>
          {isLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.statNumber}>{thisWeekCount}</Text>
          )}
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={[styles.statCard, Shadows.card]}>
          {isLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            <Text style={styles.statNumber}>{pendingReviewCount}</Text>
          )}
          <Text style={styles.statLabel}>Pending Review</Text>
        </View>
      </View>

      {/* New Assessment CTA */}
      <Link href="/(staff)/new-assessment/patient-info" asChild>
        <Button title="＋  New Assessment" onPress={() => {}} style={styles.ctaButton} />
      </Link>

      {/* Recent Assessments */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Assessments</Text>
          {assessments.length > 0 ? (
            <Link href="/(staff)/history" style={styles.seeAllLink}>
              See all
            </Link>
          ) : null}
        </View>

        {isLoading ? (
          <View style={[styles.emptyCard, Shadows.card]}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={[styles.emptyCard, Shadows.card]}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <Button title="Retry" onPress={fetchDashboardData} style={styles.retryButton} />
          </View>
        ) : recentThree.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.card]}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No assessments yet</Text>
            <Text style={styles.emptySubtext}>
              Start a new assessment to see results here
            </Text>
          </View>
        ) : (
          recentThree.map((item) => {
            const patient = patients[item.patient_id];
            return (
              <TouchableOpacity
                key={item._id}
                style={[styles.assessmentRow, Shadows.card]}
                onPress={() => router.push(`/(staff)/history/${item._id}`)}
              >
                <View style={styles.assessmentRowLeft}>
                  <Text style={styles.assessmentPatientName}>
                    {patient?.full_name || 'Unknown patient'}
                  </Text>
                  <Text style={styles.assessmentDate}>
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <RiskBadge level={item.result.overall_risk} size="small" />
              </TouchableOpacity>
            );
          })
        )}
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
    paddingBottom: Spacing.xxl,
  },

  // Greeting
  greetingSection: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontFamily: Typography.regular,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontFamily: Typography.bold,
    fontSize: 26,
    color: Colors.textPrimary,
    marginTop: Spacing.xxs,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 76,
    justifyContent: 'center',
  },
  statNumber: {
    fontFamily: Typography.bold,
    fontSize: 28,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontFamily: Typography.medium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },

  // CTA
  ctaButton: {
    marginBottom: Spacing.lg,
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.semiBold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  seeAllLink: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.primaryLight,
  },

  // Assessment row
  assessmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  assessmentRowLeft: {
    flex: 1,
  },
  assessmentPatientName: {
    fontFamily: Typography.semiBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  assessmentDate: {
    fontFamily: Typography.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Empty / error state
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontFamily: Typography.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.md,
    minWidth: 120,
  },
});