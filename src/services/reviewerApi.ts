import api from './api';
import type { AssessmentOut } from './assessmentsApi';

export interface DashboardParams {
  status?: string;
  overall_risk?: string;
  start_date?: string;
  end_date?: string;
}

export interface ReviewIn {
  clinical_notes: string;
  reviewer_risk_override?: string;
}

/**
 * GET /reviewer/dashboard
 * Fetch all assessments for the reviewer dashboard across all staff.
 */
export async function getReviewerDashboard(params?: DashboardParams): Promise<AssessmentOut[]> {
  const { data } = await api.get<AssessmentOut[]>('/reviewer/dashboard', {
    params,
  });
  return data;
}

/**
 * POST /reviewer/assessments/{id}/review
 * Submit clinical notes and optionally override risk level.
 */
export async function submitReview(id: string, review: ReviewIn): Promise<AssessmentOut> {
  const { data } = await api.post<AssessmentOut>(`/reviewer/assessments/${id}/review`, review);
  return data;
}
