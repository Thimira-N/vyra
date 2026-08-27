/**
 * Step 1: Patient Info — Spec §6.2, UI Upgrade U4
 *
 * Premium Clinical Patient Selection:
 * - Clean progress steps at top
 * - Prominent selected patient identification card
 * - Search bar with instant feedback
 * - Expandable new patient registration card with pill sex selector
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
import { Ionicons } from '@expo/vector-icons';
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
  const { colors, isDark } = useTheme();

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
            Select an existing registered patient or create a new clinical profile.
          </Text>

          {/* Selected patient banner */}
          {selectedPatient && (
            <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.selectedBanner}>
              <View style={styles.selectedBannerInner}>
                <View style={[styles.avatarCircle, { backgroundColor: isDark ? colors.surfaceRaised : `${colors.primary}15` }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {selectedPatient.full_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.selectedInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.patientNameText, { color: colors.textPrimary }]}>
                      {selectedPatient.full_name}
                    </Text>
                    <View style={[styles.refBadge, { backgroundColor: colors.surfaceSunken }]}>
                      <Text style={[styles.refText, { color: colors.textSecondary }]}>
                        {selectedPatient.patient_ref}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {selectedPatient.sex === 'M' ? 'Male' : selectedPatient.sex === 'F' ? 'Female' : 'Other'} • Age {selectedPatient.age}
                    {selectedPatient.phone ? ` • ${selectedPatient.phone}` : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setPatient(null)}
                  activeOpacity={0.7}
                  style={[styles.changeBtn, { backgroundColor: `${colors.primary}12` }]}
                >
                  <Text style={[styles.changeBtnText, { color: colors.primary }]}>
                    Change
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}

          {/* Search Section */}
          {!selectedPatient && (
            <>
              <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.searchCard}>
                <View style={styles.searchCardInner}>
                  <View style={styles.searchRow}>
                    <View style={styles.searchInput}>
                      <TextField
                        label="Search Patient Database"
                        placeholder="Search by name or Ref ID..."
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

              {/* Search Results */}
              {searchError ? (
                <GlassCard tint="default" elevation="raised" radius="md" style={styles.errorCard}>
                  <View style={styles.errorInner}>
                    <Ionicons name="alert-circle" size={24} color={colors.danger} />
                    <Text style={[TypographyScale.body, { color: colors.danger, textAlign: 'center', marginTop: 4 }]}>
                      {searchError}
                    </Text>
                    <Button title="Retry" onPress={handleSearch} variant="outline" style={{ marginTop: Spacing.sm }} />
                  </View>
                </GlassCard>
              ) : isSearching ? (
                <View style={styles.spinnerWrapper}>
                  <ActivityIndicator color={colors.primary} size="large" />
                  <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: Spacing.xs }]}>
                    Searching medical records...
                  </Text>
                </View>
              ) : hasSearched && searchResults.length === 0 ? (
                <GlassCard tint="default" radius="md" style={styles.noResultsCard}>
                  <View style={styles.noResultsInner}>
                    <Ionicons name="person-outline" size={32} color={colors.textTertiary} />
                    <Text style={[TypographyScale.body, styles.emptyText, { color: colors.textSecondary }]}>
                      No matching patient records found.
                    </Text>
                    <Text style={[TypographyScale.caption, { color: colors.textTertiary, textAlign: 'center' }]}>
                      Create a new patient record below to proceed.
                    </Text>
                  </View>
                </GlassCard>
              ) : (
                searchResults.map((p) => (
                  <GlassCard key={p._id} tint="elevated" elevation="raised" radius="md" style={styles.resultCard}>
                    <TouchableOpacity
                      style={styles.resultInner}
                      onPress={() => selectPatient(p)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.avatarCircleSmall, { backgroundColor: `${colors.primary}15` }]}>
                        <Text style={[styles.avatarTextSmall, { color: colors.primary }]}>
                          {p.full_name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.resultDetails}>
                        <View style={styles.resultTitleRow}>
                          <Text style={[TypographyScale.body, { color: colors.textPrimary, fontWeight: '700' }]}>
                            {p.full_name}
                          </Text>
                          <View style={[styles.refBadge, { backgroundColor: colors.surfaceSunken }]}>
                            <Text style={[styles.refText, { color: colors.textSecondary }]}>
                              {p.patient_ref}
                            </Text>
                          </View>
                        </View>
                        <Text style={[TypographyScale.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                          {p.sex === 'M' ? 'Male' : p.sex === 'F' ? 'Female' : 'Other'} · Age {p.age}
                          {p.phone ? ` · ${p.phone}` : ''}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </GlassCard>
                ))
              )}

              {/* New patient toggle */}
              <TouchableOpacity
                style={[
                  styles.newPatientToggle,
                  {
                    backgroundColor: showNewForm ? `${colors.primary}15` : isDark ? colors.surfaceSunken : '#F1F5F9',
                    borderColor: showNewForm ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setShowNewForm(!showNewForm)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showNewForm ? 'close-circle-outline' : 'person-add-outline'}
                  size={18}
                  color={colors.primary}
                />
                <Text style={[styles.toggleBtnText, { color: colors.primary }]}>
                  {showNewForm ? 'Hide New Patient Form' : 'Register New Patient'}
                </Text>
              </TouchableOpacity>

              {/* New patient form */}
              {showNewForm && (
                <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.formCard}>
                  <View style={styles.formCardInner}>
                    <View style={styles.formHeader}>
                      <Ionicons name="person-add" size={18} color={colors.primary} />
                      <Text style={[TypographyScale.h3, { color: colors.textPrimary }]}>
                        New Patient Registration
                      </Text>
                    </View>

                    {createError ? (
                      <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}15`, borderColor: `${colors.danger}35` }]}>
                        <Text style={[TypographyScale.caption, { color: colors.danger }]}>
                          {createError}
                        </Text>
                      </View>
                    ) : null}

                    <TextField
                      label="Full Name"
                      placeholder="e.g. Nimal Perera"
                      value={newName}
                      onChangeText={(t) => {
                        setNewName(t);
                        setNewErrors((e) => ({ ...e, name: '' }));
                      }}
                      error={newErrors.name}
                    />

                    <TextField
                      label="Age"
                      placeholder="e.g. 45"
                      keyboardType="numeric"
                      value={newAge}
                      onChangeText={(t) => {
                        setNewAge(t);
                        setNewErrors((e) => ({ ...e, age: '' }));
                      }}
                      error={newErrors.age}
                    />

                    {/* Sex Selector */}
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      Biological Sex
                    </Text>
                    <View style={[styles.sexSelector, { backgroundColor: colors.surfaceSunken, borderColor: colors.border }]}>
                      {(['M', 'F', 'Other'] as const).map((s) => {
                        const isSelected = newSex === s;
                        return (
                          <TouchableOpacity
                            key={s}
                            style={[
                              styles.sexOption,
                              isSelected && {
                                backgroundColor: colors.primary,
                                borderRadius: Radius.pill,
                              },
                            ]}
                            onPress={() => setNewSex(s)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.sexOptionText,
                                {
                                  color: isSelected ? colors.textOnPrimary : colors.textSecondary,
                                  fontWeight: isSelected ? '700' : '500',
                                },
                              ]}
                            >
                              {s === 'M' ? 'Male' : s === 'F' ? 'Female' : 'Other'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <TextField
                      label="Phone Number (Optional)"
                      placeholder="+94771234567"
                      keyboardType="phone-pad"
                      value={newPhone}
                      onChangeText={setNewPhone}
                    />

                    <Button
                      title="Save & Select Patient"
                      onPress={handleCreatePatient}
                      loading={isCreating}
                      disabled={isCreating}
                      style={{ marginTop: Spacing.xs }}
                    />
                  </View>
                </GlassCard>
              )}
            </>
          )}

          {/* Next CTA */}
          {selectedPatient && (
            <Button
              title="Next: Symptoms Description →"
              onPress={handleNext}
              style={styles.nextButton}
            />
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
    paddingBottom: 110,
  },
  content: {
    marginTop: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.xxs,
  },
  description: {
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  /* ── Selected Banner ── */
  selectedBanner: {
    marginBottom: Spacing.lg,
  },
  selectedBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  selectedInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  patientNameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  refBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  refText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 12,
    marginTop: 2,
  },
  changeBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* ── Search ── */
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
  spinnerWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  noResultsCard: {
    marginBottom: Spacing.md,
  },
  noResultsInner: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  emptyText: {
    fontWeight: '600',
  },
  resultCard: {
    marginBottom: Spacing.xs,
  },
  resultInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  avatarCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarTextSmall: {
    fontSize: 15,
    fontWeight: '700',
  },
  resultDetails: {
    flex: 1,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  /* ── New Patient Form ── */
  newPatientToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    minHeight: 46,
  },
  toggleBtnText: {
    fontFamily: TypographyScale.button.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  formCard: {
    marginBottom: Spacing.lg,
  },
  formCardInner: {
    padding: Spacing.md,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: TypographyScale.caption.fontSize,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  sexSelector: {
    flexDirection: 'row',
    borderRadius: Radius.pill,
    borderWidth: 1,
    padding: 3,
    marginBottom: Spacing.md,
  },
  sexOption: {
    flex: 1,
    paddingVertical: Spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
  },
  sexOptionText: {
    fontFamily: TypographyScale.caption.fontFamily,
    fontSize: 12,
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
