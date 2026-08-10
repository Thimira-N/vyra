/**
 * Reviewer Dashboard — Spec §6.3
 *
 * List of all submitted assessments across all staff.
 * Filter chips: All / Pending Review / Reviewed, and risk level.
 * Each row: patient ref, submitting staff ID, date, risk badge, status.
 * Sorted pending-first, most-recent-first by default via backend.
 * Calls `GET /reviewer/dashboard` and passes params.
 */

import React, { useEffect, useState } from 'react';
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
import Button from '@/components/ui/Button';
import RiskBadge from '@/components/ui/RiskBadge';
import { getReviewerDashboard, type DashboardParams } from '@/services/reviewerApi';
import { getPatientById, type PatientOut } from '@/services/patientsApi';
import type { AssessmentOut } from '@/services/assessmentsApi';

export default function ReviewerDashboardScreen() {
  const [assessments, setAssessments] = useState<AssessmentOut[]>([]);
  const [patients, setPatients] = useState<Record<string, PatientOut>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Active filters sent to backend
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all | pending_review | reviewed
  const [riskFilter, setRiskFilter] = useState<string>('All'); // All | Low | Medium | High

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

      // Extract unique patient IDs
      const patientIds = Array.from(new Set(data.map((a) => a.patient_id)));

      // Fetch patient details concurrently to resolve names/refs
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
      <TouchableOpacity
        style={[styles.row, Shadows.card]}
        activeOpacity={0.7}
        onPress={() => router.push(`/(reviewer)/case/${item._id}`)}
      >
        <View style={styles.rowHeader}>
          <Text style={styles.patientName}>
            {patient ? `${patient.full_name} (${patient.patient_ref})` : 'Loading patient...'}
          </Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        
        <View style={styles.staffRow}>
          <Text style={styles.staffLabel}>Staff ID:</Text>
          <Text style={styles.staffId} numberOfLines={1} ellipsizeMode="middle">
            {item.created_by}
          </Text>
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
  if (isLoading && assessments.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  // Error State
  if (error && assessments.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <Button title="Retry" onPress={fetchDashboard} variant="outline" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reviewer Dashboard</Text>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Status Filters */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.chipRow}>
            {(['all', 'pending_review', 'reviewed'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.filterChip,
                  statusFilter === s && styles.filterChipActive,
                ]}
                onPress={() => setStatusFilter(s)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    statusFilter === s && styles.filterChipTextActive,
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
          <Text style={styles.filterLabel}>Risk:</Text>
          <View style={styles.chipRow}>
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
      </View>

      {/* Main List */}
      {isLoading && assessments.length > 0 && (
        <View style={styles.refreshingBar}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.refreshingText}>Updating...</Text>
        </View>
      )}

      {error ? (
        <View style={[styles.errorBanner, { marginVertical: Spacing.sm }]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={assessments}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No assessments found matching the selected filters.
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
  filtersContainer: {
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterGroup: {
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  filterLabel: {
    fontFamily: Typography.semiBold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
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

  // Refreshing indicator
  refreshingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  refreshingText: {
    fontFamily: Typography.medium,
    fontSize: 12,
    color: Colors.primary,
  },

  // List
  listContent: {
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.xs,
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
    marginBottom: Spacing.xxs,
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
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: 4,
  },
  staffLabel: {
    fontFamily: Typography.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  staffId: {
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
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
    width: '100%',
  },
  errorText: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.riskHigh,
    textAlign: 'center',
  },
});
