/**
 * Reviewer Dashboard — Spec §6.3, UI Upgrade U5
 *
 * Premium Clinical Review Queue:
 * - Top validation queue banner with live case counters
 * - Horizontal segmented status & risk filter bar with color-coded badges
 * - Case cards with left-border risk indicators, patient refs, and status pills
 * - Safe area & floating tab bar clearance
 * - Preserved logic: getReviewerDashboard, getPatientById, filters, navigation to case detail
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
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
  const { colors, isDark } = useTheme();
  const [assessments, setAssessments] = useState<AssessmentOut[]>([]);
  const [patients, setPatients] = useState<Record<string, PatientOut>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Active filters sent to backend
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  const fetchDashboard = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
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
      setIsRefreshing(false);
    }
  }, [statusFilter, riskFilter]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboard(true);
  };

  const pendingTotal = assessments.filter((a) => a.status === 'pending_review').length;
  const highRiskTotal = assessments.filter((a) => a.result?.overall_risk === 'High').length;
  const reviewedTotal = assessments.filter((a) => a.status === 'reviewed').length;

  function renderItem({ item, index }: { item: AssessmentOut; index: number }) {
    const patient = patients[item.patient_id];
    const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = new Date(item.created_at).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    const isReviewed = item.status === 'reviewed';
    const risk = (item.result?.overall_risk || 'Low') as RiskLevel;

    // Accent line color for risk
    const riskBorderColor =
      risk === 'High'
        ? colors.riskHigh
        : risk === 'Medium'
          ? colors.riskMedium
          : colors.riskLow;

    return (
      <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.rowCard}>
        <TouchableOpacity
          style={styles.rowInner}
          activeOpacity={0.7}
          onPress={() => router.push(`/(reviewer)/case/${item._id}`)}
        >
          {/* Left Risk Color Accent Strip */}
          <View style={[styles.riskAccentStrip, { backgroundColor: riskBorderColor }]} />

          <View style={styles.cardContent}>
            {/* Header row: Patient Name + Date */}
            <View style={styles.rowHeader}>
              <View style={styles.patientTitleBlock}>
                <Text style={[styles.patientName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {patient ? patient.full_name : 'Loading patient...'}
                </Text>
                {patient?.patient_ref ? (
                  <View style={[styles.refTag, { backgroundColor: colors.surfaceSunken }]}>
                    <Text style={[styles.refTagText, { color: colors.textSecondary }]}>
                      {patient.patient_ref}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {dateStr}
              </Text>
            </View>

            {/* Submitter info row */}
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={12} color={colors.textTertiary} />
              <Text style={[styles.metaLabel, { color: colors.textTertiary }]}>Staff ID:</Text>
              <Text style={[styles.metaVal, { color: colors.textSecondary }]} numberOfLines={1} ellipsizeMode="middle">
                {item.created_by}
              </Text>
              <Text style={[styles.metaTime, { color: colors.textTertiary }]}>• {timeStr}</Text>
            </View>

            {/* Footer row: RiskBadge + Status Pill + Chevron */}
            <View style={styles.rowFooter}>
              <View style={styles.badgeGroup}>
                <RiskBadge level={risk} size="small" />

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isReviewed
                        ? `${colors.riskLow}18`
                        : `${colors.riskMedium}18`,
                    },
                  ]}
                >
                  <Ionicons
                    name={isReviewed ? 'checkmark-circle' : 'time'}
                    size={12}
                    color={isReviewed ? colors.riskLow : colors.riskMedium}
                    style={{ marginRight: 3 }}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: isReviewed ? colors.riskLow : colors.riskMedium },
                    ]}
                  >
                    {isReviewed ? 'Reviewed' : 'Pending Review'}
                  </Text>
                </View>
              </View>

              <View style={styles.chevronWrapper}>
                <Text style={[styles.viewDetailsText, { color: colors.primary }]}>Review</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </GlassCard>
    );
  }

  return (
    <Screen safeArea={false}>
      <View style={styles.container}>
        {/* ─── Header & Live Queue Title ─── */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerArea}>
          <View style={styles.queueMetaRow}>
            <View style={[styles.liveQueuePill, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.12)' : 'rgba(15, 76, 92, 0.08)' }]}>
              <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.liveQueueText, { color: colors.primary }]}>
                EXPERT REVIEW QUEUE
              </Text>
            </View>
            <Text style={[styles.queueCount, { color: colors.textSecondary }]}>
              {assessments.length} cases total
            </Text>
          </View>

          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Reviewer Dashboard
          </Text>
        </Animated.View>

        {/* ─── KPI Summary Strip ─── */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.kpiStrip}>
          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.kpiCard}>
            <View style={styles.kpiInner}>
              <Text style={[styles.kpiVal, { color: colors.textPrimary }]}>{assessments.length}</Text>
              <Text style={[styles.kpiTitle, { color: colors.textSecondary }]}>Total Cases</Text>
            </View>
          </GlassCard>

          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.kpiCard}>
            <View style={styles.kpiInner}>
              <Text style={[styles.kpiVal, { color: pendingTotal > 0 ? colors.riskMedium : colors.textPrimary }]}>
                {pendingTotal}
              </Text>
              <Text style={[styles.kpiTitle, { color: colors.textSecondary }]}>Pending</Text>
            </View>
          </GlassCard>

          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.kpiCard}>
            <View style={styles.kpiInner}>
              <Text style={[styles.kpiVal, { color: highRiskTotal > 0 ? colors.riskHigh : colors.textPrimary }]}>
                {highRiskTotal}
              </Text>
              <Text style={[styles.kpiTitle, { color: colors.textSecondary }]}>High Risk</Text>
            </View>
          </GlassCard>

          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.kpiCard}>
            <View style={styles.kpiInner}>
              <Text style={[styles.kpiVal, { color: colors.riskLow }]}>{reviewedTotal}</Text>
              <Text style={[styles.kpiTitle, { color: colors.textSecondary }]}>Reviewed</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ─── Filters Bar ─── */}
        <Animated.View entering={FadeInDown.duration(600).delay(150)}>
          <GlassCard tint="default" elevation="raised" radius="lg" style={styles.filtersCard}>
            <View style={styles.filtersInner}>
              {/* Status Segmented Pills */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterHeading, { color: colors.textSecondary }]}>
                  Status
                </Text>
                <View style={styles.chipRow}>
                  {(['all', 'pending_review', 'reviewed'] as const).map((s) => {
                    const isSelected = statusFilter === s;
                    const label = s === 'all' ? 'All' : s === 'pending_review' ? 'Pending' : 'Reviewed';
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.filterChip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceSunken,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setStatusFilter(s)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color: isSelected ? colors.textOnPrimary : colors.textSecondary,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Risk Level Pills */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterHeading, { color: colors.textSecondary }]}>
                  Risk Tier
                </Text>
                <View style={styles.chipRow}>
                  {(['All', 'Low', 'Medium', 'High'] as const).map((r) => {
                    const isSelected = riskFilter === r;
                    const dotColor =
                      r === 'High'
                        ? colors.riskHigh
                        : r === 'Medium'
                          ? colors.riskMedium
                          : r === 'Low'
                            ? colors.riskLow
                            : undefined;

                    return (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.filterChip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceSunken,
                            borderColor: isSelected ? colors.primary : colors.border,
                          },
                        ]}
                        onPress={() => setRiskFilter(r)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.chipContent}>
                          {dotColor && !isSelected && (
                            <View style={[styles.chipDot, { backgroundColor: dotColor }]} />
                          )}
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: isSelected ? colors.textOnPrimary : colors.textSecondary,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {r}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Error Banner */}
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}15`, borderColor: `${colors.danger}35` }]}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={[TypographyScale.caption, { color: colors.danger, flex: 1 }]}>{error}</Text>
          </View>
        ) : null}

        {/* ─── Case List ─── */}
        <FlatList
          data={assessments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            isLoading ? (
              <GlassCard tint="default" elevation="raised" radius="lg" style={styles.stateCard}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.stateText, { color: colors.textSecondary }]}>
                  Loading clinical cases...
                </Text>
              </GlassCard>
            ) : (
              <GlassCard tint="default" elevation="raised" radius="lg" style={styles.stateCard}>
                <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary}12` }]}>
                  <Ionicons name="checkmark-done" size={32} color={colors.primary} />
                </View>
                <Text style={[TypographyScale.h3, { color: colors.textPrimary, textAlign: 'center', marginTop: Spacing.sm }]}>
                  No cases found
                </Text>
                <Text style={[TypographyScale.bodySm, { color: colors.textSecondary, textAlign: 'center', marginTop: Spacing.xxs }]}>
                  No assessments match the selected status and risk filters.
                </Text>
              </GlassCard>
            )
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
    paddingTop: Platform.OS === 'ios' ? 104 : 92, // Header clearance
  },

  /* ── Header Area ── */
  headerArea: {
    marginBottom: Spacing.sm,
  },
  queueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  liveQueuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  liveQueueText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  queueCount: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
    fontWeight: '500',
  },
  headerTitle: {
    fontFamily: TypographyScale.display.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  /* ── KPI Strip ── */
  kpiStrip: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  kpiCard: {
    flex: 1,
  },
  kpiInner: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiVal: {
    fontFamily: TypographyScale.display.fontFamily,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  kpiTitle: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },

  /* ── Filters Card ── */
  filtersCard: {
    marginBottom: Spacing.md,
  },
  filtersInner: {
    padding: Spacing.sm + 2,
    gap: Spacing.xs + 2,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterHeading: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    width: 60,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  chipText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
  },

  /* ── Case List ── */
  listContent: {
    paddingBottom: 110, // Floating TabBar clearance
  },
  rowCard: {
    marginBottom: Spacing.xs + 2,
    overflow: 'hidden',
  },
  rowInner: {
    flexDirection: 'row',
  },
  riskAccentStrip: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  patientName: {
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  refTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  refTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dateText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  metaLabel: {
    fontSize: 11,
  },
  metaVal: {
    fontSize: 11,
    maxWidth: 120,
  },
  metaTime: {
    fontSize: 11,
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  statusBadgeText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  chevronWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },

  /* ── States ── */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: 6,
  },
  stateCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  stateText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 13,
    marginTop: Spacing.sm,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
