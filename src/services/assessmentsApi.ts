/**
 * Assessments API service — typed wrappers for assessment endpoints.
 *
 * Spec §3 endpoints:
 *   POST /assessments/             — submit new assessment (Staff, multipart/form-data)
 *   GET  /assessments/{id}/report  — get PDF report URL (Staff/Reviewer)
 *
 * POST /assessments/ sends multipart/form-data with:
 *   patient_id:    string
 *   symptoms_text: string
 *   vitals:        string (JSON-encoded object)
 *   file:          binary (optional image)
 *
 * Field names in AssessmentOut match the MongoDB schema (Spec §2.3) exactly.
 */

import api from '@/services/api';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Types — mirror MongoDB assessment document shape (Spec §2.3) exactly
// ---------------------------------------------------------------------------

export interface FlaggedVital {
  vital: string;
  label: string;
  value: number;
  severity: string;
  threshold: string;
}

export interface PerModalityImage {
  risk: string;
  finding: string;
  confidence_pct: number;
}

export interface PerModalityText {
  risk: string;
  match: string;
  confidence_pct: number;
}

export interface PerModalityVitals {
  risk: string;
  flags: number;
  flagged_vitals: FlaggedVital[];
}

export interface PerModality {
  image: PerModalityImage | null;
  text: PerModalityText | null;
  vitals: PerModalityVitals | null;
}

export interface DifferentialSummary {
  image_finding: string;
  symptom_match: string;
  vitals_pattern: string;
  consistency_note: string;
}

export interface AssessmentResult {
  overall_risk: 'Low' | 'Medium' | 'High';
  confidence_pct: number;
  risk_probabilities: { Low: number; Medium: number; High: number };
  triage_tier: string;
  fusion_method: string;
  per_modality: PerModality;
  differential_summary: DifferentialSummary;
  gradcam_overlay_url: string | null;
}

export interface ReviewOut {
  reviewed_by: string;
  reviewed_at: string;
  clinical_notes: string;
  reviewer_risk_override: 'Low' | 'Medium' | 'High' | null;
}

export interface AssessmentInput {
  symptoms_text: string;
  image_url: string | null;
  vitals: Record<string, number>;
}

export interface AssessmentOut {
  _id: string;
  assessment_ref: string;
  patient_id: string;
  created_by: string;
  status: 'pending_review' | 'reviewed';
  created_at: string;
  input: AssessmentInput;
  result: AssessmentResult;
  review: ReviewOut | null;
  report_pdf_url: string | null;
}

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------

export interface CreateAssessmentDraft {
  patient_id: string;
  symptoms_text: string;
  vitals: Record<string, number>;
  imageUri: string | null;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * POST /assessments/ — submit new assessment (multipart/form-data)
 *
 * The backend expects multipart with:
 *   patient_id:    string
 *   symptoms_text: string
 *   vitals:        string (JSON-encoded)
 *   file:          binary (optional)
 */
export async function createAssessment(draft: CreateAssessmentDraft): Promise<AssessmentOut> {
  const formData = new FormData();
  formData.append('patient_id', draft.patient_id);
  formData.append('symptoms_text', draft.symptoms_text);
  formData.append('vitals', JSON.stringify(draft.vitals));

  if (draft.imageUri) {
    // Extract filename and determine MIME type
    const filename = draft.imageUri.split('/').pop() || 'image.jpg';
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

    // React Native FormData expects this shape for file uploads
    formData.append('file', {
      uri: draft.imageUri,
      name: filename,
      type: mimeType,
    } as any);
  }

  const { data } = await api.post<AssessmentOut>('/assessments/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // ML inference can take a while on CPU
  });
  return data;
}

/**
 * GET /assessments/{id}/report — returns the PDF report URL
 * The backend redirects to the actual PDF; we return the redirect URL.
 */
export async function getAssessmentReportUrl(assessmentId: string): Promise<string> {
  const { request } = await api.get(`/assessments/${assessmentId}/report`, {
    maxRedirects: 0,
    validateStatus: (status) => status >= 200 && status < 400,
  });

  // On web/native the redirect URL might be in different places
  return request.responseURL || request._url || `${api.defaults.baseURL}/assessments/${assessmentId}/report`;
}

/**
 * GET /assessments/mine — list assessments created by the logged-in staff
 */
export async function getMyAssessments(): Promise<AssessmentOut[]> {
  const { data } = await api.get<AssessmentOut[]>('/assessments/mine');
  return data;
}

/**
 * GET /assessments/{id} — fetch one assessment by ID
 */
export async function getAssessmentById(id: string): Promise<AssessmentOut> {
  const { data } = await api.get<AssessmentOut>(`/assessments/${id}`);
  return data;
}
