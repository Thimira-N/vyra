/**
 * Step 4: Review & Submit — Spec §6.2, UI Upgrade U4
 *
 * Premium Clinical Pre-Submission Review:
 * - ProgressSteps indicator at top
 * - Comprehensive summary cards for all modalities with one-tap edit links
 * - Visual vital sign tags and image preview
 * - High-contrast "Submit for AI Analysis" action button
 * - Preserved logic: draftStore retrieval, submit navigation to analyzing
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

const VITAL_LABELS: Record<string, { label: string; unit: string }> = {
  HR: { label: 'Heart Rate', unit: 'bpm' },
  O2Sat: { label: 'SpO₂', unit: '%' },
  Temp: { label: 'Temp', unit: '°C' },
  SBP: { label: 'Systolic BP', unit: 'mmHg' },
  DBP: { label: 'Diastolic BP', unit: 'mmHg' },
  Resp: { label: 'Resp Rate', unit: '/min' },
  MAP: { label: 'MAP', unit: 'mmHg' },
  Age: { label: 'Age', unit: 'yrs' },
  EtCO2: { label: 'EtCO₂', unit: 'mmHg' },
  FiO2: { label: 'FiO₂', unit: '%' },
  pH: { label: 'pH', unit: '' },
  Lactate: { label: 'Lactate', unit: 'mmol/L' },
};

export default function ReviewSubmitScreen() {
  const { colors, isDark } = useTheme();
  const patient = useAssessmentDraftStore((s) => s.patient);
  const symptoms_text = useAssessmentDraftStore((s) => s.symptoms_text);
  const imageUri = useAssessmentDraftStore((s) => s.imageUri);
  const vitals = useAssessmentDraftStore((s) => s.vitals);

  function handleSubmit() {
    router.push('/(staff)/new-assessment/analyzing');
  }

  return (
    <Screen safeArea={true}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ProgressSteps steps={STEPS} currentStep={4} />

        <View style={styles.content}>
          <Text style={[TypographyScale.h1, styles.title, { color: colors.textPrimary }]}>
            Review & Submit
          </Text>
          <Text style={[TypographyScale.body, styles.description, { color: colors.textSecondary }]}>
            Confirm all clinical details before running the multimodal stratification pipeline.
          </Text>

          {/* Patient Info Card */}
          <SummaryCard
            title="Patient Profile"
            icon="person"
            onEdit={() => router.push('/(staff)/new-assessment/patient-info')}
          >
            {patient ? (
              <View style={styles.patientProfileRow}>
                <View style={[styles.avatarCircle, { backgroundColor: `${colors.primary}15` }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {patient.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.patientInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.patientName, { color: colors.textPrimary }]}>
                      {patient.full_name}
                    </Text>
                    <View style={[styles.refBadge, { backgroundColor: colors.surfaceSunken }]}>
                      <Text style={[styles.refText, { color: colors.textSecondary }]}>
                        {patient.patient_ref}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : 'Other'} • Age {patient.age}
                    {patient.phone ? ` • ${patient.phone}` : ''}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[styles.missingText, { color: colors.riskMedium }]}>
                No patient selected
              </Text>
            )}
          </SummaryCard>

          {/* Symptoms Summary */}
          <SummaryCard
            title="Symptom Description"
            icon="document-text"
            onEdit={() => router.push('/(staff)/new-assessment/symptoms')}
          >
            {symptoms_text ? (
              <Text style={[styles.symptomsText, { color: colors.textPrimary }]} numberOfLines={5}>
                {symptoms_text}
              </Text>
            ) : (
              <Text style={[styles.missingText, { color: colors.riskMedium }]}>
                No symptoms recorded
              </Text>
            )}
          </SummaryCard>

          {/* Image Summary */}
          <SummaryCard
            title="Clinical Image"
            icon="image"
            onEdit={() => router.push('/(staff)/new-assessment/image-capture')}
          >
            {imageUri ? (
              <View style={styles.imageThumbnailWrapper}>
                <Image
                  source={{ uri: imageUri }}
                  style={[styles.imageThumbnail, { backgroundColor: colors.surfaceSunken }]}
                  resizeMode="cover"
                />
                <View style={styles.imageBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                  <Text style={styles.imageBadgeText}>Image Attached</Text>
                </View>
              </View>
            ) : (
              <View style={[styles.emptyImageBanner, { backgroundColor: colors.surfaceSunken }]}>
                <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
                <Text style={[styles.emptyImageText, { color: colors.textSecondary }]}>
                  No image provided • Partial modality analysis active
                </Text>
              </View>
            )}
          </SummaryCard>

          {/* Vitals Summary */}
          <SummaryCard
            title="Vital Signs"
            icon="pulse"
            onEdit={() => router.push('/(staff)/new-assessment/vitals')}
          >
            {Object.keys(vitals).length > 0 ? (
              <View style={styles.vitalsWrap}>
                {Object.entries(vitals).map(([key, val]) => {
                  const conf = VITAL_LABELS[key] || { label: key, unit: '' };
                  return (
                    <View
                      key={key}
                      style={[
                        styles.vitalChip,
                        {
                          backgroundColor: isDark ? colors.surfaceSunken : '#F1F5F9',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.vitalChipLabel, { color: colors.textSecondary }]}>
                        {conf.label}:
                      </Text>
                      <Text style={[styles.vitalChipVal, { color: colors.textPrimary }]}>
                        {val} {conf.unit}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.missingText, { color: colors.riskMedium }]}>
                No vitals recorded
              </Text>
            )}
          </SummaryCard>

          {/* Submit Action Button */}
          <Button
            title="Submit for AI Risk Analysis ⚡"
            onPress={handleSubmit}
            disabled={!patient || !symptoms_text}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function SummaryCard({
  title,
  icon,
  onEdit,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.summaryCard}>
      <View style={styles.summaryInner}>
        <View style={styles.summaryHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name={icon} size={16} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
          </View>
          <TouchableOpacity onPress={onEdit} activeOpacity={0.7} style={styles.editBtn}>
            <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
            <Ionicons name="pencil" size={12} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {children}
      </View>
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
  content: {
    marginTop: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.xxs,
  },
  description: {
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  /* ── Summary Card ── */
  summaryCard: {
    marginBottom: Spacing.sm,
  },
  summaryInner: {
    padding: Spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontFamily: TypographyScale.h3.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  editLink: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },

  /* ── Patient Profile ── */
  patientProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '800',
  },
  patientInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
  },
  refBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  refText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 12,
    marginTop: 2,
  },

  /* ── Symptoms ── */
  symptomsText: {
    fontSize: 14,
    lineHeight: 20,
  },

  /* ── Image ── */
  imageThumbnailWrapper: {
    position: 'relative',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  imageThumbnail: {
    width: '100%',
    height: 150,
    borderRadius: Radius.md,
  },
  imageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 76, 92, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    gap: 4,
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyImageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    gap: 6,
  },
  emptyImageText: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  /* ── Vitals ── */
  vitalsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  vitalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 4,
  },
  vitalChipLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  vitalChipVal: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  missingText: {
    fontStyle: 'italic',
    fontSize: 13,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
});
