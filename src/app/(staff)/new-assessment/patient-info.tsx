/**
 * Step 1: Patient Info — Spec §6.2, UI Upgrade
 *
 * Ultra-Premium Clinical Patient Selection:
 * - Segmented Dual Mode Switcher (Find Patient vs New Patient)
 * - Auto-loads recent medical records for instant 1-tap selection
 * - Verified Patient Hero Dossier Card with verified badge
 * - Unified Search Capsule with instant clear & search trigger
 * - Clean Clinical Form with styled Biological Sex pills
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, Radius } from '@/constants/theme';
import { Screen } from '@/components/ui/Screen';
import { GlassCard } from '@/components/ui/GlassCard';
import ProgressSteps from '@/components/ui/ProgressSteps';
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { searchPatients, createPatient, type PatientOut } from '@/services/patientsApi';
import { useAssessmentDraftStore } from '@/store/assessmentDraftStore';
import { useAuthStore } from '@/store/authStore';
import { NotificationService } from '@/services/notificationService';

const STEPS = ['Patient', 'Symptoms', 'Image', 'Vitals', 'Review'];

export default function PatientInfoScreen() {
  const { colors, isDark } = useTheme();
  const currentUser = useAuthStore((s) => s.user);

  // Search & Recent State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientOut[]>([]);
  const [recentPatients, setRecentPatients] = useState<PatientOut[]>([]);
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

  // Initial load of recent patients created by this logged-in account
  useEffect(() => {
    let isMounted = true;
    async function loadRecent() {
      try {
        const patients = await searchPatients('');
        if (isMounted) {
          const userPatients = currentUser?._id
            ? patients.filter((p) => p.created_by === currentUser._id)
            : patients;
          setRecentPatients(userPatients.slice(0, 6));
        }
      } catch {
        // Fallback silently if offline or initial fetch fails
      }
    }
    loadRecent();
    return () => {
      isMounted = false;
    };
  }, [currentUser?._id]);

  // --- Search ---
  async function handleSearch() {
    if (!searchQuery.trim()) return;

    setSearchError('');
    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await searchPatients(searchQuery.trim());
      const userResults = currentUser?._id
        ? results.filter((p) => p.created_by === currentUser._id)
        : results;
      setSearchResults(userResults);
    } catch (error: any) {
      setSearchError(
        error?.response?.data?.detail || 'Failed to search medical records. Please try again.',
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
    if (!newName.trim()) errors.name = 'Patient name is required';
    if (!newAge.trim()) {
      errors.age = 'Age is required';
    } else if (isNaN(parseInt(newAge)) || parseInt(newAge) < 0 || parseInt(newAge) > 150) {
      errors.age = 'Enter a valid age (0–150)';
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
      setRecentPatients((prev) => [patient, ...prev.filter((p) => p._id !== patient._id)].slice(0, 6));
      setShowNewForm(false);

      NotificationService.notify(
        'success',
        'Patient Created',
        `Successfully registered record for ${patient.full_name}`,
      );
    } catch (error: any) {
      setCreateError(
        error?.response?.data?.detail || 'Failed to create patient record. Please try again.',
      );
      NotificationService.notify(
        'error',
        'Creation Failed',
        'Could not save patient record to database.',
      );
    } finally {
      setIsCreating(false);
    }
  }

  function handleNext() {
    if (!selectedPatient) return;
    router.push('/(staff)/new-assessment/symptoms');
  }

  const displayedPatients = hasSearched ? searchResults : recentPatients;

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
          {/* Header Title */}
          <View style={styles.headerTitleArea}>
            <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>
              Patient Information
            </Text>
            <Text style={[styles.mainSubtitle, { color: colors.textSecondary }]}>
              Select an existing clinical record or register a new patient profile.
            </Text>
          </View>

          {/* Selected Patient Hero Dossier Card */}
          {selectedPatient ? (
            <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.selectedHeroCard}>
              <LinearGradient
                colors={
                  isDark
                    ? ['rgba(79, 209, 224, 0.12)', 'rgba(15, 76, 92, 0.04)']
                    : ['rgba(15, 76, 92, 0.06)', 'rgba(29, 122, 140, 0.02)']
                }
                style={styles.selectedGradientInner}
              >
                <View style={styles.selectedTopRow}>
                  <View style={[styles.avatarCircleHero, { backgroundColor: isDark ? colors.surfaceRaised : `${colors.primary}18`, borderColor: colors.primary }]}>
                    <Text style={[styles.avatarTextHero, { color: colors.primary }]}>
                      {selectedPatient.full_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.selectedDetails}>
                    <View style={styles.nameBadgeRow}>
                      <Text style={[styles.selectedFullName, { color: colors.textPrimary }]} numberOfLines={1}>
                        {selectedPatient.full_name}
                      </Text>
                      <View style={[styles.refBadgePill, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.15)' : 'rgba(15, 76, 92, 0.10)' }]}>
                        <Text style={[styles.refBadgeText, { color: colors.primary }]}>
                          {selectedPatient.patient_ref}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metaPillsRow}>
                      <View style={[styles.miniMetaPill, { backgroundColor: colors.surfaceSunken }]}>
                        <Ionicons
                          name={selectedPatient.sex === 'M' ? 'man-outline' : selectedPatient.sex === 'F' ? 'woman-outline' : 'person-outline'}
                          size={12}
                          color={colors.textSecondary}
                          style={{ marginRight: 4 }}
                        />
                        <Text style={[styles.miniMetaText, { color: colors.textSecondary }]}>
                          {selectedPatient.sex === 'M' ? 'Male' : selectedPatient.sex === 'F' ? 'Female' : 'Other'} · Age {selectedPatient.age}
                        </Text>
                      </View>
                      {selectedPatient.phone ? (
                        <View style={[styles.miniMetaPill, { backgroundColor: colors.surfaceSunken }]}>
                          <Ionicons name="call-outline" size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
                          <Text style={[styles.miniMetaText, { color: colors.textSecondary }]}>
                            {selectedPatient.phone}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>

                {/* Status bar */}
                <View style={styles.verifiedRow}>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={15} color={colors.success} style={{ marginRight: 5 }} />
                    <Text style={[styles.verifiedText, { color: colors.success }]}>
                      Record Linked & Verified
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setPatient(null)}
                    activeOpacity={0.7}
                    style={[styles.changeRecordBtn, { borderColor: colors.border }]}
                  >
                    <Ionicons name="swap-horizontal" size={13} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.changeRecordText, { color: colors.textSecondary }]}>
                      Change
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </GlassCard>
          ) : (
            <>
              {/* Segmented Dual Mode Switcher */}
              <View style={[styles.segmentedSwitch, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E9EFF1' }]}>
                <TouchableOpacity
                  style={[
                    styles.segmentTab,
                    !showNewForm && [
                      styles.segmentTabActive,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ],
                  ]}
                  onPress={() => setShowNewForm(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="search"
                    size={15}
                    color={!showNewForm ? colors.primary : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.segmentTabText,
                      {
                        color: !showNewForm ? colors.textPrimary : colors.textSecondary,
                        fontFamily: !showNewForm ? 'Inter_700Bold' : 'Inter_500Medium',
                      },
                    ]}
                  >
                    Find Existing Patient
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentTab,
                    showNewForm && [
                      styles.segmentTabActive,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ],
                  ]}
                  onPress={() => setShowNewForm(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="person-add"
                    size={15}
                    color={showNewForm ? colors.primary : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.segmentTabText,
                      {
                        color: showNewForm ? colors.textPrimary : colors.textSecondary,
                        fontFamily: showNewForm ? 'Inter_700Bold' : 'Inter_500Medium',
                      },
                    ]}
                  >
                    + New Patient
                  </Text>
                </TouchableOpacity>
              </View>

              {/* SEARCH MODE */}
              {!showNewForm ? (
                <>
                  <View style={styles.searchSection}>
                    <View
                      style={[
                        styles.searchBar,
                        {
                          backgroundColor: colors.surface,
                          borderColor: searchQuery.trim() ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="search"
                        size={20}
                        color={searchQuery.trim() ? colors.primary : colors.textTertiary}
                        style={styles.searchIcon}
                      />
                      <TextInput
                        placeholder="Search name, phone, or Ref ID..."
                        placeholderTextColor={colors.textTertiary}
                        value={searchQuery}
                        onChangeText={(t) => {
                          setSearchQuery(t);
                          if (!t.trim()) {
                            setHasSearched(false);
                          }
                        }}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                        style={[styles.searchInputField, { color: colors.textPrimary }]}
                      />
                      {searchQuery.trim().length > 0 && (
                        <TouchableOpacity
                          onPress={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                            setHasSearched(false);
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={styles.clearSearchBtn}
                        >
                          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        activeOpacity={0.8}
                        style={[
                          styles.searchActionBtn,
                          {
                            backgroundColor: searchQuery.trim() ? colors.primary : `${colors.primary}35`,
                          },
                        ]}
                      >
                        {isSearching ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Search Results / Recent List */}
                  {searchError ? (
                    <GlassCard tint="default" elevation="raised" radius="md" style={styles.errorCard}>
                      <View style={styles.errorInner}>
                        <Ionicons name="alert-circle" size={24} color={colors.danger} />
                        <Text style={[styles.errorText, { color: colors.danger }]}>
                          {searchError}
                        </Text>
                        <Button title="Retry" onPress={handleSearch} variant="outline" style={{ marginTop: Spacing.sm }} />
                      </View>
                    </GlassCard>
                  ) : isSearching ? (
                    <View style={styles.spinnerWrapper}>
                      <ActivityIndicator color={colors.primary} size="large" />
                      <Text style={[styles.spinnerText, { color: colors.textSecondary }]}>
                        Searching medical database...
                      </Text>
                    </View>
                  ) : displayedPatients.length > 0 ? (
                    <View style={styles.resultsContainer}>
                      <View style={styles.resultsHeaderRow}>
                        <Text style={[styles.resultsHeaderTitle, { color: colors.textSecondary }]}>
                          {hasSearched ? `SEARCH RESULTS (${displayedPatients.length})` : 'RECENT MEDICAL RECORDS'}
                        </Text>
                        <Text style={[styles.quickSelectHint, { color: colors.textTertiary }]}>
                          Tap to select
                        </Text>
                      </View>

                      {displayedPatients.map((p) => (
                        <GlassCard key={p._id} tint="elevated" elevation="raised" radius="md" style={styles.resultCard}>
                          <TouchableOpacity
                            style={styles.resultInner}
                            onPress={() => selectPatient(p)}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.avatarCircleSmall, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.15)' : `${colors.primary}12` }]}>
                              <Text style={[styles.avatarTextSmall, { color: colors.primary }]}>
                                {p.full_name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <View style={styles.resultDetails}>
                              <View style={styles.resultTitleRow}>
                                <Text style={[styles.resultPatientName, { color: colors.textPrimary }]}>
                                  {p.full_name}
                                </Text>
                                <View style={[styles.refBadge, { backgroundColor: colors.surfaceSunken }]}>
                                  <Text style={[styles.refText, { color: colors.textSecondary }]}>
                                    {p.patient_ref}
                                  </Text>
                                </View>
                              </View>
                              <Text style={[styles.resultMeta, { color: colors.textSecondary }]}>
                                {p.sex === 'M' ? 'Male' : p.sex === 'F' ? 'Female' : 'Other'} · Age {p.age}
                                {p.phone ? ` · ${p.phone}` : ''}
                              </Text>
                            </View>
                            <View style={[styles.selectArrowCircle, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.12)' : 'rgba(15, 76, 92, 0.08)' }]}>
                              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                            </View>
                          </TouchableOpacity>
                        </GlassCard>
                      ))}
                    </View>
                  ) : hasSearched ? (
                    <GlassCard tint="default" radius="md" style={styles.noResultsCard}>
                      <View style={styles.noResultsInner}>
                        <Ionicons name="person-outline" size={36} color={colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                          No matching records found
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                          No patient in your account matches "{searchQuery}". Register a new profile using the tab above.
                        </Text>
                      </View>
                    </GlassCard>
                  ) : (
                    <GlassCard tint="default" radius="md" style={styles.noResultsCard}>
                      <View style={styles.noResultsInner}>
                        <Ionicons name="folder-open-outline" size={36} color={colors.textTertiary} />
                        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                          No recent medical records
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                          You have not registered any patient records on this account yet.
                        </Text>
                        <TouchableOpacity
                          style={[styles.createFirstRecordBtn, { backgroundColor: colors.primary }]}
                          onPress={() => setShowNewForm(true)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="person-add" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text style={styles.createFirstRecordText}>Register First Patient</Text>
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  )}
                </>
              ) : (
                /* NEW PATIENT REGISTRATION MODE */
                <GlassCard tint="elevated" elevation="raised" radius="lg" style={styles.formCard}>
                  <View style={styles.formCardInner}>
                    <View style={styles.formHeader}>
                      <View style={[styles.formIconBadge, { backgroundColor: isDark ? 'rgba(79, 209, 224, 0.15)' : 'rgba(15, 76, 92, 0.10)' }]}>
                        <Ionicons name="person-add" size={18} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
                          New Patient Profile
                        </Text>
                        <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
                          A Medical Ref ID will be generated automatically
                        </Text>
                      </View>
                    </View>

                    {createError ? (
                      <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}15`, borderColor: `${colors.danger}35` }]}>
                        <Ionicons name="alert-circle" size={16} color={colors.danger} style={{ marginRight: 6 }} />
                        <Text style={[styles.errorBannerText, { color: colors.danger }]}>
                          {createError}
                        </Text>
                      </View>
                    ) : null}

                    <TextField
                      label="Full Name *"
                      placeholder="e.g. Nimal Perera"
                      value={newName}
                      onChangeText={(t) => {
                        setNewName(t);
                        setNewErrors((e) => ({ ...e, name: '' }));
                      }}
                      error={newErrors.name}
                    />

                    <TextField
                      label="Age *"
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
                      Biological Sex *
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
                                  fontFamily: isSelected ? 'Inter_700Bold' : 'Inter_500Medium',
                                },
                              ]}
                            >
                              {s === 'M' ? '👨 Male' : s === 'F' ? '👩 Female' : '⚧ Other'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <TextField
                      label="Phone Number (Optional)"
                      placeholder="+94 77 123 4567"
                      keyboardType="phone-pad"
                      value={newPhone}
                      onChangeText={setNewPhone}
                    />

                    <Button
                      title="Save & Select Patient"
                      onPress={handleCreatePatient}
                      loading={isCreating}
                      disabled={isCreating}
                      style={{ marginTop: Spacing.md }}
                    />
                  </View>
                </GlassCard>
              )}
            </>
          )}

          {/* Navigation CTA: Continue to Symptoms */}
          {selectedPatient && (
            <View style={styles.ctaSection}>
              <Button
                title="Continue to Symptoms Assessment →"
                onPress={handleNext}
                style={styles.nextButton}
              />
            </View>
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
    paddingBottom: 120,
  },
  content: {
    marginTop: Spacing.xs,
  },
  headerTitleArea: {
    marginBottom: Spacing.md,
  },
  mainTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  mainSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: 3,
  },

  /* ── Selected Hero Dossier Card ── */
  selectedHeroCard: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  selectedGradientInner: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  selectedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarCircleHero: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarTextHero: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 22,
  },
  selectedDetails: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  selectedFullName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    letterSpacing: -0.2,
  },
  refBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  refBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  metaPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  miniMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  miniMetaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  changeRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  changeRecordText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
  },

  /* ── Segmented Switcher ── */
  segmentedSwitch: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: Radius.md,
  },
  segmentTabActive: {
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  segmentTabText: {
    fontSize: 13,
  },

  /* ── Search ── */
  searchSection: {
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInputField: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    paddingVertical: Spacing.xs,
  },
  clearSearchBtn: {
    padding: Spacing.xxs,
    marginRight: Spacing.xs,
  },
  searchActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  spinnerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginTop: Spacing.xs,
  },

  /* ── Results List ── */
  resultsContainer: {
    marginTop: Spacing.xs,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
    paddingHorizontal: 2,
  },
  resultsHeaderTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  quickSelectHint: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 2,
  },
  avatarTextSmall: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  resultDetails: {
    flex: 1,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultPatientName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14.5,
  },
  refBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  refText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
  },
  resultMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  selectArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },

  /* ── Empty State ── */
  noResultsCard: {
    marginTop: Spacing.sm,
  },
  noResultsInner: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  errorCard: {
    marginBottom: Spacing.md,
  },
  errorInner: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },

  /* ── Form Card ── */
  formCard: {
    marginBottom: Spacing.md,
  },
  formCardInner: {
    padding: Spacing.md,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  formIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  formSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    marginTop: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    flex: 1,
  },
  fieldLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  sexOptionText: {
    fontSize: 13,
  },

  /* ── CTA Section ── */
  ctaSection: {
    marginTop: Spacing.md,
  },
  nextButton: {
    minHeight: 52,
  },
  createFirstRecordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    marginTop: Spacing.md,
  },
  createFirstRecordText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
});
