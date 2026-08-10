/**
 * Result — Spec §6.2
 *
 * The most important screen in the app. Renders the REAL assessment result:
 *   - Large risk badge (overall_risk) with triage tier + confidence
 *   - RiskProbabilityBar (risk_probabilities)
 *   - Per-modality sections: Image Finding, Symptom Match, Vitals Flags
 *   - Differential Summary card with consistency_note
 *   - Grad-CAM overlay if available
 *   - Standing disclaimer (always visible, never collapsible)
 *   - "Generate PDF Report" and "Done" actions
 *
 * Field names match Spec §2.3 assessment document exactly.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Typography, Spacing, Shadows, getRiskColor, type RiskLevel } from '@/constants/theme';
import RiskBadge from '@/components/ui/RiskBadge';
import RiskProbabilityBar from '@/components/charts/RiskProbabilityBar';
import Button from '@/components/ui/Button';
import ReportViewerButton from '@/components/ui/ReportViewerButton';
import { type AssessmentOut } from '@/services/assessmentsApi';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';
import { Ionicons } from '@expo/vector-icons';

export default function ResultScreen() {
  const params = useLocalSearchParams<{ assessmentData?: string }>();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    image: true,
    text: true,
    vitals: true,
  });

  const reset = useAssessmentDraftStore((s) => s.reset);

  // Parse the assessment data from params
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
      <View style={styles.errorScreen}>
        <Text style={styles.errorTitle}>No Assessment Data</Text>
        <Text style={styles.errorSubtitle}>
          Unable to load assessment results. Please try submitting again.
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
        />
      </View>
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
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
          <Image
            source={{ uri: result.gradcam_overlay_url }}
            style={styles.gradcamImage}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Disclaimer — always visible, never collapsible (Spec §6.2) */}
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
        <ReportViewerButton assessmentId={assessment._id} style={{ marginBottom: Spacing.sm }} />
        <Button
          title="Done"
          onPress={handleDone}
          variant="primary"
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

  // Error state
  errorScreen: {
    flex: 1, backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center', padding: Spacing.lg,
  },
  errorTitle: {
    fontFamily: Typography.bold, fontSize: 20,
    color: Colors.textPrimary, marginBottom: Spacing.xs,
  },
  errorSubtitle: {
    fontFamily: Typography.regular, fontSize: 14,
    color: Colors.textSecondary, textAlign: 'center',
    marginBottom: Spacing.lg, lineHeight: 21,
  },

  // Risk header
  riskHeader: {
    alignItems: 'center', paddingVertical: Spacing.lg, marginBottom: Spacing.md,
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

  // Disclaimer — pinned, always visible, never collapsible
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
  actions: { gap: Spacing.sm },
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
