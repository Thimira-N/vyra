/**
 * Patients API service — typed wrappers for patient endpoints.
 *
 * Spec §3 endpoints:
 *   POST /patients/       — create a new patient record (Staff only)
 *   GET  /patients/?search= — search patients by name or patient_ref (Staff only)
 *
 * Field names match the backend OpenAPI schema exactly:
 *   PatientIn:  {full_name, age, sex, phone?}
 *   PatientOut: {_id, patient_ref, full_name, age, sex, phone?, created_by, created_at}
 */

import api from '@/services/api';

// ---------------------------------------------------------------------------
// Types — match backend Pydantic models exactly
// ---------------------------------------------------------------------------

export interface PatientIn {
  full_name: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  phone?: string | null;
}

export interface PatientOut {
  _id: string;
  patient_ref: string;
  full_name: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  phone: string | null;
  created_by: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** POST /patients/ — create a new patient record */
export async function createPatient(body: PatientIn): Promise<PatientOut> {
  const { data } = await api.post<PatientOut>('/patients/', body);
  return data;
}

/** GET /patients/?search= — search patients by name or patient_ref */
export async function searchPatients(query: string): Promise<PatientOut[]> {
  const { data } = await api.get<PatientOut[]>('/patients/', {
    params: { search: query },
  });
  return data;
}

/** GET /patients/{id} — fetch one patient by ID */
export async function getPatientById(id: string): Promise<PatientOut> {
  const { data } = await api.get<PatientOut>(`/patients/${id}`);
  return data;
}
