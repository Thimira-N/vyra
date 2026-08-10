import React, { useState } from 'react';
import { Alert, Linking, ViewStyle } from 'react-native';
import Button from './Button';
import { getAssessmentReportUrl } from '@/services/assessmentsApi';

interface ReportViewerButtonProps {
  assessmentId: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function ReportViewerButton({
  assessmentId,
  disabled,
  style,
}: ReportViewerButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePress() {
    setLoading(true);
    try {
      const url = await getAssessmentReportUrl(assessmentId);
      await Linking.openURL(url);
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
