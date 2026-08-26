/**
 * Result — Spec §6.2, UI Upgrade U4
 *
 * The primary assessment result screen:
 * - Large risk badge (overall_risk) with triage tier + confidence
 * - RiskProbabilityBar with risk_probabilities
 * - Per-modality sections: Image Finding, Symptom Match, Vitals Flags
 * - Differential Summary card with consistency_note
 * - Grad-CAM overlay if available
 * - Standing disclaimer (always visible, never collapsible per Spec §6.2)
 * - "Generate PDF Report" and "Done" actions
 * - Safe area & bottom tab bar clearance
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
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
import { type AssessmentOut } from '@/services/assessmentsApi';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

export default function ResultScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ assessmentData?: string }>();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    image: true,
    text: true,
    vitals: true,
  });

  const reset = useAssessmentDraftStore((s) => s.reset);
  const [gradcamLoading, setGradcamLoading] = useState(true);
  const [gradcamError, setGradcamError] = useState(false);

  let assessment: AssessmentOut | null = null;
  try {
    if (params.assessmentData) {
      assessment = JSON.parse(params.assessmentData);
    }
  } catch {
    // Invalid data
  }

  if (!assessment) {
    return (
      <Screen safeArea={true}>
        <View style={styles.errorScreen}>
          <Text style={[TypographyScale.h2, styles.errorTitle, { color: colors.textPrimary }]}>
            No Assessment Data
          </Text>
          <Text style={[TypographyScale.body, styles.errorSubtitle, { color: colors.textSecondary }]}>
            Unable to load assessment results. Please try submitting again.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>
      </Screen>
    );
  }

  const { result } = assessment;
  const riskColor = getRiskColor(result.overall_risk as RiskLevel);

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleDone() {
    reset();
    router.replace('/(staff)/home');
  }

  return (
    <Screen safeArea={true}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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
                  onLoadEnd={() => setGradcamLoading(false)}
                  onError={() => setGradcamError(true)}
                />
              )}
            </View>
          </GlassCard>
        )}

        {/* Disclaimer — always visible, never collapsible (Spec §6.2) */}
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
          <ReportViewerButton assessmentId={assessment._id} reportTitle={assessment.assessment_ref} style={{ marginBottom: Spacing.sm }} />
          <Button
            title="Done"
            onPress={handleDone}
            variant="primary"
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
    paddingBottom: 96,
  },
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorTitle: {
    marginBottom: Spacing.xs,
  },
  errorSubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
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
