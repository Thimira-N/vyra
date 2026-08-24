/**
 * Reviewer Case Detail — Spec §6.3
 *
 * Full assessment detail (same rich layout as Staff Result screen).
 * Plus a Clinical Notes text field and a "Mark as Reviewed" button.
 * Optional reviewer risk override control (visually distinct dropdown).
 * Calls `POST /reviewer/assessments/{id}/review` on submit.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Shadows, getRiskColor, type RiskLevel } from '@/constants/theme';
import RiskBadge from '@/components/ui/RiskBadge';
import RiskProbabilityBar from '@/components/charts/RiskProbabilityBar';
import Button from '@/components/ui/Button';
import ReportViewerButton from '@/components/ui/ReportViewerButton';
import { getAssessmentById, type AssessmentOut } from '@/services/assessmentsApi';
import { submitReview } from '@/services/reviewerApi';
import { Ionicons } from '@expo/vector-icons';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [assessment, setAssessment] = useState<AssessmentOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [gradcamLoading, setGradcamLoading] = useState(true);
  const [gradcamError, setGradcamError] = useState(false);


  // Review Form State
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [riskOverride, setRiskOverride] = useState<RiskLevel | null>(null);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    image: true,
    text: true,
    vitals: true,
  });

  useEffect(() => {
    if (id) fetchDetail();
  }, [id]);

  async function fetchDetail() {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAssessmentById(id);
      setAssessment(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || 'Failed to load case details. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleMarkAsReviewed() {
    if (!assessment) return;
    if (!clinicalNotes.trim()) {
      Alert.alert('Missing Field', 'Please provide clinical notes.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview(assessment._id, {
        clinical_notes: clinicalNotes.trim(),
        reviewer_risk_override: riskOverride || undefined,
      });
      // Pop back to dashboard and trigger refresh
      router.back();
    } catch (err: any) {
      Alert.alert(
        'Submission Error',
        err?.response?.data?.detail || 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading case...</Text>
      </View>
    );
  }

  // Error State
  if (error || !assessment) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error || 'Case not found.'}</Text>
        </View>
        <Button title="Retry" onPress={fetchDetail} variant="outline" style={styles.retryButton} />
        <Button title="Go Back" onPress={() => router.back()} variant="primary" />
      </View>
    );
  }

  const { result, status, review, created_at, assessment_ref } = assessment;
  const riskColor = getRiskColor(result.overall_risk as RiskLevel);
  const dateStr = new Date(created_at).toLocaleString();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Meta header */}
      <View style={styles.metaHeader}>
        <Text style={styles.refText}>{assessment_ref}</Text>
        <Text style={styles.dateText}>{dateStr}</Text>
      </View>

      {/* Reviewer Notes (If already reviewed) */}
      {status === 'reviewed' && review && (
        <View style={[styles.reviewCard, Shadows.card]}>
          <View style={styles.reviewHeader}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.riskLow} />
            <Text style={styles.reviewTitle}>Already Reviewed</Text>
          </View>
          <Text style={styles.reviewText}>{review.clinical_notes || 'No clinical notes provided.'}</Text>
          {review.reviewer_risk_override && (
            <View style={styles.overrideRow}>
              <Text style={styles.overrideLabel}>Risk Override:</Text>
              <RiskBadge level={review.reviewer_risk_override as RiskLevel} size="small" />
            </View>
          )}
          <Text style={styles.reviewDate}>
            Reviewed on {new Date(review.reviewed_at).toLocaleString()}
          </Text>
        </View>
      )}

      {/* Risk header */}
      <View style={styles.riskHeader}>
        <RiskBadge level={result.overall_risk as RiskLevel} size="large" />
        <Text style={[styles.triageTier, { color: riskColor }]}>
          {result.triage_tier} — Triage Tier
        </Text>
        <Text style={styles.confidence}>
          Confidence: {result.confidence_pct.toFixed(1)}% · {result.fusion_method}
        </Text>
      </View>

      {/* Risk probability bar */}
      <View style={[styles.card, Shadows.card]}>
        <Text style={styles.cardTitle}>Risk Probability Distribution</Text>
        <RiskProbabilityBar probabilities={result.risk_probabilities} />
      </View>

      {/* Per-modality findings */}
      {result.per_modality.image && (
        <CollapsibleSection
          title="Image Finding"
          expanded={expandedSections.image}
          onToggle={() => toggleSection('image')}
        >
          <View style={styles.modalityRow}>
            <RiskBadge level={result.per_modality.image.risk as RiskLevel} size="small" />
            <Text style={styles.modalityDetail}>
              Confidence: {result.per_modality.image.confidence_pct.toFixed(1)}%
            </Text>
          </View>
          <Text style={styles.modalityText}>{result.per_modality.image.finding}</Text>
        </CollapsibleSection>
      )}

      {result.per_modality.text && (
        <CollapsibleSection
          title="Symptom Match"
          expanded={expandedSections.text}
          onToggle={() => toggleSection('text')}
        >
          <View style={styles.modalityRow}>
            <RiskBadge level={result.per_modality.text.risk as RiskLevel} size="small" />
            <Text style={styles.modalityDetail}>
              Confidence: {result.per_modality.text.confidence_pct.toFixed(1)}%
            </Text>
          </View>
          <Text style={styles.modalityText}>
            Matched condition: {result.per_modality.text.match}
          </Text>
        </CollapsibleSection>
      )}

      {result.per_modality.vitals && (
        <CollapsibleSection
          title="Vitals Flags"
          expanded={expandedSections.vitals}
          onToggle={() => toggleSection('vitals')}
        >
          <View style={styles.modalityRow}>
            <RiskBadge level={result.per_modality.vitals.risk as RiskLevel} size="small" />
            <Text style={styles.modalityDetail}>
              Flags: {result.per_modality.vitals.flags}
            </Text>
          </View>
          {result.per_modality.vitals.flagged_vitals?.length > 0 && (
            <View style={styles.flagList}>
              {result.per_modality.vitals.flagged_vitals.map((fv, i) => (
                <View key={i} style={styles.flagRow}>
                  <Text style={styles.flagLabel}>{fv.label || fv.vital}:</Text>
                  <Text style={styles.flagValue}>
                    {fv.value} ({fv.severity})
                  </Text>
                </View>
              ))}
            </View>
          )}
        </CollapsibleSection>
      )}

      {/* Differential Summary */}
      <View style={[styles.differentialCard, Shadows.card]}>
        <Text style={styles.differentialTitle}>Differential Summary</Text>
        {result.differential_summary.image_finding && (
          <View style={styles.diffRow}>
            <Text style={styles.diffLabel}>Image:</Text>
            <Text style={styles.diffValue}>{result.differential_summary.image_finding}</Text>
          </View>
        )}
        {result.differential_summary.symptom_match && (
          <View style={styles.diffRow}>
            <Text style={styles.diffLabel}>Symptoms:</Text>
            <Text style={styles.diffValue}>{result.differential_summary.symptom_match}</Text>
          </View>
        )}
        {result.differential_summary.vitals_pattern && (
          <View style={styles.diffRow}>
            <Text style={styles.diffLabel}>Vitals:</Text>
            <Text style={styles.diffValue}>{result.differential_summary.vitals_pattern}</Text>
          </View>
        )}
        {result.differential_summary.consistency_note && (
          <View style={styles.consistencyCard}>
            <Text style={styles.consistencyLabel}>Consistency Note</Text>
            <Text style={styles.consistencyText}>
              {result.differential_summary.consistency_note}
            </Text>
          </View>
        )}
      </View>

      {/* Grad-CAM overlay if available */}
      {result.gradcam_overlay_url && (
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardTitle}>Grad-CAM Visualization</Text>
          {gradcamLoading && !gradcamError && (
             <View style={[styles.gradcamImage, { justifyContent: 'center', alignItems: 'center' }]}>
               <ActivityIndicator color={Colors.primary} />
             </View>
          )}
          {gradcamError ? (
             <View style={[styles.gradcamImage, { justifyContent: 'center', alignItems: 'center' }]}>
               <Text style={{ fontFamily: Typography.regular, fontSize: 14, color: Colors.textSecondary, textAlign: 'center' }}>Failed to load Grad-CAM overlay</Text>
             </View>
          ) : (
            <Image
              source={{ uri: result.gradcam_overlay_url }}
              style={[styles.gradcamImage, gradcamLoading && { display: 'none' }]}
              resizeMode="contain"
              onLoadStart={() => setGradcamLoading(true)}
              onLoadEnd={() => setGradcamLoading(false)}
              onError={() => setGradcamError(true)}
            />
          )}
        </View>
      )}

      {/* Review Form (Only if pending_review) */}
      {status === 'pending_review' && (
        <View style={[styles.card, Shadows.card, styles.reviewFormCard]}>
          <Text style={styles.reviewFormTitle}>Reviewer Action</Text>
          
          <Text style={styles.inputLabel}>Clinical Notes <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Enter clinical rationale..."
            multiline
            numberOfLines={4}
            value={clinicalNotes}
            onChangeText={setClinicalNotes}
            textAlignVertical="top"
          />

          <View style={styles.overrideSection}>
            <Text style={styles.inputLabel}>Risk Override (Optional)</Text>
            <Text style={styles.overrideHint}>
              Select only if clinical judgment disagrees with AI.
            </Text>
            <View style={styles.overrideChips}>
              <TouchableOpacity
                style={[
                  styles.overrideChip,
                  riskOverride === null && styles.overrideChipActive,
                ]}
                onPress={() => setRiskOverride(null)}
              >
                <Text style={[styles.overrideChipText, riskOverride === null && styles.overrideChipTextActive]}>
                  No Override
                </Text>
              </TouchableOpacity>
              
              {(['Low', 'Medium', 'High'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.overrideChip,
                    riskOverride === r && styles.overrideChipActive,
                  ]}
                  onPress={() => setRiskOverride(r)}
                >
                  <Text style={[styles.overrideChipText, riskOverride === r && styles.overrideChipTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <Button
            title="Mark as Reviewed"
            onPress={handleMarkAsReviewed}
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting || !clinicalNotes.trim()}
          />
        </View>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>⚕ Clinical Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          This tool is not a substitute for professional medical judgment. Risk levels
          are probability estimates generated by machine learning models and should be
          used as one input among many in clinical decision-making. Always follow
          established clinical protocols and exercise professional judgment.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {status === 'reviewed' && (
          <ReportViewerButton assessmentId={assessment._id} reportTitle={assessment.assessment_ref} style={{ marginBottom: Spacing.sm }} />
        )}
        <Button
          title="Back to Dashboard"
          onPress={() => router.back()}
          variant={status === 'reviewed' ? 'primary' : 'outline'}
        />
      </View>
    </ScrollView>
  );
}

/** Collapsible section component for per-modality findings */
function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={[collStyles.card, Shadows.card]}>
      <TouchableOpacity
        style={collStyles.header}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={collStyles.title}>{title}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>
      {expanded && <View style={collStyles.content}>{children}</View>}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

  centerContainer: {
    flex: 1, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center', padding: Spacing.lg,
  },
  loadingText: {
    fontFamily: Typography.medium, fontSize: 15,
    color: Colors.textSecondary, marginTop: Spacing.md,
  },
  errorBanner: {
    backgroundColor: Colors.riskHigh + '15', padding: Spacing.md,
    borderRadius: 12, marginBottom: Spacing.md, width: '100%',
  },
  errorText: {
    fontFamily: Typography.medium, fontSize: 14,
    color: Colors.riskHigh, textAlign: 'center',
  },
  retryButton: { marginBottom: Spacing.sm, width: '100%' },

  // Meta header
  metaHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: Spacing.md, paddingHorizontal: Spacing.xs,
  },
  refText: {
    fontFamily: Typography.medium, fontSize: 13, color: Colors.textSecondary,
  },
  dateText: {
    fontFamily: Typography.regular, fontSize: 13, color: Colors.textSecondary,
  },

  // Review Notes (if already reviewed)
  reviewCard: {
    backgroundColor: Colors.riskLow + '08', borderRadius: 12,
    borderWidth: 1, borderColor: Colors.riskLow + '30',
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  reviewHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  reviewTitle: {
    fontFamily: Typography.semiBold, fontSize: 15, color: Colors.riskLow,
  },
  reviewText: {
    fontFamily: Typography.regular, fontSize: 14,
    color: Colors.textPrimary, lineHeight: 21, marginBottom: Spacing.xs,
  },
  overrideRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  overrideLabel: {
    fontFamily: Typography.medium, fontSize: 13, color: Colors.textPrimary,
  },
  reviewDate: {
    fontFamily: Typography.regular, fontSize: 12,
    color: Colors.textSecondary, marginTop: Spacing.xs,
  },

  // Review Form Card
  reviewFormCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  reviewFormTitle: {
    fontFamily: Typography.bold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontFamily: Typography.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  required: { color: Colors.riskHigh },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 100,
    backgroundColor: Colors.background,
    marginBottom: Spacing.md,
  },
  overrideSection: {
    marginBottom: Spacing.lg,
  },
  overrideHint: {
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  overrideChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  overrideChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    minHeight: 44,
    justifyContent: 'center',
  },
  overrideChipActive: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  overrideChipText: {
    fontFamily: Typography.medium,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  overrideChipTextActive: {
    color: Colors.surface,
  },

  // Risk header
  riskHeader: {
    alignItems: 'center', paddingVertical: Spacing.sm, marginBottom: Spacing.md,
  },
  triageTier: {
    fontFamily: Typography.semiBold, fontSize: 14,
    marginTop: Spacing.sm, letterSpacing: 1,
  },
  confidence: {
    fontFamily: Typography.regular, fontSize: 13,
    color: Colors.textSecondary, marginTop: Spacing.xxs,
  },

  // Cards
  card: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontFamily: Typography.semiBold, fontSize: 15,
    color: Colors.textPrimary, marginBottom: Spacing.xs,
  },

  // Modality sections
  modalityRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, marginBottom: Spacing.xs,
  },
  modalityDetail: {
    fontFamily: Typography.regular, fontSize: 13,
    color: Colors.textSecondary, fontVariant: ['tabular-nums'],
  },
  modalityText: {
    fontFamily: Typography.regular, fontSize: 14,
    color: Colors.textPrimary, lineHeight: 21,
  },
  flagList: { marginTop: Spacing.xs },
  flagRow: {
    flexDirection: 'row', gap: Spacing.xs,
    paddingVertical: 2,
  },
  flagLabel: {
    fontFamily: Typography.medium, fontSize: 13, color: Colors.textPrimary,
  },
  flagValue: {
    fontFamily: Typography.regular, fontSize: 13,
    color: Colors.textSecondary, flex: 1,
  },

  // Differential summary
  differentialCard: {
    backgroundColor: Colors.primary + '08', borderRadius: 12,
    borderWidth: 1, borderColor: Colors.primary + '20',
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  differentialTitle: {
    fontFamily: Typography.semiBold, fontSize: 15,
    color: Colors.primary, marginBottom: Spacing.sm,
  },
  diffRow: {
    flexDirection: 'row', marginBottom: Spacing.xs, gap: Spacing.xs,
  },
  diffLabel: {
    fontFamily: Typography.semiBold, fontSize: 13,
    color: Colors.textPrimary, width: 70,
  },
  diffValue: {
    fontFamily: Typography.regular, fontSize: 13,
    color: Colors.textPrimary, flex: 1, lineHeight: 19,
  },
  consistencyCard: {
    backgroundColor: Colors.primary + '0C', borderRadius: 8,
    padding: Spacing.sm, marginTop: Spacing.xs,
  },
  consistencyLabel: {
    fontFamily: Typography.semiBold, fontSize: 12,
    color: Colors.primary, marginBottom: Spacing.xxs,
    letterSpacing: 0.5,
  },
  consistencyText: {
    fontFamily: Typography.medium, fontSize: 14,
    color: Colors.textPrimary, lineHeight: 21,
  },

  // Grad-CAM
  gradcamImage: {
    width: '100%', height: 220, borderRadius: 8,
    backgroundColor: Colors.border,
  },

  // Disclaimer
  disclaimer: {
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.riskMedium + '40',
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  disclaimerTitle: {
    fontFamily: Typography.semiBold, fontSize: 13,
    color: Colors.riskMedium, marginBottom: Spacing.xxs,
  },
  disclaimerText: {
    fontFamily: Typography.regular, fontSize: 12,
    color: Colors.textSecondary, lineHeight: 18,
  },

  // Actions
  actions: {},
});

const collStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.sm, overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: Spacing.md,
  },
  title: {
    fontFamily: Typography.semiBold, fontSize: 15, color: Colors.textPrimary,
  },
  content: {
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
  },
});
