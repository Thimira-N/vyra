/**
 * History List — Spec §6.2, UI Upgrade U4
 *
 * "Clinical Glass" restyle:
 * - Screen wrapper with gradient mesh + blob accents
 * - Filter chips with pill radius and theme colors
 * - History rows in GlassCards with RiskBadge and review status pills
 * - Safe area & floating tab bar clearance
 * - Preserved logic: getMyAssessments & getPatientById concurrency, filters (search & risk)
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius, type RiskLevel } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import RiskBadge from '@/components/ui/RiskBadge';
import { getMyAssessments, type AssessmentOut } from '@/services/assessmentsApi';
import { getPatientById, type PatientOut } from '@/services/patientsApi';

export default function HistoryListScreen() {
  const { colors } = useTheme();
  const [assessments, setAssessments] = useState<AssessmentOut[]>([]);
  const [patients, setPatients] = useState<Record<string, PatientOut>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'All'>('All');

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setIsLoading(true);
    setError('');

    try {
      const data = await getMyAssessments();
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
        err?.response?.data?.detail || 'Failed to load assessment history. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  const filteredData = useMemo(() => {
    return assessments.filter((item) => {
      if (riskFilter !== 'All' && item.result.overall_risk !== riskFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const p = patients[item.patient_id];
        if (p) {
          const matchName = p.full_name.toLowerCase().includes(query);
          const matchRef = p.patient_ref.toLowerCase().includes(query);
          if (!matchName && !matchRef) return false;
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

    return (
      <GlassCard tint="default" elevation="raised" radius="md" style={styles.rowCard}>
        <TouchableOpacity
          style={styles.rowInner}
          activeOpacity={0.7}
          onPress={() => router.push(`/(staff)/history/${item._id}`)}
        >
          <View style={styles.rowHeader}>
            <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '600', flex: 1 }]}>
              {patient ? patient.full_name : 'Loading patient...'}
            </Text>
            <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginLeft: Spacing.sm }]}>
              {dateStr}
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

  // Loading State
  if (isLoading) {
    return (
      <Screen safeArea={true}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[TypographyScale.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
            Loading history...
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
              <Text style={[TypographyScale.body, { color: colors.danger, textAlign: 'center' }]}>
                {error}
              </Text>
              <Button title="Retry" onPress={fetchHistory} variant="outline" style={{ marginTop: Spacing.md }} />
            </View>
          </GlassCard>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeArea={true}>
      <View style={styles.container}>
        <Text style={[TypographyScale.h1, styles.title, { color: colors.textPrimary }]}>
          Assessment History
        </Text>

        {/* Filters */}
        {assessments.length > 0 && (
          <View style={styles.filters}>
            <TextField
              placeholder="Search patient name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerStyle={styles.searchInput}
            />
            <View style={styles.riskFilters}>
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
                  activeOpacity={0.7}
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
        )}

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <GlassCard tint="default" elevation="raised" radius="md" style={styles.emptyCard}>
              <View style={styles.emptyInner}>
                <Text style={[TypographyScale.body, { color: colors.textSecondary, textAlign: 'center', fontStyle: 'italic' }]}>
                  {assessments.length === 0
                    ? "You haven't submitted any assessments yet."
                    : "No assessments match your filters."}
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
    paddingTop: Spacing.md,
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
  filters: {
    marginBottom: Spacing.sm,
  },
  searchInput: {
    marginBottom: Spacing.xs,
  },
  riskFilters: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
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
    marginBottom: Spacing.sm,
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
});
