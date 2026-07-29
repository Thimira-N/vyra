# Clinical RSS — Implementation Roadmap
Companion document to `Clinical_RSS_Frontend_Architecture_Spec.md`. That document defines *what* to build. This document defines *the order to build it in* and *how to know each piece is actually done*.

**Rule for every phase:** fully read `Clinical_RSS_Frontend_Architecture_Spec.md` before starting any phase, and only touch the files listed under that phase's "Files" unless explicitly instructed otherwise.

---

## FRONTEND ROADMAP — Phases F0 to F6
Runs inside `clinic-app`. Requires Phases B0–B4 (backend roadmap, in `clinical-rss-api/designref/`) to already be live and verified on the deployed Hugging Face Space — every phase below calls those real endpoints.

## PHASE F0 — Expo App Scaffold
**Spec sections:** 4 (folder structure), 5 (design system)

**Goal:** Full navigation shell exists and runs, every route in Spec §4 renders a placeholder screen, no real data yet.

**Files:** entire `app/` route tree from Spec §4 (placeholder content only), `constants/theme.ts` (exact tokens from Spec §5), base components in `components/ui/` (`Button`, `TextField`, `RiskBadge`, `ProgressSteps`), `services/api.ts` (axios instance + JWT interceptor, pointed at the deployed backend URL), `store/authStore.ts` skeleton, TanStack Query provider wired in root layout

**Definition of Done:**
- [ ] App builds and runs in Expo Go / a simulator with zero errors
- [ ] Every route from Spec §4's file tree exists and is reachable
- [ ] `RiskBadge` renders correctly in all three colors from Spec §5's palette
- [ ] `api.ts` successfully calls `GET /health` on the real deployed backend and logs the response — this is the one proof-of-connectivity check for this phase

---

## PHASE F1 — Auth Flow
**Spec sections:** 6.1

**Files:** `(auth)/login.tsx`, `register.tsx`, `forgot-password.tsx`, `consent.tsx`, wire `authStore.ts` fully, `services/authApi.ts`

**Definition of Done:**
- [ ] Register → auto-login → consent → correct role home screen, full real flow against Phase B1
- [ ] JWT persists in `expo-secure-store` and survives app restart
- [ ] Consent screen's accept button is genuinely disabled until scrolled to bottom
- [ ] Logout clears SecureStore and returns to Login

---

## PHASE F2 — New Assessment Flow (Staff)
**Spec sections:** 6.2 (patient-info through result)

Largest frontend phase — the 7-screen wizard. Split into two sittings if needed: F2a (steps 1–4, form/data collection) and F2b (analyzing + result screens, which render real API response data).

**Files:** all of `(staff)/new-assessment/*`, `store/assessmentDraftStore.ts`, `components/ui/VitalsInputGrid.tsx`, `components/charts/RiskProbabilityBar.tsx`, `services/assessmentsApi.ts`, `services/patientsApi.ts`

**Definition of Done:**
- [ ] Patient search/create works against Phase B2
- [ ] Image step is genuinely skippable, matching the partial-modality support in the backend
- [ ] Submitting calls `POST /assessments` from Phase B3a and the Result screen renders the **real** returned `result` object — every field (`per_modality`, `differential_summary`, `risk_probabilities`) actually on screen, not placeholder text
- [ ] "Generate PDF Report" button on Result screen calls Phase B3b's report endpoint and opens/shares a real PDF

---

## PHASE F3 — Staff History
**Spec sections:** 6.2 (History, History Detail)

**Files:** `(staff)/history/index.tsx`, `[id].tsx`

**Definition of Done:**
- [ ] List calls `GET /assessments/mine`, shows risk badge + review status per row
- [ ] Detail screen shows reviewer notes if `status === "reviewed"`, correctly hides that section if not

---

## PHASE F4 — Reviewer Flow
**Spec sections:** 6.3

**Files:** `(reviewer)/dashboard.tsx`, `case/[id].tsx`, `services/reviewerApi.ts`

**Definition of Done:**
- [ ] Dashboard filter chips (All/Pending/Reviewed, risk level) actually filter against Phase B4's query params
- [ ] Case Detail's "Mark as Reviewed" round-trips correctly — notes persist, status updates, dashboard reflects the change on return
- [ ] Risk override control is clearly visually distinct from the original AI risk badge (per the audit-trail requirement — these must never look like the same value)

---

## PHASE F5 — Profile & Report Viewing
**Spec sections:** 6.2 (Profile), 6.3 (Profile), 3.1 (PDF viewing)

**Files:** `(staff)/profile.tsx`, `(reviewer)/profile.tsx`, PDF viewer component (WebView or `expo-print` share sheet) reused across F2/F3/F4

**Definition of Done:**
- [ ] Both profile screens show correct role-specific fields, working logout
- [ ] PDF report opens/shares correctly from Result, History Detail, and Case Detail screens (one shared component, not three separate implementations)

---

## PHASE F6 — Full QA Pass
**Spec sections:** 5 (design system audit), 8 (traceability table)

Not a coding phase — a verification phase. No new features here; only fixes to what already exists.

**Checklist:**
- [ ] Walk Spec §8's traceability table top to bottom — open the actual screen for every row, confirm it exists and works
- [ ] Every API-calling screen has visibly distinct loading / error / empty states (Spec §5's "three explicit states" rule) — spot-check by turning off wifi mid-action
- [ ] Color usage matches Spec §5 tokens exactly — no ad-hoc hex values introduced along the way
- [ ] Tap targets ≥ 44×44pt on every interactive element
- [ ] Full run-through: register as staff → submit an assessment with all 3 modalities → log out → register as reviewer → find that case on the dashboard → review it → log back in as the original staff user → confirm the review shows up in History Detail

**This phase is the actual "done" — the app isn't complete until every box above is checked against the real running app, not against code that looks right.**
