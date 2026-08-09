/**
 * VitalsInputGrid — Spec §6.2
 *
 * 2-column numeric input grid for vital signs with clinical normal ranges
 * as helper text. Core vitals always visible; advanced fields in an
 * expandable section.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface VitalField {
  key: string;
  label: string;
  unit: string;
  range: string;
}

const CORE_VITALS: VitalField[] = [
  { key: 'HR', label: 'Heart Rate', unit: 'bpm', range: '60–100' },
  { key: 'O2Sat', label: 'SpO₂', unit: '%', range: '95–100' },
  { key: 'Temp', label: 'Temperature', unit: '°C', range: '36.1–37.2' },
  { key: 'SBP', label: 'Systolic BP', unit: 'mmHg', range: '90–120' },
  { key: 'DBP', label: 'Diastolic BP', unit: 'mmHg', range: '60–80' },
  { key: 'Resp', label: 'Resp Rate', unit: '/min', range: '12–20' },
];

const ADVANCED_VITALS: VitalField[] = [
  { key: 'MAP', label: 'MAP', unit: 'mmHg', range: '70–105' },
  { key: 'Age', label: 'Age', unit: 'yrs', range: '—' },
  { key: 'EtCO2', label: 'EtCO₂', unit: 'mmHg', range: '35–45' },
  { key: 'FiO2', label: 'FiO₂', unit: '%', range: '21–100' },
  { key: 'pH', label: 'pH', unit: '', range: '7.35–7.45' },
  { key: 'Lactate', label: 'Lactate', unit: 'mmol/L', range: '0.5–2.0' },
];

interface VitalsInputGridProps {
  values: Record<string, number>;
  onChange: (values: Record<string, number>) => void;
}

export default function VitalsInputGrid({ values, onChange }: VitalsInputGridProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

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

    return (
      <View key={vital.key} style={styles.gridItem}>
        <Text style={styles.label}>
          {vital.label} {vital.unit ? `(${vital.unit})` : ''}
        </Text>
        <TextInput
          style={styles.input}
          value={display}
          onChangeText={(text) => handleChange(vital.key, text)}
          keyboardType="numeric"
          placeholder={vital.key}
          placeholderTextColor={Colors.textSecondary + '80'}
        />
        <Text style={styles.helperText}>
          Normal: {vital.range} {vital.unit}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Core vitals — always visible */}
      <View style={styles.grid}>
        {CORE_VITALS.map(renderField)}
      </View>

      {/* Advanced section — expandable */}
      <TouchableOpacity
        style={styles.advancedToggle}
        onPress={() => setShowAdvanced(!showAdvanced)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={showAdvanced ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textPrimary}
        />
        <Text style={styles.advancedLabel}>
          Advanced Vitals ({ADVANCED_VITALS.length} fields)
        </Text>
      </TouchableOpacity>

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
    gap: Spacing.sm,
  },
  gridItem: {
    width: '47%',
    marginBottom: Spacing.xs,
  },
  label: {
    fontFamily: Typography.medium,
    fontSize: 13,
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minHeight: 44,
    fontVariant: ['tabular-nums'],
  },
  helperText: {
    fontFamily: Typography.regular,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  advancedLabel: {
    fontFamily: Typography.semiBold,
    fontSize: 14,
    color: Colors.textPrimary,
  },
});
