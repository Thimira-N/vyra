/**
 * Step 4: Review & Submit — Spec §6.2
 *
 * Read-only summary of everything entered across steps 1–3 with
 * per-section "Edit" links (jumps back). Final "Submit for Analysis"
 * button. Navigates to analyzing screen which calls POST /assessments.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { router, Link } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

/** Format vital signs for display */
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
  const patient = useAssessmentDraftStore((s) => s.patient);
  const symptoms_text = useAssessmentDraftStore((s) => s.symptoms_text);
  const imageUri = useAssessmentDraftStore((s) => s.imageUri);
  const vitals = useAssessmentDraftStore((s) => s.vitals);

  function handleSubmit() {
    router.push('/(staff)/new-assessment/analyzing');
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <ProgressSteps steps={STEPS} currentStep={4} />

      <View style={styles.content}>
        <Text style={styles.title}>Review & Submit</Text>
        <Text style={styles.description}>
          Confirm all information before submitting for analysis.
        </Text>

        {/* Patient summary */}
        <SummarySection title="Patient Info" editRoute="/(staff)/new-assessment/patient-info">
          {patient ? (
            <>
              <Text style={styles.summaryText}>{patient.full_name}</Text>
              <Text style={styles.summaryMeta}>
                {patient.patient_ref} · {patient.sex} · Age {patient.age}
                {patient.phone ? ` · ${patient.phone}` : ''}
              </Text>
            </>
          ) : (
            <Text style={styles.missingText}>No patient selected</Text>
          )}
        </SummarySection>

        {/* Symptoms summary */}
        <SummarySection title="Symptoms" editRoute="/(staff)/new-assessment/symptoms">
          {symptoms_text ? (
            <Text style={styles.summaryText} numberOfLines={5}>
              {symptoms_text}
            </Text>
          ) : (
            <Text style={styles.missingText}>No symptoms entered</Text>
          )}
        </SummarySection>

        {/* Image summary */}
        <SummarySection title="Clinical Image" editRoute="/(staff)/new-assessment/image-capture">
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imageThumbnail} resizeMode="cover" />
          ) : (
            <Text style={styles.summaryMeta}>No image (optional — will use partial-modality analysis)</Text>
          )}
        </SummarySection>

        {/* Vitals summary */}
        <SummarySection title="Vital Signs" editRoute="/(staff)/new-assessment/vitals">
          {Object.keys(vitals).length > 0 ? (
            <Text style={styles.summaryText}>{formatVitals(vitals)}</Text>
          ) : (
            <Text style={styles.missingText}>No vitals entered</Text>
          )}
        </SummarySection>

        {/* Submit */}
        <Button
          title="Submit for Analysis"
          onPress={handleSubmit}
          disabled={!patient || !symptoms_text}
        />
      </View>
    </ScrollView>
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
  return (
    <View style={[summaryStyles.card, Shadows.card]}>
      <View style={summaryStyles.header}>
        <Text style={summaryStyles.title}>{title}</Text>
        <Link href={editRoute as any} style={summaryStyles.editLink}>
          Edit
        </Link>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  content: {
    marginTop: Spacing.md,
  },
  title: {
    fontFamily: Typography.bold,
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  description: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  summaryText: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  summaryMeta: {
    fontFamily: Typography.regular,
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  missingText: {
    fontFamily: Typography.regular,
    fontSize: 14,
    color: Colors.riskMedium,
    fontStyle: 'italic',
  },
  imageThumbnail: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: Colors.border,
  },
});

const summaryStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: Typography.semiBold,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  editLink: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.primaryLight,
  },
});
