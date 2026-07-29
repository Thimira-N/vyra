/**
 * Step 4: Review & Submit — Spec §6.2
 * Read-only summary of all data entered in steps 1-3 with edit links.
 * Placeholder for Phase F0. Full implementation in Phase F2.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import ProgressSteps from '@/components/ui/ProgressSteps';
import Button from '@/components/ui/Button';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

export default function ReviewSubmitScreen() {
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
        <SummarySection title="Patient Info" editHref="/(staff)/new-assessment/patient-info">
          <Text style={styles.summaryText}>Patient data will appear here</Text>
        </SummarySection>

        {/* Symptoms summary */}
        <SummarySection title="Symptoms" editHref="/(staff)/new-assessment/symptoms">
          <Text style={styles.summaryText}>Symptom description will appear here</Text>
        </SummarySection>

        {/* Image summary */}
        <SummarySection title="Clinical Image" editHref="/(staff)/new-assessment/image-capture">
          <Text style={styles.summaryText}>No image selected (optional)</Text>
        </SummarySection>

        {/* Vitals summary */}
        <SummarySection title="Vital Signs" editHref="/(staff)/new-assessment/vitals">
          <Text style={styles.summaryText}>Vitals data will appear here</Text>
        </SummarySection>

        {/* Submit */}
        <Link href="/(staff)/new-assessment/analyzing" asChild>
          <Button title="Submit for Analysis" onPress={() => {}} />
        </Link>
      </View>
    </ScrollView>
  );
}

function SummarySection({
  title,
  editHref,
  children,
}: {
  title: string;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[summaryStyles.card, Shadows.card]}>
      <View style={summaryStyles.header}>
        <Text style={summaryStyles.title}>{title}</Text>
        <Link href={editHref as any} style={summaryStyles.editLink}>
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
    color: Colors.textSecondary,
    fontStyle: 'italic',
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
