/**
 * ClinicalConfirmModal — Ultra-Premium Custom Confirmation Dialog.
 *
 * Replaces generic native OS Alert popups with a modern, glassmorphic
 * clinical confirmation modal featuring:
 * - Frosted blur glass backdrop with smooth fade-in
 * - Centered floating capsule with subtle specular highlight rim
 * - Clinical status icon badge with glowing background
 * - High-contrast typography and clear action buttons
 * - Reanimated physics spring entrance
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Spacing } from '@/constants/theme';

interface ClinicalConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ClinicalConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  icon = 'log-out-outline',
  onConfirm,
  onCancel,
  isLoading = false,
}: ClinicalConfirmModalProps) {
  const { colors, isDark, glassIntensity } = useTheme();

  if (!visible) return null;

  const isDanger = confirmVariant === 'danger';
  const accentColor = isDanger ? colors.danger : colors.primary;

  const confirmBtnGradient = isDanger
    ? (['#E53E3E', '#C53030', '#9B2C2C'] as const)
    : (['#0F4C5C', '#176579', '#1D7A8C'] as const);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          {/* Frosted Glass Layer */}
          {glassIntensity !== 'off' && (
            <BlurView
              intensity={isDark ? 45 : 30}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* Dark Tint Overlay */}
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark
                  ? 'rgba(3, 7, 12, 0.72)'
                  : 'rgba(15, 23, 42, 0.45)',
              },
            ]}
          />

          {/* Centered Modal Card */}
          <TouchableWithoutFeedback>
            <Animated.View
              entering={ZoomIn.duration(240).springify().damping(16)}
              exiting={ZoomOut.duration(180)}
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(14, 25, 34, 0.94)'
                    : 'rgba(255, 255, 255, 0.98)',
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.14)'
                    : 'rgba(15, 76, 92, 0.12)',
                },
              ]}
            >
              {/* Top Specular Edge Line */}
              <LinearGradient
                colors={
                  isDark
                    ? ['rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.35)']
                    : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.50)', 'rgba(255, 255, 255, 0.95)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.topSpecularLine}
              />

              {/* Icon Housing */}
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: `${accentColor}18`,
                    borderColor: `${accentColor}35`,
                  },
                ]}
              >
                <Ionicons name={icon} size={28} color={accentColor} />
              </View>

              {/* Title & Message */}
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {title}
              </Text>
              <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                {message}
              </Text>

              {/* Action Buttons Row */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255, 255, 255, 0.06)'
                        : '#F1F5F9',
                      borderColor: isDark
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'rgba(15, 76, 92, 0.12)',
                    },
                  ]}
                  onPress={onCancel}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      { color: isDark ? '#E2E8F0' : '#475569' },
                    ]}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButtonWrapper}
                  onPress={onConfirm}
                  activeOpacity={0.82}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={confirmBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.confirmButtonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons
                          name={icon}
                          size={18}
                          color="#FFFFFF"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.confirmButtonText}>
                          {confirmText}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: {
        elevation: 18,
      },
    }),
  },
  topSpecularLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  modalMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
    letterSpacing: 0.1,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  confirmButtonWrapper: {
    flex: 1,
    height: 48,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#E53E3E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  confirmButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
