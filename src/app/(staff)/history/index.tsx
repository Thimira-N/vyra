/**
 * History List — Spec §6.2
 *
 * List of the staff user's own past assessments.
 * Each row: patient name, date, risk badge, review status.
 * Search/filter by patient name or risk level.
 * Calls `GET /assessments/mine` and fetches patients to resolve names.
 * Has explicit Loading, Error, and Empty states.
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
import { Colors, Typography, Spacing, Shadows, type RiskLevel } from '@/constants/theme';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import RiskBadge from '@/components/ui/RiskBadge';
import { getMyAssessments, type AssessmentOut } from '@/services/assessmentsApi';
import { getPatientById, type PatientOut } from '@/services/patientsApi';

export default function HistoryListScreen() {
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

      // Extract unique patient IDs
      const patientIds = Array.from(new Set(data.map((a) => a.patient_id)));

      // Fetch patient details concurrently to resolve names
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

  // Filtered list
  const filteredData = useMemo(() => {
    return assessments.filter((item) => {
      // Risk filter
      if (riskFilter !== 'All' && item.result.overall_risk !== riskFilter) {
        return false;
      }
      // Search filter (patient name or ref)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const p = patients[item.patient_id];
        if (p) {
          const matchName = p.full_name.toLowerCase().includes(query);
          const matchRef = p.patient_ref.toLowerCase().includes(query);
          if (!matchName && !matchRef) return false;
        } else {
          // If patient not loaded, filter out if there's a search query
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
      <TouchableOpacity
        style={[styles.row, Shadows.card]}
        activeOpacity={0.7}
        onPress={() => router.push(`/(staff)/history/${item._id}`)}
      >
        <View style={styles.rowHeader}>
          <Text style={styles.patientName}>
            {patient ? patient.full_name : 'Loading patient...'}
          </Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        <View style={styles.rowFooter}>
          <RiskBadge level={item.result.overall_risk as RiskLevel} size="small" />
          
          <View
            style={[
              styles.statusBadge,
              item.status === 'reviewed' ? styles.statusReviewed : styles.statusPending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === 'reviewed'
                  ? styles.statusTextReviewed
                  : styles.statusTextPending,
              ]}
            >
              {item.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <Button title="Retry" onPress={fetchHistory} variant="outline" />
      </View>
    );
  }

  // Main UI (Empty state is handled by FlatList ListEmptyComponent)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assessment History</Text>
      
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
                  riskFilter === r && styles.filterChipActive,
                ]}
                onPress={() => setRiskFilter(r)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    riskFilter === r && styles.filterChipTextActive,
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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {assessments.length === 0
                ? "You haven't submitted any assessments yet."
                : "No assessments match your filters."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontFamily: Typography.bold,
    fontSize: 24,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  
  // Filters
  filters: {
    marginBottom: Spacing.sm,
  },
  searchInput: {
    marginBottom: Spacing.sm,
  },
  riskFilters: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minHeight: 44,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontFamily: Typography.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.surface,
  },

  // List
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  row: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  patientName: {
    fontFamily: Typography.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  date: {
    fontFamily: Typography.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: Colors.riskMedium + '15',
  },
  statusReviewed: {
    backgroundColor: Colors.riskLow + '15',
  },
  statusText: {
    fontFamily: Typography.medium,
    fontSize: 12,
  },
  statusTextPending: {
    color: Colors.riskMedium,
  },
  statusTextReviewed: {
    color: Colors.riskLow,
  },

  // Loading/Empty/Error
  loadingText: {
    fontFamily: Typography.medium,
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorBanner: {
    backgroundColor: Colors.riskHigh + '15',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
    width: '100%',
  },
  errorText: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.riskHigh,
    textAlign: 'center',
  },
});
