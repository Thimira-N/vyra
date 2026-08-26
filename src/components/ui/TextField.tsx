/**
 * TextField — Styled text input with label, error state, and helper text.
 *
 * U1 restyle per Spec §7:
 *   - Background: surfaceSunken (opaque, NOT glass)
 *   - Radius: md (14)
 *   - Border: 1.5px border default, primary border + soft glow on focus
 *   - Label: caption token, floats above on focus/value (150ms ease-out)
 *   - Error: riskHigh/danger color for border and text
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';

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
  value: valueProp,
  defaultValue,
  placeholder,
  onChangeText: onChangeTextProp,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  ...inputProps
}: TextFieldProps) {
  const { colors, reduceMotion } = useTheme();
  const hasError = !!error;
  const [isFocused, setIsFocused] = useState(false);
  const [internalText, setInternalText] = useState(defaultValue ?? '');

  const effectiveValue = valueProp !== undefined ? valueProp : internalText;
  const hasValue = effectiveValue !== undefined && effectiveValue !== null && String(effectiveValue).length > 0;
  const isFloated = isFocused || hasValue;

  // Label float animation (150ms ease-out, per Spec §1.4 / §7)
  const labelAnim = useRef(new Animated.Value(isFloated ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      labelAnim.setValue(isFloated ? 1 : 0);
      return;
    }
    Animated.timing(labelAnim, {
      toValue: isFloated ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFloated, labelAnim, reduceMotion]);

  const onFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      onFocusProp?.(e);
    },
    [onFocusProp],
  );

  const onBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      onBlurProp?.(e);
    },
    [onBlurProp],
  );

  const onChangeText = useCallback(
    (text: string) => {
      if (valueProp === undefined) {
        setInternalText(text);
      }
      onChangeTextProp?.(text);
    },
    [valueProp, onChangeTextProp],
  );

  // Interpolated label styles: resting at top: 14px, floating up to -8px (above border)
  const labelTranslateY = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, -8],
  });
  const labelScale = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  });

  const focusBorderColor = hasError ? colors.danger : isFocused ? colors.primary : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Floating label */}
      {label && (
        <Animated.View
          style={[
            styles.labelWrapper,
            {
              transform: [
                { translateY: labelTranslateY },
                { scale: labelScale },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Text
            style={[
              TypographyScale.caption,
              {
                color: hasError
                  ? colors.danger
                  : isFocused
                    ? colors.primary
                    : colors.textSecondary,
                backgroundColor: isFloated ? colors.surfaceSunken : 'transparent',
                paddingHorizontal: isFloated ? 4 : 0,
              },
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      )}

      <TextInput
        value={valueProp}
        defaultValue={defaultValue}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={isFloated || !label ? placeholder : undefined}
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.input,
          {
            color: colors.textPrimary,
            backgroundColor: colors.surfaceSunken,
            borderColor: focusBorderColor,
            borderRadius: Radius.md,
            fontFamily: TypographyScale.body.fontFamily,
            fontSize: TypographyScale.body.fontSize,
          },
          isFocused && !hasError && {
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.12,
            shadowRadius: 4,
          },
          style,
        ]}
        {...inputProps}
      />

      {hasError && (
        <Text
          style={[
            TypographyScale.caption,
            { color: colors.danger, marginTop: Spacing.xxs },
          ]}
        >
          {error}
        </Text>
      )}
      {!hasError && helperText && (
        <Text
          style={[
            TypographyScale.caption,
            { color: colors.textSecondary, marginTop: Spacing.xxs },
          ]}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    position: 'relative',
    paddingTop: 6, // space for floating label to sit neatly
  },
  labelWrapper: {
    position: 'absolute',
    left: Spacing.md,
    top: 0,
    zIndex: 2,
    transformOrigin: 'left top',
  },
  input: {
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
});
