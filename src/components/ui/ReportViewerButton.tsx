/**
 * ReportViewerButton — Thin wrapper around Button for PDF report viewing.
 *
 * U1: Confirmed clean — delegates all styling to Button (restyled in this phase).
 * Business logic (API call, navigation) is unchanged.
 */

import React, { useState } from 'react';
import { Alert, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import Button from './Button';
import { getAssessmentReportUrl } from '@/services/assessmentsApi';

interface ReportViewerButtonProps {
  assessmentId: string;
  /** Title shown in the PDF viewer header bar. */
  reportTitle?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function ReportViewerButton({
  assessmentId,
  reportTitle,
  disabled,
  style,
}: ReportViewerButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePress() {
    setLoading(true);
    try {
      const url = await getAssessmentReportUrl(assessmentId);
      // Navigate to the in-app PDF viewer instead of kicking
      // the user out to the system browser via Linking.openURL.
      router.push({
        pathname: '/pdf-viewer',
        params: { url, title: reportTitle || 'Clinical Report' },
      });
    } catch (err: any) {
      Alert.alert(
        'PDF Report',
        err?.response?.data?.detail || 'Unable to generate the PDF report. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      title="Generate PDF Report"
      onPress={handlePress}
      variant="outline"
      loading={loading}
      disabled={disabled || loading}
      style={style}
    />
  );
}
