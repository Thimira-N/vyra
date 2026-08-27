/**
 * Reviewer Dashboard — Spec §6.3, UI Upgrade
 *
 * Ultra-Premium Clinical Reviewer Command Center:
 * - Brand logo + date pill + 44×44 notification glass button header
 * - Personalized greeting & hospital facility badge
 * - 4-KPI Command Center Summary (Pending, High Risk, Reviewed, Total)
 * - Unified Search Capsule & Multi-axis Filter Studio (Status & Risk)
 * - Elevated Case Review Dossier Cards with risk accent, avatar, submitter ID, symptoms preview, and review CTA
 * - Pull-to-refresh & illustrated empty states
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
  TextInput,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius, type RiskLevel } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import RiskBadge from '@/components/ui/RiskBadge';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { getReviewerDashboard, type DashboardParams } from '@/services/reviewerApi';
import { getPatientById, type PatientOut } from '@/services/patientsApi';
import type { AssessmentOut } from '@/services/assessmentsApi';

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

export default function ReviewerDashboardScreen() {
  const { colors, isDark } = useTheme();
  const user = useAuthStore((s) => s.user);

  const [assessments, setAssessments] = useState<AssessmentOut[]>([]);
  const [patients, setPatients] = useState<Record<string, PatientOut>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Active filters
  const [searchQuery, setSearchQuery] = useState('');
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
        err?.response?.data?.detail || 'Failed to load reviewer queue. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, riskFilter]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboard(true);
  };

  // KPI Calculations
  const pendingTotal = useMemo(
    () => assessments.filter((a) => a.status === 'pending_review').length,
    [assessments]
  );
  const highRiskTotal = useMemo(
    () => assessments.filter((a) => a.result?.overall_risk === 'High').length,
    [assessments]
  );
  const reviewedTotal = useMemo(
    () => assessments.filter((a) => a.status === 'reviewed').length,
    [assessments]
  );

  // Search Filtered Cases
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return assessments;
    const query = searchQuery.toLowerCase();
    return assessments.filter((item) => {
      const p = patients[item.patient_id];
      const matchName = p?.full_name?.toLowerCase().includes(query);
      const matchRef = p?.patient_ref?.toLowerCase().includes(query);
      const matchStaff = item.created_by?.toLowerCase().includes(query);
      const matchSymptom = item.input?.symptoms_text?.toLowerCase().includes(query);
      return matchName || matchRef || matchStaff || matchSymptom;
    });
  }, [assessments, patients, searchQuery]);

  function renderItem({ item }: { item: AssessmentOut }) {
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
    const isHigh = risk === 'High';

    const riskBorderColor =
      risk === 'High'
        ? colors.riskHigh
        : risk === 'Medium'
          ? colors.riskMedium
          : colors.riskLow;

    return (
      <GlassCard
        tint="elevated"
        elevation="raised"
        radius="lg"
        style={[
          styles.rowCard,
          isHigh && {
            borderColor: isDark ? 'rgba(209, 67, 67, 0.35)' : 'rgba(209, 67, 67, 0.22)',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.rowInner}
          activeOpacity={0.75}
          onPress={() => router.push(`/(reviewer)/case/${item._id}`)}
        >
          {/* Left Risk Accent Strip */}
          <View style={[styles.riskAccentStrip, { backgroundColor: riskBorderColor }]} />

          <View style={styles.cardContent}>
            {/* Header: Avatar + Patient Name/Ref + Date */}
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

              <View style={styles.patientTitleBlock}>
                <View style={styles.nameRow}>
                  <Text style={[styles.patientName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {patient ? patient.full_name : 'Loading Patient...'}
                  </Text>
                  {patient?.patient_ref ? (
                    <View style={[styles.refTag, { backgroundColor: colors.surfaceSunken }]}>
                      <Text style={[styles.refTagText, { color: colors.textSecondary }]}>
                        {patient.patient_ref}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {patient
                    ? `${patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : 'Other'} · Age ${patient.age}`
                    : 'Triage Patient'}
                </Text>
              </View>

              <View style={styles.dateCol}>
                <Text style={[styles.dateText, { color: colors.textTertiary }]}>{dateStr}</Text>
                <Text style={[styles.timeText, { color: colors.textTertiary }]}>{timeStr}</Text>
              </View>
            </View>

            {/* Submitter & Symptoms Preview */}
            <View style={styles.metaRow}>
              <View style={[styles.staffBadge, { backgroundColor: colors.surfaceSunken }]}>
                <Ionicons name="person-circle-outline" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>
                  Staff: {item.created_by}
                </Text>
              </View>

              {item.input?.symptoms_text ? (
                <Text style={[styles.symptomSnippet, { color: colors.textTertiary }]} numberOfLines={1}>
                  • {item.input.symptoms_text}
                </Text>
              ) : null}
            </View>

            {/* Footer row: RiskBadge + Status Pill + Action */}
            <View style={styles.rowFooter}>
              <View style={styles.badgeGroup}>
                <RiskBadge level={risk} size="small" />
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
                      styles.statusBadgeText,
                      { color: isReviewed ? colors.riskLow : colors.riskMedium },
                    ]}
                  >
                    {isReviewed ? 'Reviewed' : 'Pending Review'}
                  </Text>
                </View>

                <View style={[styles.chevronBubble, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.10)' : 'rgba(15, 76, 92, 0.06)' }]}>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </GlassCard>
    );
  }

  return (
    <Screen safeArea={true}>
      <View style={styles.container}>
        {/* ─── Unified Brand & Greeting Top Bar ─── */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.headerSection}>
          <View style={styles.topMetaRow}>
            <View style={styles.brandRow}>
              <Image
                source={require('../../../assets/images/icon.png')}
                style={styles.brandLogo}
                contentFit="contain"
              />
              <Text style={[styles.brandName, { color: colors.textPrimary }]}>Vyra</Text>

              <View
                style={[
                  styles.datePill,
                  {
                    backgroundColor: isDark ? 'rgba(79, 209, 224, 0.12)' : 'rgba(15, 76, 92, 0.08)',
                    borderColor: isDark ? 'rgba(79, 209, 224, 0.22)' : 'rgba(15, 76, 92, 0.12)',
                  },
                ]}
              >
                <View style={[styles.pulseDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.dateTextBadge, { color: colors.primary }]}>
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
                <View
                  style={[
                    styles.facilityPill,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : colors.surfaceSunken,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons name="business" size={13} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.facilityText, { color: colors.textPrimary }]}>
                    {user.facility_name}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </Animated.View>

        {/* ─── Reviewer KPI Summary Strip (4 Metrics) ─── */}
        <Animated.View entering={FadeInDown.duration(600).delay(80)} style={styles.kpiGrid}>
          {/* Pending */}
          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.kpiCard}>
            <View style={styles.kpiInner}>
              <View style={styles.kpiTopRow}>
                <Ionicons name="time" size={15} color={colors.riskMedium} />
                <Text style={[styles.kpiVal, { color: pendingTotal > 0 ? colors.riskMedium : colors.textPrimary }]}>
                  {pendingTotal}
                </Text>
              </View>
              <Text style={[styles.kpiTitle, { color: colors.textSecondary }]}>Pending</Text>
            </View>
          </GlassCard>

          {/* High Risk */}
          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.kpiCard}>
            <View style={styles.kpiInner}>
              <View style={styles.kpiTopRow}>
                <Ionicons name="alert-circle" size={15} color={colors.riskHigh} />
                <Text style={[styles.kpiVal, { color: highRiskTotal > 0 ? colors.riskHigh : colors.textPrimary }]}>
                  {highRiskTotal}
                </Text>
              </View>
              <Text style={[styles.kpiTitle, { color: colors.textSecondary }]}>High Risk</Text>
            </View>
          </GlassCard>

          {/* Reviewed */}
          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.kpiCard}>
            <View style={styles.kpiInner}>
              <View style={styles.kpiTopRow}>
                <Ionicons name="checkmark-circle" size={15} color={colors.riskLow} />
                <Text style={[styles.kpiVal, { color: colors.riskLow }]}>{reviewedTotal}</Text>
              </View>
              <Text style={[styles.kpiTitle, { color: colors.textSecondary }]}>Reviewed</Text>
            </View>
          </GlassCard>

          {/* Total Cases */}
          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.kpiCard}>
            <View style={styles.kpiInner}>
              <View style={styles.kpiTopRow}>
                <Ionicons name="documents" size={15} color={colors.primary} />
                <Text style={[styles.kpiVal, { color: colors.textPrimary }]}>{assessments.length}</Text>
              </View>
              <Text style={[styles.kpiTitle, { color: colors.textSecondary }]}>Total Cases</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ─── Search & Multi-Axis Filters ─── */}
        <Animated.View entering={FadeInDown.duration(600).delay(120)} style={styles.filterContainer}>
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
              size={17}
              color={searchQuery.trim() ? colors.primary : colors.textTertiary}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search patient, Ref ID, or submitter..."
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

          {/* Status & Risk Filter Pills in Single Compact Row */}
          <View style={styles.pillsRow}>
            {/* Status Pills */}
            {(['all', 'pending_review', 'reviewed'] as const).map((s) => {
              const isSelected = statusFilter === s;
              const label = s === 'all' ? 'All Queue' : s === 'pending_review' ? 'Pending' : 'Reviewed';
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setStatusFilter(s)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        fontFamily: isSelected ? 'Inter_700Bold' : 'Inter_500Medium',
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Risk Tier Quick Filter */}
            {(['All', 'High'] as const).map((r) => {
              const isSelected = riskFilter === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected
                        ? (r === 'High' ? colors.riskHigh : colors.primary)
                        : colors.surface,
                      borderColor: isSelected
                        ? (r === 'High' ? colors.riskHigh : colors.primary)
                        : colors.border,
                    },
                  ]}
                  onPress={() => setRiskFilter(r)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected ? '#FFFFFF' : (r === 'High' ? colors.riskHigh : colors.textSecondary),
                        fontFamily: isSelected ? 'Inter_700Bold' : 'Inter_500Medium',
                      },
                    ]}
                  >
                    {r === 'High' ? '● High Risk' : 'All Tiers'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Error Banner */}
        {error ? (
          <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}15`, borderColor: `${colors.danger}35` }]}>
            <Ionicons name="alert-circle" size={16} color={colors.danger} />
            <Text style={[TypographyScale.caption, { color: colors.danger, flex: 1, marginLeft: 6 }]}>{error}</Text>
          </View>
        ) : null}

        {/* ─── Review Cases List ─── */}
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
            isLoading ? (
              <GlassCard tint="default" elevation="raised" radius="lg" style={styles.stateCard}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.stateText, { color: colors.textSecondary }]}>
                  Loading clinical validation queue...
                </Text>
              </GlassCard>
            ) : (
              <GlassCard tint="default" elevation="raised" radius="lg" style={styles.stateCard}>
                <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.primary}12` }]}>
                  <Ionicons name="checkmark-done-circle-outline" size={40} color={colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                  Queue Clean & Clear
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  No clinical cases currently match your search or filter criteria.
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
    paddingTop: Spacing.xs,
  },

  /* ── Header Section ── */
  headerSection: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.xxs,
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 7,
  },
  brandName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  pulseDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
    marginRight: 5,
  },
  dateTextBadge: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    lineHeight: 17,
  },
  greetingName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  facilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  facilityText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
  },

  /* ── KPI Summary ── */
  kpiGrid: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: Spacing.sm,
  },
  kpiCard: {
    flex: 1,
    overflow: 'hidden',
  },
  kpiInner: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  kpiVal: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    letterSpacing: -0.2,
  },
  kpiTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 0.1,
  },

  /* ── Search & Filter ── */
  filterContainer: {
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 7 : 3,
    marginBottom: Spacing.xs,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInputField: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    paddingVertical: Spacing.xs,
  },
  clearSearchBtn: {
    padding: Spacing.xxs,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 11.5,
  },

  /* ── Error Banner ── */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },

  /* ── Cases List ── */
  listContent: {
    paddingBottom: 115, // Floating TabBar clearance
  },
  rowCard: {
    marginBottom: Spacing.sm,
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
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 15,
  },
  patientTitleBlock: {
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
  refTag: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  refTagText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9.5,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    marginTop: 1,
  },
  dateCol: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  timeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 1,
  },

  /* Submitter Row */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
    gap: 6,
    flexWrap: 'wrap',
  },
  staffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: Radius.pill,
  },
  metaLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10.5,
  },
  symptomSnippet: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    flex: 1,
  },

  /* Footer */
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 3,
  },
  badgeGroup: {
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
  statusBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  chevronBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Empty & Loading States */
  stateCard: {
    marginTop: Spacing.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  stateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    marginTop: Spacing.md,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
});
