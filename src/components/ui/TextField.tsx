/**
 * TextField — Ultra-Premium Clinical Input Component.
 *
 * Features:
 * - Animated floating label with background pill mask
 * - Password visibility toggle (eye / eye-off) with smooth state management
 * - Crisp 1.5px focus border and ambient focus glow
 * - Left/Right accessory icons
 * - Clean error and helper text with clinical iconography
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
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
  secureTextEntry,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onChangeText: onChangeTextProp,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  ...inputProps
}: TextFieldProps) {
  const { colors, isDark, reduceMotion } = useTheme();
  const hasError = !!error;
  const [isFocused, setIsFocused] = useState(false);
  const [internalText, setInternalText] = useState(defaultValue ?? '');

  // Password visibility toggle state
  const isPassword = !!secureTextEntry;
  const [isPasswordHidden, setIsPasswordHidden] = useState(isPassword);

  const effectiveValue = valueProp !== undefined ? valueProp : internalText;
  const hasValue =
    effectiveValue !== undefined &&
    effectiveValue !== null &&
    String(effectiveValue).length > 0;
  const isFloated = isFocused || hasValue;

  // Label float animation (160ms ease-out)
  const labelAnim = useRef(new Animated.Value(isFloated ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      labelAnim.setValue(isFloated ? 1 : 0);
      return;
    }
    Animated.timing(labelAnim, {
      toValue: isFloated ? 1 : 0,
      duration: 160,
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

  // Interpolated label styles: resting at top: 16px, floating up to -8px
  const labelTranslateY = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, -9],
  });
  const labelScale = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.82],
  });

  const borderColor = hasError
    ? colors.danger
    : isFocused
    ? colors.primary
    : isDark
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(15, 76, 92, 0.16)';

  const surfaceBg = isDark
    ? isFocused
      ? 'rgba(18, 30, 40, 0.90)'
      : 'rgba(12, 22, 30, 0.80)'
    : isFocused
    ? '#FFFFFF'
    : 'rgba(244, 248, 250, 0.95)';

  const hasRightAccessory = isPassword || rightIcon;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Floating Label with Backdrop Mask */}
      {label && (
        <Animated.View
          style={[
            styles.labelWrapper,
            {
              left: leftIcon ? 42 : Spacing.md,
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
              styles.labelText,
              {
                color: hasError
                  ? colors.danger
                  : isFocused
                  ? colors.primary
                  : colors.textSecondary,
                backgroundColor: isFloated
                  ? isDark
                    ? '#0C1720'
                    : '#FFFFFF'
                  : 'transparent',
                paddingHorizontal: isFloated ? 6 : 0,
              },
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      )}

      {/* Input Wrapper Container */}
      <View style={styles.inputWrapper}>
        {/* Optional Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons
              name={leftIcon}
              size={20}
              color={isFocused ? colors.primary : colors.textTertiary}
            />
          </View>
        )}

        <TextInput
          value={valueProp}
          defaultValue={defaultValue}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={isFloated || !label ? placeholder : undefined}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={isPassword ? isPasswordHidden : false}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              backgroundColor: surfaceBg,
              borderColor: borderColor,
              paddingLeft: leftIcon ? 44 : Spacing.md,
              paddingRight: hasRightAccessory ? 48 : Spacing.md,
            },
            isFocused &&
              !hasError && {
                ...Platform.select({
                  ios: {
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.18,
                    shadowRadius: 8,
                  },
                  android: {
                    elevation: 2,
                  },
                }),
              },
            style,
          ]}
          {...inputProps}
        />

        {/* Password Eye Toggle Button */}
        {isPassword && (
          <TouchableOpacity
            style={styles.rightAccessoryBtn}
            onPress={() => setIsPasswordHidden(!isPasswordHidden)}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={isPasswordHidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons
              name={isPasswordHidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={isPasswordHidden ? colors.textTertiary : colors.primary}
            />
          </TouchableOpacity>
        )}

        {/* Custom Right Icon (if not password) */}
        {!isPassword && rightIcon && (
          <TouchableOpacity
            style={styles.rightAccessoryBtn}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={isFocused ? colors.primary : colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {hasError && (
        <View style={styles.feedbackRow}>
          <Ionicons name="alert-circle" size={13} color={colors.danger} style={{ marginRight: 4 }} />
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {error}
          </Text>
        </View>
      )}

      {/* Helper Text */}
      {!hasError && helperText && (
        <Text style={[styles.helperText, { color: colors.textSecondary }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md + 2,
    position: 'relative',
    paddingTop: 6,
  },
  labelWrapper: {
    position: 'absolute',
    top: 0,
    zIndex: 3,
    transformOrigin: 'left top',
  },
  labelText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    borderRadius: 4,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.md + 2,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    minHeight: 52,
    fontFamily: TypographyScale.body.fontFamily,
    fontSize: 15,
    letterSpacing: 0.1,
  },
  leftIconContainer: {
    position: 'absolute',
    left: 14,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightAccessoryBtn: {
    position: 'absolute',
    right: 14,
    zIndex: 2,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xxs + 2,
    paddingHorizontal: 4,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.1,
    flex: 1,
  },
  helperText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: Spacing.xxs + 2,
    paddingHorizontal: 4,
    letterSpacing: 0.1,
  },
});
