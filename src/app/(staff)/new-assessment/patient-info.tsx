/**
 * Step 1: Patient Info — Spec §6.2
 *
 * Search-or-create pattern: search field (calls GET /patients?search=)
 * showing matching existing patients, or a "+ New Patient" form
 * (name, age, sex, phone). Selecting/creating a patient stores
 * patient_id in assessmentDraftStore and advances.
 *
 * Three states: loading (search spinner), error (retry), results/empty.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';
import ProgressSteps from '@/components/ui/ProgressSteps';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { searchPatients, createPatient, type PatientOut } from '@/services/patientsApi';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

export default function PatientInfoScreen() {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientOut[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Selected patient
  const selectedPatient = useAssessmentDraftStore((s) => s.patient);
  const setPatient = useAssessmentDraftStore((s) => s.setPatient);

  // New patient form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newSex, setNewSex] = useState<'M' | 'F' | 'Other'>('M');
  const [newPhone, setNewPhone] = useState('');
  const [newErrors, setNewErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // --- Search ---
  async function handleSearch() {
    if (!searchQuery.trim()) return;

    setSearchError('');
    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await searchPatients(searchQuery.trim());
      setSearchResults(results);
    } catch (error: any) {
      setSearchError(
        error?.response?.data?.detail || 'Failed to search patients. Please try again.',
      );
    } finally {
      setIsSearching(false);
    }
  }

  function selectPatient(patient: PatientOut) {
    setPatient(patient);
    setShowNewForm(false);
  }

  // --- Create new patient ---
  function validateNewPatient(): boolean {
    const errors: Record<string, string> = {};
    if (!newName.trim()) errors.name = 'Name is required';
    if (!newAge.trim()) {
      errors.age = 'Age is required';
    } else if (isNaN(parseInt(newAge)) || parseInt(newAge) < 0 || parseInt(newAge) > 150) {
      errors.age = 'Enter a valid age';
    }
    setNewErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreatePatient() {
    if (!validateNewPatient()) return;

    setCreateError('');
    setIsCreating(true);

    try {
      const patient = await createPatient({
        full_name: newName.trim(),
        age: parseInt(newAge),
        sex: newSex,
        phone: newPhone.trim() || null,
      });
      setPatient(patient);
      setShowNewForm(false);
    } catch (error: any) {
      setCreateError(
        error?.response?.data?.detail || 'Failed to create patient. Please try again.',
      );
    } finally {
      setIsCreating(false);
    }
  }

  function handleNext() {
    if (!selectedPatient) return;
    router.push('/(staff)/new-assessment/symptoms');
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ProgressSteps steps={STEPS} currentStep={0} />

      <View style={styles.content}>
        <Text style={styles.title}>Patient Information</Text>
        <Text style={styles.description}>
          Search for an existing patient or create a new record.
        </Text>

        {/* Selected patient banner */}
        {selectedPatient && (
          <View style={styles.selectedBanner}>
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedName}>{selectedPatient.full_name}</Text>
              <Text style={styles.selectedMeta}>
                {selectedPatient.patient_ref} · {selectedPatient.sex} · Age {selectedPatient.age}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setPatient(null)} 
              activeOpacity={0.7}
              style={styles.changeLinkContainer}
            >
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search */}
        {!selectedPatient && (
          <>
            <View style={styles.searchRow}>
              <View style={styles.searchInput}>
                <TextField
                  label="Search Patient"
                  placeholder="Name or patient ref..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <Button
                title="Search"
                onPress={handleSearch}
                loading={isSearching}
                disabled={isSearching || !searchQuery.trim()}
                style={styles.searchButton}
              />
            </View>

            {/* Search results */}
            {searchError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{searchError}</Text>
                <Button title="Retry" onPress={handleSearch} variant="outline" style={styles.retryButton} />
              </View>
            ) : isSearching ? (
              <ActivityIndicator color={Colors.primary} style={styles.spinner} />
            ) : hasSearched && searchResults.length === 0 ? (
              <Text style={styles.emptyText}>No patients found. Create a new record below.</Text>
            ) : (
              searchResults.map((p) => (
                <TouchableOpacity
                  key={p._id}
                  style={[styles.resultCard, Shadows.card]}
                  onPress={() => selectPatient(p)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resultName}>{p.full_name}</Text>
                  <Text style={styles.resultMeta}>
                    {p.patient_ref} · {p.sex} · Age {p.age}
                    {p.phone ? ` · ${p.phone}` : ''}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            {/* New patient toggle */}
            <TouchableOpacity
              style={styles.newPatientToggle}
              onPress={() => setShowNewForm(!showNewForm)}
              activeOpacity={0.7}
            >
              <Text style={styles.newPatientToggleText}>
                {showNewForm ? '− Hide New Patient Form' : '+ New Patient'}
              </Text>
            </TouchableOpacity>

            {/* New patient form */}
            {showNewForm && (
              <View style={[styles.card, Shadows.card]}>
                <Text style={styles.cardTitle}>New Patient</Text>

                {createError ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{createError}</Text>
                  </View>
                ) : null}

                <TextField
                  label="Full Name"
                  placeholder="Patient full name"
                  value={newName}
                  onChangeText={(t) => { setNewName(t); setNewErrors((e) => ({ ...e, name: '' })); }}
                  error={newErrors.name}
                />
                <TextField
                  label="Age"
                  placeholder="Age"
                  keyboardType="numeric"
                  value={newAge}
                  onChangeText={(t) => { setNewAge(t); setNewErrors((e) => ({ ...e, age: '' })); }}
                  error={newErrors.age}
                />

                {/* Sex selector */}
                <Text style={styles.fieldLabel}>Sex</Text>
                <View style={styles.sexSelector}>
                  {(['M', 'F', 'Other'] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.sexOption, newSex === s && styles.sexOptionActive]}
                      onPress={() => setNewSex(s)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.sexText, newSex === s && styles.sexTextActive]}>
                        {s === 'M' ? 'Male' : s === 'F' ? 'Female' : 'Other'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextField
                  label="Phone (Optional)"
                  placeholder="+94771234567"
                  keyboardType="phone-pad"
                  value={newPhone}
                  onChangeText={setNewPhone}
                />

                <Button
                  title="Create Patient"
                  onPress={handleCreatePatient}
                  loading={isCreating}
                  disabled={isCreating}
                />
              </View>
            )}
          </>
        )}

        {/* Next button */}
        {selectedPatient && (
          <Button title="Next: Symptoms →" onPress={handleNext} style={styles.nextButton} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  content: { marginTop: Spacing.md },
  title: {
    fontFamily: Typography.bold, fontSize: 22,
    color: Colors.textPrimary, marginBottom: Spacing.xxs,
  },
  description: {
    fontFamily: Typography.regular, fontSize: 14,
    color: Colors.textSecondary, marginBottom: Spacing.lg,
  },

  // Selected patient
  selectedBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primary + '0A', borderRadius: 12,
    borderWidth: 1, borderColor: Colors.primary + '20',
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  selectedInfo: { flex: 1 },
  selectedName: {
    fontFamily: Typography.semiBold, fontSize: 16, color: Colors.textPrimary,
  },
  selectedMeta: {
    fontFamily: Typography.regular, fontSize: 13,
    color: Colors.textSecondary, marginTop: 2,
  },
  changeLinkContainer: {
    minHeight: 44,
    justifyContent: 'center',
  },
  changeLink: {
    fontFamily: Typography.medium, fontSize: 14, color: Colors.primaryLight,
  },

  // Search
  searchRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  searchInput: { flex: 1 },
  searchButton: { marginTop: 22, minWidth: 80 },
  spinner: { marginVertical: Spacing.lg },
  emptyText: {
    fontFamily: Typography.regular, fontSize: 14,
    color: Colors.textSecondary, fontStyle: 'italic',
    textAlign: 'center', marginVertical: Spacing.md,
  },

  // Search results
  resultCard: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.xs,
  },
  resultName: {
    fontFamily: Typography.semiBold, fontSize: 15, color: Colors.textPrimary,
  },
  resultMeta: {
    fontFamily: Typography.regular, fontSize: 13,
    color: Colors.textSecondary, marginTop: 2,
  },

  // New patient
  newPatientToggle: {
    paddingVertical: Spacing.sm, marginBottom: Spacing.sm,
  },
  newPatientToggleText: {
    fontFamily: Typography.semiBold, fontSize: 15, color: Colors.primaryLight,
  },
  card: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontFamily: Typography.semiBold, fontSize: 16,
    color: Colors.primaryLight, marginBottom: Spacing.sm,
  },
  fieldLabel: {
    fontFamily: Typography.medium, fontSize: 14,
    color: Colors.textPrimary, marginBottom: Spacing.xxs,
  },
  sexSelector: {
    flexDirection: 'row', borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', marginBottom: Spacing.md,
  },
  sexOption: {
    flex: 1, paddingVertical: Spacing.sm,
    alignItems: 'center', backgroundColor: Colors.surface,
    minHeight: 44,
    justifyContent: 'center',
  },
  sexOptionActive: { backgroundColor: Colors.primary },
  sexText: {
    fontFamily: Typography.medium, fontSize: 14, color: Colors.textSecondary,
  },
  sexTextActive: { color: Colors.surface },

  // Error
  errorBanner: {
    backgroundColor: Colors.riskHigh + '12',
    borderWidth: 1, borderColor: Colors.riskHigh + '30',
    borderRadius: 10, padding: Spacing.sm, marginBottom: Spacing.md,
  },
  errorText: {
    fontFamily: Typography.medium, fontSize: 13,
    color: Colors.riskHigh, lineHeight: 19,
  },
  retryButton: { marginTop: Spacing.xs },
  nextButton: { marginTop: Spacing.md },
});
