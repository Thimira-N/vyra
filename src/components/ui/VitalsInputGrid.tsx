/**
 * VitalsInputGrid — Spec §6.2
 *
 * Premium 2-column clinical numeric input grid for vital signs with
 * clinical icons, unit badges, and normal ranges.
 * Core vitals always visible; advanced fields in an expandable section.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';

interface VitalField {
  key: string;
  label: string;
  unit: string;
  range: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CORE_VITALS: VitalField[] = [
  { key: 'HR', label: 'Heart Rate', unit: 'bpm', range: '60–100', icon: 'heart-outline' },
  { key: 'O2Sat', label: 'SpO₂', unit: '%', range: '95–100', icon: 'fitness-outline' },
  { key: 'Temp', label: 'Temperature', unit: '°C', range: '36.1–37.2', icon: 'thermometer-outline' },
  { key: 'SBP', label: 'Systolic BP', unit: 'mmHg', range: '90–120', icon: 'speedometer-outline' },
  { key: 'DBP', label: 'Diastolic BP', unit: 'mmHg', range: '60–80', icon: 'speedometer-outline' },
  { key: 'Resp', label: 'Resp Rate', unit: '/min', range: '12–20', icon: 'pulse-outline' },
];

const ADVANCED_VITALS: VitalField[] = [
  { key: 'MAP', label: 'Mean Art. Pressure', unit: 'mmHg', range: '70–105', icon: 'analytics-outline' },
  { key: 'Age', label: 'Age', unit: 'yrs', range: '—', icon: 'person-outline' },
  { key: 'EtCO2', label: 'End-Tidal CO₂', unit: 'mmHg', range: '35–45', icon: 'cloudy-outline' },
  { key: 'FiO2', label: 'Fractional O₂', unit: '%', range: '21–100', icon: 'water-outline' },
  { key: 'pH', label: 'Arterial pH', unit: '', range: '7.35–7.45', icon: 'flask-outline' },
  { key: 'Lactate', label: 'Serum Lactate', unit: 'mmol/L', range: '0.5–2.0', icon: 'beaker-outline' },
];

interface VitalsInputGridProps {
  values: Record<string, number>;
  onChange: (values: Record<string, number>) => void;
}

export default function VitalsInputGrid({ values, onChange }: VitalsInputGridProps) {
  const { colors, isDark } = useTheme();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  function handleChange(key: string, text: string) {
    const num = parseFloat(text);
    const updated = { ...values };
    if (text === '' || isNaN(num)) {
      delete updated[key];
    } else {
      updated[key] = num;
    }
    onChange(updated);
  }

  function renderField(vital: VitalField) {
    const raw = values[vital.key];
    const display = raw !== undefined ? String(raw) : '';
    const hasValue = display.length > 0;
    const isFocused = focusedField === vital.key;

    return (
      <View
        key={vital.key}
        style={[
          styles.cardItem,
          {
            backgroundColor: isDark ? colors.surfaceSunken : '#F8FAFC',
            borderColor: isFocused
              ? colors.primary
              : hasValue
                ? colors.borderStrong
                : colors.border,
          },
        ]}
      >
        {/* Header: Icon + Label */}
        <View style={styles.cardHeader}>
          <Ionicons
            name={vital.icon}
            size={14}
            color={hasValue || isFocused ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.fieldLabel,
              { color: hasValue || isFocused ? colors.textPrimary : colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {vital.label}
          </Text>
        </View>

        {/* Input + Unit Row */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                fontFamily: TypographyScale.h2.fontFamily,
              },
            ]}
            value={display}
            onChangeText={(text) => handleChange(vital.key, text)}
            onFocus={() => setFocusedField(vital.key)}
            onBlur={() => setFocusedField(null)}
            keyboardType="decimal-pad"
            placeholder="—"
            placeholderTextColor={colors.textTertiary}
          />
          {vital.unit ? (
            <View style={[styles.unitBadge, { backgroundColor: isDark ? colors.surfaceRaised : '#EDF2F7' }]}>
              <Text style={[styles.unitText, { color: colors.textSecondary }]}>
                {vital.unit}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Normal Range */}
        <View style={styles.rangeRow}>
          <Text style={[styles.rangeText, { color: colors.textTertiary }]}>
            Normal: {vital.range}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      {/* Core Vitals Grid */}
      <View style={styles.grid}>
        {CORE_VITALS.map(renderField)}
      </View>

      {/* Advanced Toggle Button */}
      <TouchableOpacity
        style={[
          styles.advancedToggle,
          {
            backgroundColor: isDark ? 'rgba(79, 209, 224, 0.08)' : 'rgba(15, 76, 92, 0.05)',
            borderColor: isDark ? 'rgba(79, 209, 224, 0.20)' : 'rgba(15, 76, 92, 0.15)',
          },
        ]}
        onPress={() => setShowAdvanced(!showAdvanced)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={showAdvanced ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.primary}
        />
        <Text style={[styles.toggleText, { color: colors.primary }]}>
          {showAdvanced ? 'Hide Advanced Parameters' : `Advanced Parameters (${ADVANCED_VITALS.length} fields)`}
        </Text>
      </TouchableOpacity>

      {/* Advanced Vitals Grid */}
      {showAdvanced && (
        <View style={styles.grid}>
          {ADVANCED_VITALS.map(renderField)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  cardItem: {
    width: '48%',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  fieldLabel: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  input: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    padding: 0,
    fontVariant: ['tabular-nums'],
  },
  unitBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  unitText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 10,
    fontWeight: '600',
  },
  rangeRow: {
    marginTop: 4,
  },
  rangeText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 10,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    minHeight: 44,
  },
  toggleText: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
});
