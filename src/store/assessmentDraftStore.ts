/**
 * Assessment Draft Store — Zustand
 *
 * Holds the in-progress multi-step form state for the new assessment wizard.
 * Each screen reads/writes its section. The review screen reads all sections.
 * The analyzing screen consumes the entire draft to build the API request.
 *
 * Field names match the backend POST /assessments body (Spec §3).
 */

import { create } from 'zustand';
import type { PatientOut } from '@/services/patientsApi';

interface AssessmentDraftState {
  // Step 1: Patient
  patient_id: string | null;
  patient: PatientOut | null;

  // Step 1b: Symptoms
  symptoms_text: string;

  // Step 2: Image (local URI or null)
  imageUri: string | null;

  // Step 3: Vitals
  vitals: Record<string, number>;

  // Result (stored after successful submission so result.tsx can access it)
  assessmentId: string | null;

  // Actions
  setPatient: (patient: PatientOut | null) => void;
  setSymptoms: (text: string) => void;
  setImage: (uri: string | null) => void;
  setVitals: (vitals: Record<string, number>) => void;
  setAssessmentId: (id: string) => void;
  reset: () => void;
}

const initialState = {
  patient_id: null,
  patient: null,
  symptoms_text: '',
  imageUri: null,
  vitals: {},
  assessmentId: null,
};

export const useAssessmentDraftStore = create<AssessmentDraftState>((set) => ({
  ...initialState,

  setPatient: (patient: PatientOut | null) =>
    set({ patient_id: patient ? patient._id : null, patient }),

  setSymptoms: (text: string) =>
    set({ symptoms_text: text }),

  setImage: (uri: string | null) =>
    set({ imageUri: uri }),

  setVitals: (vitals: Record<string, number>) =>
    set({ vitals }),

  setAssessmentId: (id: string) =>
    set({ assessmentId: id }),

  reset: () => set(initialState),
}));
