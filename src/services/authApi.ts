/**
 * Auth API service — typed wrappers for the 4 auth endpoints.
 *
 * Spec §3 endpoints:
 *   POST /auth/register  — create account, returns {token, user}
 *   POST /auth/login     — authenticate, returns {token, user}
 *   GET  /auth/me        — current user profile (Bearer required)
 *   POST /auth/consent   — record consent acceptance (Bearer required)
 *
 * Field names match the backend OpenAPI schema exactly:
 *   UserIn:  {full_name, email, password, role, facility_name}
 *   LoginBody: {email, password}
 *   UserOut: {_id, full_name, email, role, facility_name, consent_accepted_at, created_at, last_login_at}
 */

import api from '@/services/api';
import type { User } from '@/store/authStore';

// ---------------------------------------------------------------------------
// Request types — match backend Pydantic models exactly
// ---------------------------------------------------------------------------

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: 'staff' | 'reviewer';
  facility_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/** POST /auth/register — create account, auto-login */
export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', body);
  return data;
}

/** POST /auth/login — authenticate with email + password */
export async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', body);
  return data;
}

/** GET /auth/me — fetch current user profile (requires JWT) */
export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

/** POST /auth/consent — record consent acceptance timestamp */
export async function acceptConsent(): Promise<User> {
  const { data } = await api.post<User>('/auth/consent');
  return data;
}
