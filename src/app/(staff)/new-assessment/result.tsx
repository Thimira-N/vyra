/**
 * Result — Spec §6.2, UI Upgrade U4
 *
 * Premium Clinical Assessment Result & Stratification Report:
 * - High-impact triage header with animated risk tier glow & confidence meter
 * - RiskProbabilityBar distribution card
 * - Per-modality breakdown: Image Finding, Symptom NLP Match, Vitals Flags
 * - Unified Clinical Impression Differential Summary
 * - Grad-CAM visualization overlay
 * - Mandatory clinical disclaimer
 * - PDF report viewer & return actions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
  const { colors, isDark } = useTheme();
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
          <Ionicons name="alert-circle" size={48} color={colors.danger} />
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
  const risk = (result.overall_risk || 'Low') as RiskLevel;
  const riskColor = getRiskColor(risk);

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
        {/* ─── Hero Risk Banner ─── */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.heroRiskCard}>
          <GlassCard
            tint="elevated"
            elevation="raised"
            radius="lg"
            style={[
              styles.riskCardBorder,
              {
                borderColor: `${riskColor}50`,
                backgroundColor: isDark ? 'rgba(6, 24, 38, 0.85)' : 'rgba(255, 255, 255, 0.95)',
              },
            ]}
          >
            <View style={styles.riskCardInner}>
              <View style={styles.riskTopRow}>
                <View style={[styles.confidencePill, { backgroundColor: `${colors.primary}15` }]}>
                  <Ionicons name="shield-checkmark" size={13} color={colors.primary} />
                  <Text style={[styles.confidenceText, { color: colors.primary }]}>
                    {result.confidence_pct.toFixed(1)}% AI Confidence
                  </Text>
                </View>
                <Text style={[styles.fusionText, { color: colors.textSecondary }]}>
                  {result.fusion_method}
                </Text>
              </View>

              <View style={styles.riskBadgeCenter}>
                <RiskBadge level={risk} size="large" />
                <Text style={[styles.triageTierText, { color: riskColor }]}>
                  {result.triage_tier}
                </Text>
                <Text style={[styles.triageSubText, { color: colors.textSecondary }]}>
                  Recommended Clinical Triage Priority
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ─── Risk Probability Distribution ─── */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <GlassCard tint="default" elevation="raised" radius="lg" style={styles.card}>
            <View style={styles.cardInner}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="bar-chart-outline" size={16} color={colors.primary} />
                <Text style={[TypographyScale.h3, { color: colors.textPrimary }]}>
                  Risk Probability Distribution
                </Text>
              </View>
              <RiskProbabilityBar probabilities={result.risk_probabilities} />
            </View>
          </GlassCard>
        </Animated.View>

        {/* ─── Unified Clinical Impression (Differential Summary) ─── */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.card}>
            <View style={styles.cardInner}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="git-network-outline" size={16} color={colors.primary} />
                <Text style={[TypographyScale.h3, { color: colors.textPrimary }]}>
                  Unified Clinical Impression
                </Text>
              </View>

              {result.differential_summary.consistency_note && (
                <View style={[styles.consistencyBox, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}25` }]}>
                  <Text style={[styles.impressionHeading, { color: colors.primary }]}>
                    Synthesis Summary
                  </Text>
                  <Text style={[TypographyScale.bodySm, { color: colors.textPrimary, lineHeight: 21 }]}>
                    {result.differential_summary.consistency_note}
                  </Text>
                </View>
              )}

              {result.differential_summary.symptom_match && (
                <View style={styles.diffRow}>
                  <Text style={[styles.diffLabel, { color: colors.textSecondary }]}>Symptoms:</Text>
                  <Text style={[styles.diffVal, { color: colors.textPrimary }]}>
                    {result.differential_summary.symptom_match}
                  </Text>
                </View>
              )}

              {result.differential_summary.vitals_pattern && (
                <View style={styles.diffRow}>
                  <Text style={[styles.diffLabel, { color: colors.textSecondary }]}>Vitals:</Text>
                  <Text style={[styles.diffVal, { color: colors.textPrimary }]}>
                    {result.differential_summary.vitals_pattern}
                  </Text>
                </View>
              )}

              {result.differential_summary.image_finding && (
                <View style={styles.diffRow}>
                  <Text style={[styles.diffLabel, { color: colors.textSecondary }]}>Imaging:</Text>
                  <Text style={[styles.diffVal, { color: colors.textPrimary }]}>
                    {result.differential_summary.image_finding}
                  </Text>
                </View>
              )}
            </View>
          </GlassCard>
        </Animated.View>

        {/* ─── Per-Modality Breakdown Sections ─── */}
        {result.per_modality.image && (
          <CollapsibleSection
            title="Image Modality Finding"
            icon="image-outline"
            expanded={expandedSections.image}
            onToggle={() => toggleSection('image')}
          >
            <View style={styles.modalityRow}>
              <RiskBadge level={result.per_modality.image.risk as RiskLevel} size="small" />
              <Text style={[styles.modalityConfidence, { color: colors.textSecondary }]}>
                Confidence: {result.per_modality.image.confidence_pct.toFixed(1)}%
              </Text>
            </View>
            <Text style={[TypographyScale.body, { color: colors.textPrimary, lineHeight: 21, marginTop: 4 }]}>
              {result.per_modality.image.finding}
            </Text>
          </CollapsibleSection>
        )}

        {result.per_modality.text && (
          <CollapsibleSection
            title="Symptom NLP Match"
            icon="document-text-outline"
            expanded={expandedSections.text}
            onToggle={() => toggleSection('text')}
          >
            <View style={styles.modalityRow}>
              <RiskBadge level={result.per_modality.text.risk as RiskLevel} size="small" />
              <Text style={[styles.modalityConfidence, { color: colors.textSecondary }]}>
                Confidence: {result.per_modality.text.confidence_pct.toFixed(1)}%
              </Text>
            </View>
            <Text style={[TypographyScale.body, { color: colors.textPrimary, lineHeight: 21, marginTop: 4 }]}>
              Matched Condition: <Text style={{ fontWeight: '700' }}>{result.per_modality.text.match}</Text>
            </Text>
          </CollapsibleSection>
        )}

        {result.per_modality.vitals && (
          <CollapsibleSection
            title="Vitals Stratification"
            icon="pulse-outline"
            expanded={expandedSections.vitals}
            onToggle={() => toggleSection('vitals')}
          >
            <View style={styles.modalityRow}>
              <RiskBadge level={result.per_modality.vitals.risk as RiskLevel} size="small" />
              <Text style={[styles.modalityConfidence, { color: colors.textSecondary }]}>
                Flags: {result.per_modality.vitals.flags}
              </Text>
            </View>
            {result.per_modality.vitals.flagged_vitals?.length > 0 && (
              <View style={styles.flagList}>
                {result.per_modality.vitals.flagged_vitals.map((fv, i) => (
                  <View key={i} style={[styles.flagRow, { backgroundColor: colors.surfaceSunken, borderColor: colors.border }]}>
                    <Text style={[TypographyScale.bodySm, { color: colors.textPrimary, fontWeight: '700' }]}>
                      {fv.label || fv.vital}
                    </Text>
                    <View style={styles.flagValRow}>
                      <Text style={[TypographyScale.bodySm, { color: colors.textPrimary, fontWeight: '600' }]}>
                        {fv.value}
                      </Text>
                      <View style={[styles.severityPill, { backgroundColor: fv.severity === 'high' ? `${colors.riskHigh}20` : `${colors.riskMedium}20` }]}>
                        <Text style={[styles.severityText, { color: fv.severity === 'high' ? colors.riskHigh : colors.riskMedium }]}>
                          {fv.severity}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </CollapsibleSection>
        )}

        {/* ─── Grad-CAM Overlay Visualization ─── */}
        {result.gradcam_overlay_url && (
          <GlassCard tint="default" elevation="raised" radius="lg" style={styles.card}>
            <View style={styles.cardInner}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="scan-outline" size={16} color={colors.primary} />
                <Text style={[TypographyScale.h3, { color: colors.textPrimary }]}>
                  Grad-CAM Visual Explanability
                </Text>
              </View>
              {gradcamLoading && !gradcamError && (
                <View style={[styles.gradcamImage, styles.gradcamLoadingBox]}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                    Rendering heat-map activation...
                  </Text>
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

        {/* ─── Mandatory Clinical Disclaimer ─── */}
        <GlassCard tint="default" radius="lg" style={styles.disclaimerCard}>
          <View style={styles.cardInner}>
            <View style={styles.disclaimerHeader}>
              <Ionicons name="shield-outline" size={16} color={colors.riskMedium} />
              <Text style={[styles.disclaimerTitle, { color: colors.riskMedium }]}>
                Clinical Decision Support Notice
              </Text>
            </View>
            <Text style={[TypographyScale.caption, { color: colors.textSecondary, lineHeight: 18 }]}>
              This stratification report is generated by deep-learning models as an adjunct decision-support tool.
              It must be interpreted by qualified medical personnel in conjunction with full patient history.
            </Text>
          </View>
        </GlassCard>

        {/* ─── Actions ─── */}
        <View style={styles.actions}>
          <ReportViewerButton
            assessmentId={assessment._id}
            reportTitle={assessment.assessment_ref}
            style={{ marginBottom: Spacing.sm }}
          />
          <Button
            title="Complete & Return to Home"
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
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <GlassCard tint="default" elevation="raised" radius="lg" style={styles.card}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name={icon} size={16} color={colors.primary} />
          <Text style={[TypographyScale.h3, { color: colors.textPrimary }]}>{title}</Text>
        </View>
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
    paddingBottom: 110,
  },
  errorScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  errorTitle: {
    textAlign: 'center',
  },
  errorSubtitle: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  /* ── Hero Risk Card ── */
  heroRiskCard: {
    marginBottom: Spacing.md,
  },
  riskCardBorder: {
    borderWidth: 2,
  },
  riskCardInner: {
    padding: Spacing.lg,
  },
  riskTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    gap: 4,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fusionText: {
    fontSize: 11,
  },
  riskBadgeCenter: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  triageTierText: {
    fontFamily: TypographyScale.display.fontFamily,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  triageSubText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 12,
    marginTop: 2,
  },

  /* ── General Card ── */
  card: {
    marginBottom: Spacing.sm,
  },
  cardInner: {
    padding: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },

  /* ── Unified Impression ── */
  consistencyBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.sm,
  },
  impressionHeading: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  diffRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  diffLabel: {
    width: 80,
    fontSize: 12,
    fontWeight: '600',
  },
  diffVal: {
    flex: 1,
    fontSize: 12,
  },

  /* ── Modality ── */
  modalityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalityConfidence: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
  },
  flagList: {
    marginTop: Spacing.sm,
    gap: 6,
  },
  flagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  flagValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  severityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  /* ── Grad-CAM ── */
  gradcamImage: {
    width: '100%',
    height: 220,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  gradcamLoadingBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Disclaimer ── */
  disclaimerCard: {
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xxs,
  },
  disclaimerTitle: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },

  /* ── Collapsible ── */
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  collapsibleContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  actions: {
    marginTop: Spacing.xs,
  },
});
