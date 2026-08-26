/**
 * Reviewer Case Detail — Spec §6.3, UI Upgrade U5
 *
 * "Clinical Glass" restyle:
 * - Full assessment detail (same rich layout as Staff Result screen)
 * - Reviewer form in elevated GlassCard with Clinical Notes & Risk Override chips
 * - Screen wrapper with gradient mesh + blob accents
 * - Safe area & bottom clearance
 * - Preserved logic: submitReview API call, getAssessmentById, error handling & alerts
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius, getRiskColor, type RiskLevel } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import RiskBadge from '@/components/ui/RiskBadge';
import RiskProbabilityBar from '@/components/charts/RiskProbabilityBar';
import Button from '@/components/ui/Button';
import ReportViewerButton from '@/components/ui/ReportViewerButton';
import { getAssessmentById, type AssessmentOut } from '@/services/assessmentsApi';
import { submitReview } from '@/services/reviewerApi';

export default function CaseDetailScreen() {
  const { colors } = useTheme();
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
      // Pop back to dashboard
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
      <Screen safeArea={true}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[TypographyScale.body, { color: colors.textSecondary, marginTop: Spacing.md }]}>
            Loading case...
          </Text>
        </View>
      </Screen>
    );
  }

  // Error State
  if (error || !assessment) {
    return (
      <Screen safeArea={true}>
        <View style={styles.centerContainer}>
          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.errorCard}>
            <View style={styles.errorInner}>
              <Text style={[TypographyScale.body, { color: colors.danger, textAlign: 'center' }]}>
                {error || 'Case not found.'}
              </Text>
              <Button title="Retry" onPress={fetchDetail} variant="outline" style={{ marginTop: Spacing.md, marginBottom: Spacing.xs, width: '100%' }} />
              <Button title="Go Back" onPress={() => router.back()} variant="primary" style={{ width: '100%' }} />
            </View>
          </GlassCard>
        </View>
      </Screen>
    );
  }

  const { result, status, review, created_at, assessment_ref } = assessment;
  const riskColor = getRiskColor(result.overall_risk as RiskLevel);
  const dateStr = new Date(created_at).toLocaleString();

  return (
    <Screen safeArea={true}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Meta header */}
        <View style={styles.metaHeader}>
          <Text style={[TypographyScale.caption, { color: colors.textSecondary, fontWeight: '600' }]}>
            {assessment_ref}
          </Text>
          <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>
            {dateStr}
          </Text>
        </View>

        {/* Reviewer Notes (If already reviewed) */}
        {status === 'reviewed' && review && (
          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.reviewCard}>
            <View style={styles.reviewCardInner}>
              <View style={styles.reviewHeader}>
                <Ionicons name="checkmark-circle" size={20} color={colors.riskLow} />
                <Text style={[TypographyScale.body, { color: colors.riskLow, fontWeight: '600' }]}>
                  Already Reviewed
                </Text>
              </View>
              <Text style={[TypographyScale.body, { color: colors.textPrimary, lineHeight: 21, marginBottom: Spacing.xs }]}>
                {review.clinical_notes || 'No clinical notes provided.'}
              </Text>
              {review.reviewer_risk_override && (
                <View style={styles.overrideRow}>
                  <Text style={[TypographyScale.caption, { color: colors.textPrimary, fontWeight: '600' }]}>
                    Risk Override:
                  </Text>
                  <RiskBadge level={review.reviewer_risk_override as RiskLevel} size="small" />
                </View>
              )}
              <Text style={[TypographyScale.caption, { color: colors.textTertiary, marginTop: Spacing.xs }]}>
                Reviewed on {new Date(review.reviewed_at).toLocaleString()}
              </Text>
            </View>
          </GlassCard>
        )}

        {/* Risk header */}
        <View style={styles.riskHeader}>
          <RiskBadge level={result.overall_risk as RiskLevel} size="large" />
          <Text style={[TypographyScale.h2, styles.triageTier, { color: riskColor }]}>
            {result.triage_tier} — Triage Tier
          </Text>
          <Text style={[TypographyScale.bodySm, { color: colors.textSecondary, marginTop: Spacing.xxs }]}>
            Confidence: {result.confidence_pct.toFixed(1)}% · {result.fusion_method}
          </Text>
        </View>

        {/* Risk probability bar */}
        <GlassCard tint="default" elevation="raised" radius="md" style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={[TypographyScale.h3, styles.cardTitle, { color: colors.textPrimary }]}>
              Risk Probability Distribution
            </Text>
            <RiskProbabilityBar probabilities={result.risk_probabilities} />
          </View>
        </GlassCard>

        {/* Per-modality findings */}
        {result.per_modality.image && (
          <CollapsibleSection
            title="Image Finding"
            expanded={expandedSections.image}
            onToggle={() => toggleSection('image')}
          >
            <View style={styles.modalityRow}>
              <RiskBadge level={result.per_modality.image.risk as RiskLevel} size="small" />
              <Text style={[TypographyScale.caption, { color: colors.textSecondary, fontVariant: ['tabular-nums'] }]}>
                Confidence: {result.per_modality.image.confidence_pct.toFixed(1)}%
              </Text>
            </View>
            <Text style={[TypographyScale.body, { color: colors.textPrimary, lineHeight: 21 }]}>
              {result.per_modality.image.finding}
            </Text>
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
              <Text style={[TypographyScale.caption, { color: colors.textSecondary, fontVariant: ['tabular-nums'] }]}>
                Confidence: {result.per_modality.text.confidence_pct.toFixed(1)}%
              </Text>
            </View>
            <Text style={[TypographyScale.body, { color: colors.textPrimary, lineHeight: 21 }]}>
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
              <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>
                Flags: {result.per_modality.vitals.flags}
              </Text>
            </View>
            {result.per_modality.vitals.flagged_vitals?.length > 0 && (
              <View style={styles.flagList}>
                {result.per_modality.vitals.flagged_vitals.map((fv, i) => (
                  <View key={i} style={styles.flagRow}>
                    <Text style={[TypographyScale.bodySm, { color: colors.textPrimary, fontWeight: '600' }]}>
                      {fv.label || fv.vital}:
                    </Text>
                    <Text style={[TypographyScale.bodySm, { color: colors.textSecondary, flex: 1 }]}>
                      {fv.value} ({fv.severity})
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </CollapsibleSection>
        )}

        {/* Differential Summary */}
        <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={[TypographyScale.h3, styles.cardTitle, { color: colors.primary }]}>
              Differential Summary
            </Text>
            {result.differential_summary.image_finding && (
              <View style={styles.diffRow}>
                <Text style={[TypographyScale.bodySm, { color: colors.textPrimary, fontWeight: '600', width: 80 }]}>
                  Image:
                </Text>
                <Text style={[TypographyScale.bodySm, { color: colors.textSecondary, flex: 1 }]}>
                  {result.differential_summary.image_finding}
                </Text>
              </View>
            )}
            {result.differential_summary.symptom_match && (
              <View style={styles.diffRow}>
                <Text style={[TypographyScale.bodySm, { color: colors.textPrimary, fontWeight: '600', width: 80 }]}>
                  Symptoms:
                </Text>
                <Text style={[TypographyScale.bodySm, { color: colors.textSecondary, flex: 1 }]}>
                  {result.differential_summary.symptom_match}
                </Text>
              </View>
            )}
            {result.differential_summary.vitals_pattern && (
              <View style={styles.diffRow}>
                <Text style={[TypographyScale.bodySm, { color: colors.textPrimary, fontWeight: '600', width: 80 }]}>
                  Vitals:
                </Text>
                <Text style={[TypographyScale.bodySm, { color: colors.textSecondary, flex: 1 }]}>
                  {result.differential_summary.vitals_pattern}
                </Text>
              </View>
            )}
            {result.differential_summary.consistency_note && (
              <View style={[styles.consistencyBox, { backgroundColor: `${colors.primary}12`, borderRadius: Radius.sm }]}>
                <Text style={[TypographyScale.caption, { color: colors.primary, fontWeight: '700', marginBottom: 2 }]}>
                  Unified Clinical Impression
                </Text>
                <Text style={[TypographyScale.bodySm, { color: colors.textPrimary, lineHeight: 20 }]}>
                  {result.differential_summary.consistency_note}
                </Text>
              </View>
            )}
          </View>
        </GlassCard>

        {/* Grad-CAM overlay if available */}
        {result.gradcam_overlay_url && (
          <GlassCard tint="default" elevation="raised" radius="md" style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={[TypographyScale.h3, styles.cardTitle, { color: colors.textPrimary }]}>
                Grad-CAM Visualization
              </Text>
              {gradcamLoading && !gradcamError && (
                <View style={[styles.gradcamImage, styles.gradcamLoadingBox]}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              )}
              {gradcamError ? (
                <View style={[styles.gradcamImage, styles.gradcamLoadingBox]}>
                  <Text style={[TypographyScale.caption, { color: colors.danger }]}>
                    Failed to load Grad-CAM overlay
                  </Text>
                </View>
              ) : (
                <Image
                  source={{ uri: result.gradcam_overlay_url }}
                  style={[
                    styles.gradcamImage,
                    { backgroundColor: colors.surfaceSunken },
                    gradcamLoading && { position: 'absolute', opacity: 0 },
                  ]}
                  resizeMode="contain"
                  onLoadStart={() => setGradcamLoading(true)}
                  onLoadEnd={() => setGradcamLoading(false)}
                  onError={() => setGradcamError(true)}
                />
              )}
            </View>
          </GlassCard>
        )}

        {/* Review Form (Only if pending_review) */}
        {status === 'pending_review' && (
          <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.reviewFormCard}>
            <View style={styles.reviewFormInner}>
              <Text style={[TypographyScale.h2, styles.reviewFormTitle, { color: colors.textPrimary }]}>
                Reviewer Action
              </Text>

              <Text style={[TypographyScale.caption, styles.inputLabel, { color: colors.textPrimary }]}>
                Clinical Notes <Text style={{ color: colors.danger }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.surfaceSunken,
                    borderColor: colors.border,
                    borderRadius: Radius.md,
                    fontFamily: TypographyScale.body.fontFamily,
                  },
                ]}
                placeholder="Enter clinical rationale..."
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={4}
                value={clinicalNotes}
                onChangeText={setClinicalNotes}
                textAlignVertical="top"
              />

              <View style={styles.overrideSection}>
                <Text style={[TypographyScale.caption, styles.inputLabel, { color: colors.textPrimary }]}>
                  Risk Override (Optional)
                </Text>
                <Text style={[TypographyScale.caption, styles.overrideHint, { color: colors.textSecondary }]}>
                  Select only if clinical judgment disagrees with AI.
                </Text>
                <View style={styles.overrideChips}>
                  <TouchableOpacity
                    style={[
                      styles.overrideChip,
                      {
                        backgroundColor: riskOverride === null ? colors.primary : colors.surfaceSunken,
                        borderColor: riskOverride === null ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setRiskOverride(null)}
                  >
                    <Text
                      style={[
                        TypographyScale.caption,
                        {
                          color: riskOverride === null ? colors.textOnPrimary : colors.textSecondary,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      No Override
                    </Text>
                  </TouchableOpacity>

                  {(['Low', 'Medium', 'High'] as const).map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.overrideChip,
                        {
                          backgroundColor: riskOverride === r ? colors.primary : colors.surfaceSunken,
                          borderColor: riskOverride === r ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setRiskOverride(r)}
                    >
                      <Text
                        style={[
                          TypographyScale.caption,
                          {
                            color: riskOverride === r ? colors.textOnPrimary : colors.textSecondary,
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

              <Button
                title="Mark as Reviewed"
                onPress={handleMarkAsReviewed}
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting || !clinicalNotes.trim()}
              />
            </View>
          </GlassCard>
        )}

        {/* Disclaimer */}
        <GlassCard tint="default" radius="md" style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={[TypographyScale.bodySm, { color: colors.riskMedium, fontWeight: '700', marginBottom: Spacing.xxs }]}>
              ⚕ Clinical Disclaimer
            </Text>
            <Text style={[TypographyScale.caption, { color: colors.textSecondary, lineHeight: 18 }]}>
              This tool is not a substitute for professional medical judgment. Risk levels
              are probability estimates generated by machine learning models and should be
              used as one input among many in clinical decision-making. Always follow
              established clinical protocols and exercise professional judgment.
            </Text>
          </View>
        </GlassCard>

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
    </Screen>
  );
}

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
  const { colors } = useTheme();

  return (
    <GlassCard tint="default" elevation="raised" radius="md" style={styles.card}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={[TypographyScale.h3, { color: colors.textPrimary }]}>{title}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {expanded && <View style={styles.collapsibleContent}>{children}</View>}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 96, // Floating TabBar clearance
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorCard: {
    width: '100%',
  },
  errorInner: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  reviewCard: {
    marginBottom: Spacing.lg,
  },
  reviewCardInner: {
    padding: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  overrideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  riskHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  triageTier: {
    marginTop: Spacing.sm,
    letterSpacing: 0.5,
  },
  card: {
    marginBottom: Spacing.sm,
  },
  cardInner: {
    padding: Spacing.md,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  modalityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  flagList: {
    marginTop: Spacing.xs,
  },
  flagRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  diffRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  consistencyBox: {
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  gradcamImage: {
    width: '100%',
    height: 220,
    borderRadius: Radius.sm,
    marginTop: Spacing.xs,
  },
  gradcamLoadingBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewFormCard: {
    marginBottom: Spacing.lg,
  },
  reviewFormInner: {
    padding: Spacing.lg,
  },
  reviewFormTitle: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  notesInput: {
    borderWidth: 1.5,
    padding: Spacing.md,
    minHeight: 110,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  overrideSection: {
    marginBottom: Spacing.lg,
  },
  overrideHint: {
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
    borderRadius: Radius.pill,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  collapsibleContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  actions: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
});
