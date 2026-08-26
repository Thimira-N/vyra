/**
 * Reviewer Dashboard — Spec §6.3, UI Upgrade U5
 *
 * "Clinical Glass" restyle:
 * - Screen wrapper with gradient mesh + blob accents
 * - Filter chips with pill radius and theme colors
 * - Queue cards in elevated GlassCards with RiskBadge and status pills
 * - Safe area & floating tab bar clearance
 * - Preserved logic: getReviewerDashboard, getPatientById, filters, navigation to case detail
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius, type RiskLevel } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import RiskBadge from '@/components/ui/RiskBadge';
import { getReviewerDashboard, type DashboardParams } from '@/services/reviewerApi';
import { getPatientById, type PatientOut } from '@/services/patientsApi';
import type { AssessmentOut } from '@/services/assessmentsApi';

export default function ReviewerDashboardScreen() {
  const { colors } = useTheme();
  const [assessments, setAssessments] = useState<AssessmentOut[]>([]);
  const [patients, setPatients] = useState<Record<string, PatientOut>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Active filters sent to backend
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  useEffect(() => {
    fetchDashboard();
  }, [statusFilter, riskFilter]);

  async function fetchDashboard() {
    setIsLoading(true);
    setError('');

    try {
      const params: DashboardParams = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (riskFilter !== 'All') {
        params.overall_risk = riskFilter;
      }

      const data = await getReviewerDashboard(params);
      setAssessments(data);

      const patientIds = Array.from(new Set(data.map((a) => a.patient_id)));
      const patientPromises = patientIds.map((id) =>
        getPatientById(id).catch(() => null)
      );
      const fetchedPatients = await Promise.all(patientPromises);

      const patientMap: Record<string, PatientOut> = {};
      fetchedPatients.forEach((p) => {
        if (p) patientMap[p._id] = p;
      });

      setPatients(patientMap);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || 'Failed to load dashboard. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function renderItem({ item }: { item: AssessmentOut }) {
    const patient = patients[item.patient_id];
    const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <GlassCard tint="default" elevation="raised" radius="md" style={styles.rowCard}>
        <TouchableOpacity
          style={styles.rowInner}
          activeOpacity={0.7}
          onPress={() => router.push(`/(reviewer)/case/${item._id}`)}
        >
          <View style={styles.rowHeader}>
            <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '600', flex: 1 }]}>
              {patient ? `${patient.full_name} (${patient.patient_ref})` : 'Loading patient...'}
            </Text>
            <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginLeft: Spacing.sm }]}>
              {dateStr}
            </Text>
          </View>

          <View style={styles.staffRow}>
            <Text style={[TypographyScale.caption, { color: colors.textTertiary }]}>Staff ID:</Text>
            <Text style={[TypographyScale.caption, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1} ellipsizeMode="middle">
              {item.created_by}
            </Text>
          </View>

          <View style={styles.rowFooter}>
            <RiskBadge level={item.result.overall_risk as RiskLevel} size="small" />

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === 'reviewed'
                      ? `${colors.riskLow}18`
                      : `${colors.riskMedium}18`,
                },
              ]}
            >
              <Text
                style={[
                  TypographyScale.caption,
                  {
                    color: item.status === 'reviewed' ? colors.riskLow : colors.riskMedium,
                    fontWeight: '600',
                    fontSize: 11,
                  },
                ]}
              >
                {item.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </GlassCard>
    );
  }

  // Initial Loading State
  if (isLoading && assessments.length === 0) {
    return (
      <Screen safeArea={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[TypographyScale.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
            Loading dashboard...
          </Text>
        </View>
      </Screen>
    );
  }

  // Initial Error State
  if (error && assessments.length === 0) {
    return (
      <Screen safeArea={false}>
        <View style={styles.centerContainer}>
          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.errorCard}>
            <View style={styles.errorInner}>
              <Text style={[TypographyScale.body, { color: colors.danger, textAlign: 'center' }]}>
                {error}
              </Text>
              <Button title="Retry" onPress={fetchDashboard} variant="outline" style={{ marginTop: Spacing.md }} />
            </View>
          </GlassCard>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea={false}>
      <View style={styles.container}>
        <Text style={[TypographyScale.h1, styles.title, { color: colors.textPrimary }]}>
          Reviewer Dashboard
        </Text>

        {/* Filters */}
        <GlassCard tint="default" elevation="raised" radius="md" style={styles.filtersCard}>
          <View style={styles.filtersInner}>
            {/* Status Filters */}
            <View style={styles.filterGroup}>
              <Text style={[TypographyScale.caption, styles.filterLabel, { color: colors.textSecondary }]}>
                Status:
              </Text>
              <View style={styles.chipRow}>
                {(['all', 'pending_review', 'reviewed'] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: statusFilter === s ? colors.primary : colors.surfaceSunken,
                        borderColor: statusFilter === s ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setStatusFilter(s)}
                  >
                    <Text
                      style={[
                        TypographyScale.caption,
                        {
                          color: statusFilter === s ? colors.textOnPrimary : colors.textSecondary,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {s === 'all' ? 'All' : s === 'pending_review' ? 'Pending' : 'Reviewed'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Risk Filters */}
            <View style={styles.filterGroup}>
              <Text style={[TypographyScale.caption, styles.filterLabel, { color: colors.textSecondary }]}>
                Risk:
              </Text>
              <View style={styles.chipRow}>
                {(['All', 'Low', 'Medium', 'High'] as const).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: riskFilter === r ? colors.primary : colors.surfaceSunken,
                        borderColor: riskFilter === r ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setRiskFilter(r)}
                  >
                    <Text
                      style={[
                        TypographyScale.caption,
                        {
                          color: riskFilter === r ? colors.textOnPrimary : colors.textSecondary,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Refreshing indicator */}
        {isLoading && assessments.length > 0 && (
          <View style={styles.refreshingBar}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[TypographyScale.caption, { color: colors.primary }]}>Updating...</Text>
          </View>
        )}

        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}15`, borderColor: `${colors.danger}35` }]}>
            <Text style={[TypographyScale.caption, { color: colors.danger }]}>{error}</Text>
          </View>
        ) : null}

        <FlatList
          data={assessments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <GlassCard tint="default" elevation="raised" radius="md" style={styles.emptyCard}>
              <View style={styles.emptyInner}>
                <Text style={[TypographyScale.body, { color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic' }]}>
                  No assessments found matching the selected filters.
                </Text>
              </View>
            </GlassCard>
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 96 : 84, // Header clearance
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.md,
  },
  filtersCard: {
    marginBottom: Spacing.md,
  },
  filtersInner: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  filterGroup: {
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  filterLabel: {
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  refreshingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  listContent: {
    paddingBottom: 96, // Floating TabBar clearance
  },
  rowCard: {
    marginBottom: Spacing.sm,
  },
  rowInner: {
    padding: Spacing.md,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xxs,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 4,
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  emptyCard: {
    marginTop: Spacing.md,
  },
  emptyInner: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  errorCard: {
    width: '100%',
  },
  errorInner: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
});
