/**
 * Step 4: Review & Submit — Spec §6.2, UI Upgrade U4
 *
 * "Clinical Glass" restyle:
 * - Screen wrapper with gradient mesh + blob accents
 * - ProgressSteps indicator
 * - Summary sections in elevated GlassCards with jump-back edit links
 * - Safe area & bottom clearance
 * - Preserved logic: draftStore retrieval, submit navigation to analyzing
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { router, Link } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

function formatVitals(vitals: Record<string, number>): string {
  const labels: Record<string, string> = {
    HR: 'Heart Rate',
    O2Sat: 'SpO₂',
    Temp: 'Temperature',
    SBP: 'Systolic BP',
    DBP: 'Diastolic BP',
    Resp: 'Resp Rate',
    MAP: 'MAP',
    Age: 'Age',
  };

  return Object.entries(vitals)
    .map(([key, val]) => `${labels[key] || key}: ${val}`)
    .join('\n');
}

export default function ReviewSubmitScreen() {
  const { colors } = useTheme();
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
            Confirm all information before submitting for analysis.
          </Text>

          {/* Patient summary */}
          <SummarySection title="Patient Info" editRoute="/(staff)/new-assessment/patient-info">
            {patient ? (
              <>
                <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  {patient.full_name}
                </Text>
                <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  {patient.patient_ref} · {patient.sex} · Age {patient.age}
                  {patient.phone ? ` · ${patient.phone}` : ''}
                </Text>
              </>
            ) : (
              <Text style={[TypographyScale.body, styles.missingText, { color: colors.riskMedium }]}>
                No patient selected
              </Text>
            )}
          </SummarySection>

          {/* Symptoms summary */}
          <SummarySection title="Symptoms" editRoute="/(staff)/new-assessment/symptoms">
            {symptoms_text ? (
              <Text style={[TypographyScale.body, { color: colors.textPrimary, lineHeight: 21 }]} numberOfLines={5}>
                {symptoms_text}
              </Text>
            ) : (
              <Text style={[TypographyScale.body, styles.missingText, { color: colors.riskMedium }]}>
                No symptoms entered
              </Text>
            )}
          </SummarySection>

          {/* Image summary */}
          <SummarySection title="Clinical Image" editRoute="/(staff)/new-assessment/image-capture">
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={[styles.imageThumbnail, { backgroundColor: colors.surfaceSunken }]} resizeMode="cover" />
            ) : (
              <Text style={[TypographyScale.bodySm, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                No image (optional — will use partial-modality analysis)
              </Text>
            )}
          </SummarySection>

          {/* Vitals summary */}
          <SummarySection title="Vital Signs" editRoute="/(staff)/new-assessment/vitals">
            {Object.keys(vitals).length > 0 ? (
              <Text style={[TypographyScale.body, { color: colors.textPrimary, lineHeight: 22, fontVariant: ['tabular-nums'] }]}>
                {formatVitals(vitals)}
              </Text>
            ) : (
              <Text style={[TypographyScale.body, styles.missingText, { color: colors.riskMedium }]}>
                No vitals entered
              </Text>
            )}
          </SummarySection>

          {/* Submit */}
          <Button
            title="Submit for Analysis"
            onPress={handleSubmit}
            disabled={!patient || !symptoms_text}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function SummarySection({
  title,
  editRoute,
  children,
}: {
  title: string;
  editRoute: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.summaryCard}>
      <View style={styles.summaryInner}>
        <View style={styles.summaryHeader}>
          <Text style={[TypographyScale.h3, { color: colors.textPrimary }]}>{title}</Text>
          <Link href={editRoute as any} style={[styles.editLink, { color: colors.primaryLight }]}>
            Edit
          </Link>
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
    paddingBottom: 96,
  },
  content: {
    marginTop: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xxs,
  },
  description: {
    marginBottom: Spacing.lg,
  },
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
  editLink: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  missingText: {
    fontStyle: 'italic',
  },
  imageThumbnail: {
    width: '100%',
    height: 160,
    borderRadius: Radius.md,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
