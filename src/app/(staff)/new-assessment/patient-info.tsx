/**
 * Step 1: Patient Info — Spec §6.2, UI Upgrade U4
 *
 * "Clinical Glass" restyle:
 * - Screen wrapper with gradient mesh + blob accents
 * - ProgressSteps at top
 * - Search-or-create cards in elevated GlassCards
 * - Safe area & bottom clearance
 * - Preserved logic: searchPatients, createPatient, assessmentDraftStore integration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { TypographyScale, Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import ProgressSteps from '@/components/ui/ProgressSteps';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { searchPatients, createPatient, type PatientOut } from '@/services/patientsApi';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';
import { NotificationService } from '@/services/notificationService';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

export default function PatientInfoScreen() {
  const { colors } = useTheme();

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

      NotificationService.notify(
        'success',
        'Patient Created',
        `Successfully created record for ${patient.full_name}`,
      );
    } catch (error: any) {
      setCreateError(
        error?.response?.data?.detail || 'Failed to create patient. Please try again.',
      );
      NotificationService.notify(
        'error',
        'Failed to create',
        'An error occurred while creating the patient record.',
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
    <Screen safeArea={true}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressSteps steps={STEPS} currentStep={0} />

        <View style={styles.content}>
          <Text style={[TypographyScale.h1, styles.title, { color: colors.textPrimary }]}>
            Patient Information
          </Text>
          <Text style={[TypographyScale.body, styles.description, { color: colors.textSecondary }]}>
            Search for an existing patient or create a new record.
          </Text>

          {/* Selected patient banner */}
          {selectedPatient && (
            <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.selectedBanner}>
              <View style={styles.selectedBannerInner}>
                <View style={styles.selectedInfo}>
                  <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '700' }]}>
                    {selectedPatient.full_name}
                  </Text>
                  <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {selectedPatient.patient_ref} · {selectedPatient.sex} · Age {selectedPatient.age}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setPatient(null)}
                  activeOpacity={0.7}
                  style={styles.changeLinkContainer}
                >
                  <Text style={[TypographyScale.button, { color: colors.primaryLight, fontSize: 14 }]}>
                    Change
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}

          {/* Search */}
          {!selectedPatient && (
            <>
              <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.searchCard}>
                <View style={styles.searchCardInner}>
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
                </View>
              </GlassCard>

              {/* Search results */}
              {searchError ? (
                <GlassCard tint="default" elevation="raised" radius="md" style={styles.errorCard}>
                  <View style={styles.errorInner}>
                    <Text style={[TypographyScale.body, { color: colors.danger, textAlign: 'center' }]}>
                      {searchError}
                    </Text>
                    <Button title="Retry" onPress={handleSearch} variant="outline" style={{ marginTop: Spacing.xs }} />
                  </View>
                </GlassCard>
              ) : isSearching ? (
                <ActivityIndicator color={colors.primary} style={styles.spinner} />
              ) : hasSearched && searchResults.length === 0 ? (
                <Text style={[TypographyScale.body, styles.emptyText, { color: colors.textSecondary }]}>
                  No patients found. Create a new record below.
                </Text>
              ) : (
                searchResults.map((p) => (
                  <GlassCard key={p._id} tint="default" elevation="raised" radius="md" style={styles.resultCard}>
                    <TouchableOpacity
                      style={styles.resultInner}
                      onPress={() => selectPatient(p)}
                      activeOpacity={0.7}
                    >
                      <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                        {p.full_name}
                      </Text>
                      <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                        {p.patient_ref} · {p.sex} · Age {p.age}
                        {p.phone ? ` · ${p.phone}` : ''}
                      </Text>
                    </TouchableOpacity>
                  </GlassCard>
                ))
              )}

              {/* New patient toggle */}
              <TouchableOpacity
                style={styles.newPatientToggle}
                onPress={() => setShowNewForm(!showNewForm)}
                activeOpacity={0.7}
              >
                <Text style={[TypographyScale.button, { color: colors.primaryLight, fontSize: 15 }]}>
                  {showNewForm ? '− Hide New Patient Form' : '+ New Patient'}
                </Text>
              </TouchableOpacity>

              {/* New patient form */}
              {showNewForm && (
                <GlassCard tint="elevated" elevation="raised" radius="md" style={styles.formCard}>
                  <View style={styles.formCardInner}>
                    <Text style={[TypographyScale.h3, styles.cardTitle, { color: colors.primaryLight }]}>
                      New Patient Record
                    </Text>

                    {createError ? (
                      <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}15`, borderColor: `${colors.danger}35` }]}>
                        <Text style={[TypographyScale.caption, { color: colors.danger }]}>
                          {createError}
                        </Text>
                      </View>
                    ) : null}

                    <TextField
                      label="Full Name"
                      placeholder="Patient full name"
                      value={newName}
                      onChangeText={(t) => {
                        setNewName(t);
                        setNewErrors((e) => ({ ...e, name: '' }));
                      }}
                      error={newErrors.name}
                    />
                    <TextField
                      label="Age"
                      placeholder="Age"
                      keyboardType="numeric"
                      value={newAge}
                      onChangeText={(t) => {
                        setNewAge(t);
                        setNewErrors((e) => ({ ...e, age: '' }));
                      }}
                      error={newErrors.age}
                    />

                    {/* Sex selector */}
                    <Text style={[TypographyScale.caption, styles.fieldLabel, { color: colors.textSecondary }]}>
                      Sex
                    </Text>
                    <View style={[styles.sexSelector, { backgroundColor: colors.surfaceSunken, borderColor: colors.border }]}>
                      {(['M', 'F', 'Other'] as const).map((s) => (
                        <TouchableOpacity
                          key={s}
                          style={[
                            styles.sexOption,
                            newSex === s && { backgroundColor: colors.primary, borderRadius: Radius.md - 2 },
                          ]}
                          onPress={() => setNewSex(s)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              TypographyScale.button,
                              {
                                color: newSex === s ? colors.textOnPrimary : colors.textSecondary,
                                fontSize: 13,
                              },
                            ]}
                          >
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
                </GlassCard>
              )}
            </>
          )}

          {/* Next button */}
          {selectedPatient && (
            <Button title="Next: Symptoms →" onPress={handleNext} style={styles.nextButton} />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 96,
  },
  content: {
    marginTop: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xxs,
  },
  description: {
    marginBottom: Spacing.lg,
  },
  selectedBanner: {
    marginBottom: Spacing.lg,
  },
  selectedBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  selectedInfo: {
    flex: 1,
  },
  changeLinkContainer: {
    minHeight: 44,
    justifyContent: 'center',
  },
  searchCard: {
    marginBottom: Spacing.md,
  },
  searchCardInner: {
    padding: Spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
  },
  searchButton: {
    marginTop: 22,
    minWidth: 80,
  },
  spinner: {
    marginVertical: Spacing.lg,
  },
  emptyText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: Spacing.md,
  },
  resultCard: {
    marginBottom: Spacing.xs,
  },
  resultInner: {
    padding: Spacing.md,
  },
  newPatientToggle: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  formCard: {
    marginBottom: Spacing.lg,
  },
  formCardInner: {
    padding: Spacing.md,
  },
  cardTitle: {
    marginBottom: Spacing.sm,
  },
  fieldLabel: {
    marginBottom: Spacing.xxs,
    fontWeight: '600',
  },
  sexSelector: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 3,
    marginBottom: Spacing.md,
  },
  sexOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  errorBanner: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorCard: {
    marginBottom: Spacing.md,
  },
  errorInner: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  nextButton: {
    marginTop: Spacing.md,
  },
});
