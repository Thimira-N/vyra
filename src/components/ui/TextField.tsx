/**
 * TextField — Styled text input with label, error state, and helper text.
 * Uses surface background and border token per Spec §5.
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
}

export default function TextField({
  label,
  error,
  helperText,
  containerStyle,
  style,
  ...inputProps
}: TextFieldProps) {
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        placeholderTextColor={Colors.textSecondary}
        style={[
          styles.input,
          hasError && styles.inputError,
          style,
        ]}
        {...inputProps}
      />

      {hasError && <Text style={styles.errorText}>{error}</Text>}
      {!hasError && helperText && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontFamily: Typography.medium,
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  input: {
    fontFamily: Typography.regular,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.riskHigh,
  },
  errorText: {
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.riskHigh,
    marginTop: Spacing.xxs,
  },
  helperText: {
    fontFamily: Typography.regular,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
});
