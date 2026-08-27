/**
 * History List — Spec §6.2, UI Upgrade
 *
 * Ultra-Premium Clinical Assessment History:
 * - Top Triage Archive pill badge with Inter font
 * - Quick stats summary row (Total, High Risk, Pending)
 * - Unified Search Capsule with instant clear
 * - Filter pills with live record counts & explicit Inter font weights
 * - Redesigned Clinical Diagnostic Dossier Cards with patient avatar, Ref ID, symptoms snippet, risk badge, and review status
 * - Pull-to-refresh support
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius, type RiskLevel } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import RiskBadge from '@/components/ui/RiskBadge';
import { getMyAssessments, type AssessmentOut } from '@/services/assessmentsApi';
import { getPatientById, type PatientOut } from '@/services/patientsApi';

export default function HistoryListScreen() {
  const { colors, isDark } = useTheme();
  const [assessments, setAssessments] = useState<AssessmentOut[]>([]);
  const [patients, setPatients] = useState<Record<string, PatientOut>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'All'>('All');

  const fetchHistory = useCallback(async (refreshing = false) => {
    if (!refreshing) setIsLoading(true);
    setError('');

    try {
      const data = await getMyAssessments();
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAssessments(sorted);

      const patientIds = Array.from(new Set(sorted.map((a) => a.patient_id)));
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
        err?.response?.data?.detail || 'Failed to load assessment history. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHistory(true);
  };

  // Stats
  const stats = useMemo(() => {
    const total = assessments.length;
    const high = assessments.filter((a) => a.result?.overall_risk === 'High').length;
    const med = assessments.filter((a) => a.result?.overall_risk === 'Medium').length;
    const low = assessments.filter((a) => a.result?.overall_risk === 'Low').length;
    const pending = assessments.filter((a) => a.status === 'pending_review').length;
    return { total, high, med, low, pending };
  }, [assessments]);

  // Filtered List
  const filteredData = useMemo(() => {
    return assessments.filter((item) => {
      if (riskFilter !== 'All' && item.result?.overall_risk !== riskFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const p = patients[item.patient_id];
        if (p) {
          const matchName = p.full_name?.toLowerCase().includes(query);
          const matchRef = p.patient_ref?.toLowerCase().includes(query);
          const matchSymptom = item.input?.symptoms_text?.toLowerCase().includes(query);
          if (!matchName && !matchRef && !matchSymptom) return false;
        } else {
          return false;
        }
      }
      return true;
    });
  }, [assessments, patients, riskFilter, searchQuery]);

  function renderItem({ item }: { item: AssessmentOut }) {
    const patient = patients[item.patient_id];
    const dateStr = new Date(item.created_at).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const isHigh = item.result?.overall_risk === 'High';
    const isReviewed = item.status === 'reviewed';

    return (
      <GlassCard
        tint="elevated"
        elevation="raised"
        radius="lg"
        style={[
          styles.historyCard,
          isHigh && {
            borderColor: isDark ? 'rgba(209, 67, 67, 0.35)' : 'rgba(209, 67, 67, 0.25)',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.cardInner}
          activeOpacity={0.75}
          onPress={() => router.push(`/(staff)/history/${item._id}`)}
        >
          {/* Header Row: Avatar + Name / Ref + Date */}
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: isHigh
                    ? (isDark ? 'rgba(209, 67, 67, 0.18)' : 'rgba(209, 67, 67, 0.10)')
                    : (isDark ? 'rgba(79, 209, 224, 0.15)' : `${colors.primary}12`),
                  borderColor: isHigh ? colors.riskHigh : colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  { color: isHigh ? colors.riskHigh : colors.primary },
                ]}
              >
                {patient ? patient.full_name.charAt(0).toUpperCase() : 'P'}
              </Text>
            </View>

            <View style={styles.patientInfoCol}>
              <View style={styles.nameRow}>
                <Text style={[styles.patientName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {patient ? patient.full_name : 'Loading Patient...'}
                </Text>
                {patient?.patient_ref ? (
                  <View style={[styles.refBadge, { backgroundColor: colors.surfaceSunken }]}>
                    <Text style={[styles.refText, { color: colors.textSecondary }]}>
                      {patient.patient_ref}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {patient
                  ? `${patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : 'Other'} · Age ${patient.age}`
                  : 'Medical Triage'}
              </Text>
            </View>

            <View style={styles.dateCol}>
              <Text style={[styles.dateText, { color: colors.textTertiary }]}>
                {dateStr}
              </Text>
            </View>
          </View>

          {/* Symptoms Snippet Preview */}
          {item.input?.symptoms_text ? (
            <View
              style={[
                styles.symptomsBox,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : colors.surfaceSunken,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.border,
                },
              ]}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={12}
                color={colors.textTertiary}
                style={{ marginRight: 6, marginTop: 1 }}
              />
              <Text style={[styles.symptomsText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.input.symptoms_text}
              </Text>
            </View>
          ) : null}

          {/* Footer: Risk Badge + Review Status + Arrow */}
          <View style={styles.cardFooter}>
            <View style={styles.riskBadgeWrapper}>
              <RiskBadge level={(item.result?.overall_risk as RiskLevel) || 'Low'} size="small" />
              {item.result?.confidence_pct ? (
                <Text style={[styles.confidenceText, { color: colors.textTertiary }]}>
                  {item.result.confidence_pct}% Conf
                </Text>
              ) : null}
            </View>

            <View style={styles.footerRight}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isReviewed
                      ? (isDark ? 'rgba(46, 158, 91, 0.15)' : 'rgba(46, 158, 91, 0.10)')
                      : (isDark ? 'rgba(224, 161, 0, 0.15)' : 'rgba(224, 161, 0, 0.10)'),
                    borderColor: isReviewed
                      ? (isDark ? 'rgba(46, 158, 91, 0.30)' : 'rgba(46, 158, 91, 0.22)')
                      : (isDark ? 'rgba(224, 161, 0, 0.30)' : 'rgba(224, 161, 0, 0.22)'),
                  },
                ]}
              >
                <Ionicons
                  name={isReviewed ? 'checkmark-circle' : 'time'}
                  size={12}
                  color={isReviewed ? colors.riskLow : colors.riskMedium}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: isReviewed ? colors.riskLow : colors.riskMedium,
                    },
                  ]}
                >
                  {isReviewed ? 'Reviewed' : 'Pending Review'}
                </Text>
              </View>

              <View style={[styles.arrowCircle, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.10)' : 'rgba(15, 76, 92, 0.06)' }]}>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </GlassCard>
    );
  }

  // Loading State
  if (isLoading && !isRefreshing) {
    return (
      <Screen safeArea={true}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading clinical triage archive...
          </Text>
        </View>
      </Screen>
    );
  }

  // Error State
  if (error) {
    return (
      <Screen safeArea={true}>
        <View style={styles.centerContainer}>
          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.errorCard}>
            <View style={styles.errorInner}>
              <Ionicons name="alert-circle" size={32} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {error}
              </Text>
              <Button title="Retry" onPress={() => fetchHistory(false)} variant="outline" style={{ marginTop: Spacing.md }} />
            </View>
          </GlassCard>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea={true}>
      <View style={styles.container}>
        {/* ─── Header Section ─── */}
        <View style={styles.headerSection}>
          <View style={styles.topMetaRow}>
            <View style={[styles.archivePill, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.12)' : 'rgba(15, 76, 92, 0.08)', borderColor: isDark ? 'rgba(79, 209, 224, 0.25)' : 'rgba(15, 76, 92, 0.12)' }]}>
              <Ionicons name="time-outline" size={12} color={colors.primary} style={{ marginRight: 5 }} />
              <Text style={[styles.archivePillText, { color: colors.primary }]}>
                TRIAGE ARCHIVE
              </Text>
            </View>
          </View>

          <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
            Assessment History
          </Text>
          <Text style={[styles.mainSubtitle, { color: colors.textSecondary }]}>
            Review past multimodal patient stratifications and clinical reports.
          </Text>

          {/* Quick Metrics Bar */}
          {assessments.length > 0 && (
            <View style={styles.statsRow}>
              <View style={[styles.statPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total:</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.total}</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.statDot, { backgroundColor: colors.riskHigh }]} />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>High Risk:</Text>
                <Text style={[styles.statValue, { color: colors.riskHigh }]}>{stats.high}</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.statDot, { backgroundColor: colors.riskMedium }]} />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending:</Text>
                <Text style={[styles.statValue, { color: colors.riskMedium }]}>{stats.pending}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Filters & Search */}
        {assessments.length > 0 && (
          <View style={styles.filterSection}>
            {/* Unified Search Capsule */}
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: colors.surface,
                  borderColor: searchQuery.trim() ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons
                name="search"
                size={18}
                color={searchQuery.trim() ? colors.primary : colors.textTertiary}
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search patient name, Ref ID, symptoms..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                style={[styles.searchInputField, { color: colors.textPrimary }]}
              />
              {searchQuery.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.clearSearchBtn}
                >
                  <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Risk Filter Chips */}
            <View style={styles.riskFilterChipsRow}>
              {(
                [
                  { key: 'All', label: `All (${stats.total})` },
                  { key: 'Low', label: `Low (${stats.low})` },
                  { key: 'Medium', label: `Med (${stats.med})` },
                  { key: 'High', label: `High (${stats.high})` },
                ] as const
              ).map((chip) => {
                const isSelected = riskFilter === chip.key;
                return (
                  <TouchableOpacity
                    key={chip.key}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setRiskFilter(chip.key as any)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textSecondary,
                          fontFamily: isSelected ? 'Inter_700Bold' : 'Inter_500Medium',
                        },
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Assessment Cards List */}
        <FlatList
          data={filteredData}
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
            <GlassCard tint="default" elevation="raised" radius="lg" style={styles.emptyCard}>
              <View style={styles.emptyInner}>
                <Ionicons name="document-text-outline" size={40} color={colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  {assessments.length === 0
                    ? 'No Assessments Recorded Yet'
                    : 'No Matching Clinical Records'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  {assessments.length === 0
                    ? 'Start a new patient triage assessment from the New tab.'
                    : 'Try clearing your search or adjusting the risk filters.'}
                </Text>
                {searchQuery.trim().length > 0 && (
                  <Button
                    title="Clear Search"
                    onPress={() => setSearchQuery('')}
                    variant="outline"
                    style={{ marginTop: Spacing.md }}
                  />
                )}
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
    paddingTop: Spacing.xs,
  },
  headerSection: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.xxs,
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  archivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  archivePillText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.6,
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },

  /* ── Stats Row ── */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    gap: 4,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  statValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
  },

  /* ── Search & Filter ── */
  filterSection: {
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    marginBottom: Spacing.xs,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInputField: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13.5,
    paddingVertical: Spacing.xs,
  },
  clearSearchBtn: {
    padding: Spacing.xxs,
  },
  riskFilterChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 11.5,
  },

  /* ── Cards List ── */
  listContent: {
    paddingBottom: 110, // Floating TabBar clearance
  },
  historyCard: {
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  cardInner: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 2,
  },
  avatarText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 16,
  },
  patientInfoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  patientName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  refBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  refText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9.5,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 1,
  },
  dateCol: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },

  /* ── Symptoms Box ── */
  symptomsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  symptomsText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    flex: 1,
  },

  /* ── Card Footer ── */
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  riskBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  confidenceText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Center & States ── */
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginTop: Spacing.md,
  },
  emptyCard: {
    marginTop: Spacing.lg,
  },
  emptyInner: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  errorCard: {
    width: '100%',
  },
  errorInner: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13.5,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
