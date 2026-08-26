/**
 * Dev Theme Check — throwaway screen for verifying U0 & U1 theming + shared components.
 *
 * Renders GlassCard, Button variants, TextField variants, RiskBadge, ProgressSteps,
 * VitalsInputGrid, RiskProbabilityBar, Typography tokens, and Color swatches
 * in both Light and Dark modes.
 *
 * Route: /dev-theme-check
 */

import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassHeader } from '@/components/ui/GlassHeader';
import Button from '@/components/ui/Button';
import TextField from '@/components/ui/TextField';
import RiskBadge from '@/components/ui/RiskBadge';
import ProgressSteps from '@/components/ui/ProgressSteps';
import VitalsInputGrid from '@/components/ui/VitalsInputGrid';
import RiskProbabilityBar from '@/components/charts/RiskProbabilityBar';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import type { ThemeMode } from '@/store/settingsStore';

export default function DevThemeCheck() {
  const { colors, elevation, isDark, mode, setMode, reduceMotion, glassIntensity } = useTheme();
  const router = useRouter();

  const [testText, setTestText] = useState('Patient Name');
  const [vitalsValues, setVitalsValues] = useState<Record<string, number>>({
    HR: 78,
    O2Sat: 98,
    Temp: 36.8,
    SBP: 115,
    DBP: 75,
    Resp: 16,
  });

  const modes: ThemeMode[] = ['system', 'light', 'dark'];

  return (
    <Screen>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Text style={[TypographyScale.h1, { color: colors.textPrimary, marginBottom: Spacing.xs }]}>
          🎨 U1 Component & Theme Check
        </Text>
        <Text style={[TypographyScale.body, { color: colors.textSecondary, marginBottom: Spacing.lg }]}>
          Mode: {mode} | isDark: {String(isDark)} | Glass: {glassIntensity} | ReduceMotion: {String(reduceMotion)}
        </Text>

        {/* Theme mode switcher */}
        <GlassCard style={styles.section}>
          <View style={styles.sectionPadding}>
            <Text style={[TypographyScale.h3, { color: colors.textPrimary, marginBottom: Spacing.sm }]}>
              Theme Mode
            </Text>
            <View style={styles.modeRow}>
              {modes.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={[
                    styles.modeButton,
                    {
                      backgroundColor: mode === m ? colors.primary : colors.surfaceSunken,
                      borderRadius: Radius.md,
                    },
                  ]}
                >
                  <Text
                    style={[
                      TypographyScale.button,
                      { color: mode === m ? colors.textOnPrimary : colors.textPrimary },
                    ]}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* U1: Button Restyle Demo */}
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
          Buttons (Spec §7)
        </Text>
        <GlassCard style={styles.section}>
          <View style={[styles.sectionPadding, { gap: Spacing.sm }]}>
            <Button
              title="Primary Button (Gradient + Shadow)"
              onPress={() => {}}
              variant="primary"
            />
            <Button
              title="Outline Button (GlassCard + Border)"
              onPress={() => {}}
              variant="outline"
            />
            <Button
              title="Ghost Button (Text Only)"
              onPress={() => {}}
              variant="ghost"
            />
            <Button
              title="Loading Primary"
              onPress={() => {}}
              variant="primary"
              loading
            />
            <Button
              title="Disabled State"
              onPress={() => {}}
              variant="primary"
              disabled
            />
          </View>
        </GlassCard>

        {/* U1: TextField Restyle Demo */}
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
          TextFields (Spec §7)
        </Text>
        <GlassCard style={styles.section}>
          <View style={styles.sectionPadding}>
            <TextField
              label="Patient Full Name"
              placeholder="e.g. John Doe"
              value={testText}
              onChangeText={setTestText}
              helperText="Floating label animated above input on focus/value"
            />
            <TextField
              label="Medical Record Number (MRN)"
              placeholder="e.g. MRN-10293"
              defaultValue=""
            />
            <TextField
              label="Systolic BP (Error state)"
              value="220"
              error="Value outside expected clinical physiological limit"
            />
          </View>
        </GlassCard>

        {/* U1: RiskBadge Restyle Demo */}
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
          Risk Badges (Pill + Tinted Glass)
        </Text>
        <GlassCard style={styles.section}>
          <View style={[styles.sectionPadding, { gap: Spacing.sm }]}>
            <View style={styles.rowWrap}>
              <RiskBadge level="Low" size="small" />
              <RiskBadge level="Medium" size="small" />
              <RiskBadge level="High" size="small" />
            </View>
            <View style={styles.rowWrap}>
              <RiskBadge level="Low" size="default" />
              <RiskBadge level="Medium" size="default" />
              <RiskBadge level="High" size="default" />
            </View>
            <View style={styles.rowWrap}>
              <RiskBadge level="Low" size="large" />
              <RiskBadge level="Medium" size="large" />
              <RiskBadge level="High" size="large" />
            </View>
          </View>
        </GlassCard>

        {/* U1: ProgressSteps Restyle Demo */}
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
          ProgressSteps (Spec §7)
        </Text>
        <GlassCard style={styles.section}>
          <View style={styles.sectionPadding}>
            <ProgressSteps
              steps={['Patient', 'Symptoms', 'Image', 'Vitals', 'Review']}
              currentStep={2}
            />
          </View>
        </GlassCard>

        {/* U1: RiskProbabilityBar Restyle Demo */}
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
          RiskProbabilityBar (Spec §6.2)
        </Text>
        <GlassCard style={styles.section}>
          <View style={styles.sectionPadding}>
            <RiskProbabilityBar
              probabilities={{ Low: 20, Medium: 55, High: 25 }}
            />
          </View>
        </GlassCard>

        {/* U1: VitalsInputGrid Restyle Demo */}
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
          VitalsInputGrid (Spec §6.2)
        </Text>
        <GlassCard style={styles.section}>
          <View style={styles.sectionPadding}>
            <VitalsInputGrid
              values={vitalsValues}
              onChange={setVitalsValues}
            />
          </View>
        </GlassCard>

        {/* Typography scale */}
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
          Typography Scale (Spec §4)
        </Text>
        <GlassCard style={styles.section}>
          <View style={styles.sectionPadding}>
            {Object.entries(TypographyScale).map(([name, token]) => (
              <View key={name} style={styles.typographyRow}>
                <Text style={[TypographyScale.caption, { color: colors.textTertiary, width: 85 }]}>
                  {name}
                </Text>
                <Text style={[token, { color: colors.textPrimary, flex: 1 }]}>
                  The quick brown fox
                </Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Color swatches */}
        <Text style={[TypographyScale.h2, { color: colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm }]}>
          Color Tokens (Spec §2)
        </Text>
        <GlassCard style={styles.section}>
          <View style={styles.sectionPadding}>
            <View style={styles.swatchGrid}>
              {([
                ['primary', colors.primary],
                ['primaryLight', colors.primaryLight],
                ['background', colors.background],
                ['surface', colors.surface],
                ['surfaceRaised', colors.surfaceRaised],
                ['surfaceSunken', colors.surfaceSunken],
                ['riskLow', colors.riskLow],
                ['riskMedium', colors.riskMedium],
                ['riskHigh', colors.riskHigh],
                ['border', colors.border],
                ['borderStrong', colors.borderStrong],
                ['divider', colors.divider],
              ] as const).map(([name, color]) => (
                <View key={name} style={styles.swatchItem}>
                  <View
                    style={[
                      styles.swatch,
                      {
                        backgroundColor: color,
                        borderWidth: 1,
                        borderColor: colors.border,
                      },
                    ]}
                  />
                  <Text style={[TypographyScale.caption, { color: colors.textSecondary }]}>
                    {name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </GlassCard>

        {/* Navigation Demo */}
        <View style={{ marginTop: Spacing.lg }}>
          <Button
            title="← Back to Login"
            onPress={() => router.back()}
            variant="outline"
          />
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.sm,
  },
  sectionPadding: {
    padding: Spacing.md,
  },
  modeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  typographyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxs,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatchItem: {
    alignItems: 'center',
    width: 72,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginBottom: Spacing.xxs,
  },
});
