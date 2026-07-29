# Clinical RSS — Frontend, Backend & Database Architecture Specification
**Multimodal Deep Learning-Based Early Risk Stratification System**
Thimira Navodana · 2544510 · CIS013-3 · React Native (Expo SDK 56)

This document is the implementation-ready specification for everything **beyond** the ML models — the mobile app, the app backend, and the database. It is written to match, field for field, the approved Scope, Research Proposal, and Contextual Report: two roles (Healthcare Staff / Reviewer), the exact assessment workflow, MongoDB as the database, and the Low/Medium/High risk output with explainability.

---

## 1. Architecture Overview — Read This First

There's a critical structural point that determines everything else in this document, so it comes first.

**Your currently deployed Hugging Face Space is a stateless ML inference engine only.** Every endpoint in `main.py` (`/predict-image`, `/predict-text`, `/predict-vitals`, `/predict-fusion`, `/predict-fusion-report`, `/predict-image-gradcam`, `/health`, `/model-info`) takes an input, runs it through the models, and returns a JSON response. **Nothing is saved anywhere.** There is no concept of a user, a login, a patient record, or history — call it twice with the same input and you get two independent, unlinked answers.

But your Scope document requires: secure login, two roles, patient records, assessment history, a reviewer dashboard, doctor notes, and "a secure database (MongoDB) to store patient records and prediction history." None of that can live in a stateless inference API. So the real system has **three tiers**, not one:

```
┌─────────────────────────┐      ┌──────────────────────────┐      ┌───────────────────────────┐
│   React Native App      │─────▶│   App Backend (NEW)       │─────▶│   ML Inference API          │
│   (Expo SDK 56)         │◀─────│   FastAPI + MongoDB       │◀─────│   (EXISTING — HF Space)     │
│                          │      │   Auth · Patients ·       │      │   4 trained models +        │
│   iOS / Android          │      │   Assessments · Reviews   │      │   fusion layer, stateless   │
└─────────────────────────┘      └──────────────────────────┘      └───────────────────────────┘
                                          │
                                          ▼
                                  ┌───────────────────┐
                                  │  MongoDB Atlas      │
                                  │  (free M0 tier)     │
                                  └───────────────────┘
```

The app **never** calls the HF Space directly. It always talks to the **App Backend**, which itself calls the ML Inference API internally, then persists the result. This is the only architecture that satisfies "assessment history," "reviewer dashboard," and "secure database" simultaneously — a stateless ML API physically cannot provide any of those three.

### 1.1 Why MongoDB, not Supabase

You mentioned earlier that you were considering MongoDB or Supabase. Sticking with **MongoDB** is the right call here, not just a preference — your **already-approved** Scope, Proposal, and Contextual Report commit to it explicitly and repeatedly:

- Scope §2.2 Objectives: *"Create and maintain a secure database (MongoDB)..."*
- Contextual Report §1.2 Objectives: *"To create and maintain a secure database to store patient data..."*
- Contextual Report §4.1: *"The result, along with patient data, can be saved in MongoDB..."*
- Contextual Report §4.3 Technical Architecture — Database Layer: *"Patient data...will be stored in MongoDB."*
- Contextual Report includes an actual **Database Diagram (Figure 6)** modelled as MongoDB collections with `patient_records` as the primary collection.

Switching to Supabase (Postgres) now would contradict deliverables your supervisor has already signed off on, and you'd have to redo the ER/database diagram discussion in your write-up. There's no technical reason to switch — MongoDB's document model is actually a good fit here, since each assessment naturally nests symptom text, an image reference, vitals, and a fusion result together, without SQL joins across four tables. Store the image files themselves as URIs pointing to hosted storage (Section 3.4) — never as binary blobs in MongoDB — that's the one adjustment worth making versus the conceptual diagram.

### 1.2 Where the App Backend lives

Simplest path for a solo dev on a deadline: **add new routers to your existing FastAPI app**, in the same `rss_api` Space, rather than standing up a second service. One deployment, one URL, one thing to debug. If this were a multi-person team project with independent scaling needs, splitting them would make sense — for this project, it doesn't.

```
rss_api/
├── app/
│   ├── main.py                 # existing — ML inference, UNCHANGED
│   ├── routers/
│   │   ├── auth.py             # NEW — register/login/JWT
│   │   ├── patients.py         # NEW — patient CRUD
│   │   ├── assessments.py      # NEW — create/list/detail, calls ML inference internally
│   │   └── reviewer.py         # NEW — dashboard, notes, mark-reviewed
│   ├── db.py                   # NEW — MongoDB (Motor async client) connection
│   ├── auth_utils.py           # NEW — JWT create/verify, password hashing
│   └── models_schema.py        # NEW — Pydantic request/response models for the new routes
├── requirements.txt            # + motor, pymongo, python-jose, passlib[bcrypt], python-multipart (already have)
└── Dockerfile                  # unchanged
```

`main.py` mounts them:
```python
from app.routers import auth, patients, assessments, reviewer
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(patients.router, prefix="/patients", tags=["Patients"])
app.include_router(assessments.router, prefix="/assessments", tags=["Assessments"])
app.include_router(reviewer.router, prefix="/reviewer", tags=["Reviewer"])
```

Your ML endpoints stay exactly as they are — `assessments.py` calls `run_fusion()`, `run_image_model()` etc. as **internal Python function calls**, not HTTP requests, since they're in the same process. No network hop, no extra latency.

### 1.3 MongoDB Atlas setup (free tier)

1. Create a free account at mongodb.com/cloud/atlas
2. Create an **M0 cluster** (512MB, free forever, sufficient for a coursework prototype)
3. Database Access → create a user with a strong password
4. Network Access → allow access from anywhere (`0.0.0.0/0`) for simplicity, since HF Spaces doesn't have a fixed IP — tighten later if this goes beyond coursework
5. Get your connection string: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/clinical_rss`
6. Add it as an **HF Space secret** (Settings → Repository secrets → `MONGODB_URI`), never hardcode it

---

## 2. MongoDB Database Schema

Four collections, matching the ER concept from your Contextual Report (Figure 5/6) with `patient_records` → here named `assessments`, which is the central entity.

### 2.1 `users`
One document per healthcare staff or reviewer account.

```json
{
  "_id": ObjectId,
  "full_name": "Nurse Amara Silva",
  "email": "amara@clinic.lk",
  "password_hash": "$2b$12$...",           // bcrypt, never plaintext
  "role": "staff",                          // "staff" | "reviewer"
  "facility_name": "Negombo Base Hospital",
  "consent_accepted_at": ISODate,           // set on first-use consent screen
  "created_at": ISODate,
  "last_login_at": ISODate
}
```
**Indexes:** unique index on `email`.

### 2.2 `patients`
Minimal identity record — kept separate from assessments so one patient can have multiple assessments over time.

```json
{
  "_id": ObjectId,
  "patient_ref": "PT-2026-0042",            // human-readable ID, auto-generated
  "full_name": "K. Perera",
  "age": 54,
  "sex": "M",                               // "M" | "F" | "Other"
  "phone": "+94771234567",                  // optional
  "created_by": ObjectId,                   // ref -> users._id
  "created_at": ISODate
}
```
**Indexes:** index on `patient_ref` (unique), index on `created_by`.

### 2.3 `assessments`  — the central collection
One document per submitted assessment. Nests the full input + full model output together — this is the natural advantage of a document DB over relational tables for this data shape.

```json
{
  "_id": ObjectId,
  "assessment_ref": "AS-2026-000173",
  "patient_id": ObjectId,                   // ref -> patients._id
  "created_by": ObjectId,                   // ref -> users._id (staff who submitted)
  "status": "pending_review",               // "pending_review" | "reviewed"
  "created_at": ISODate,

  "input": {
    "symptoms_text": "Severe difficulty breathing, confusion...",
    "image_url": "https://.../uploads/AS-2026-000173.jpg",   // see 3.4 for storage
    "vitals": {
      "HR": 128, "O2Sat": 87, "Temp": 39.6, "SBP": 82,
      "DBP": 52, "MAP": 62, "Resp": 30, "Age": 67
    }
  },

  "result": {
    "overall_risk": "High",
    "confidence_pct": 71.3,
    "risk_probabilities": {"Low": 8.1, "Medium": 20.6, "High": 71.3},
    "triage_tier": "IMMEDIATE",
    "fusion_method": "Stacked MLP",
    "per_modality": {
      "image":  {"risk": "High", "finding": "Possible malignant lesion...", "confidence_pct": 62.4},
      "text":   {"risk": "High", "match": "pneumonia", "confidence_pct": 81.0},
      "vitals": {"risk": "High", "flags": 5, "flagged_vitals": [ /* ...from API... */ ]}
    },
    "differential_summary": {
      "image_finding": "Possible malignant lesion (melanoma / basal cell carcinoma / actinic keratosis)",
      "symptom_match": "pneumonia",
      "vitals_pattern": "5 flagged vital(s) — Heart Rate, SpO2, Temperature, Resp Rate, Systolic BP",
      "consistency_note": "..."
    },
    "gradcam_overlay_url": "https://.../gradcam/AS-2026-000173.png"   // optional, if requested
  },

  "review": {                               // null until a reviewer acts
    "reviewed_by": ObjectId,                // ref -> users._id
    "reviewed_at": ISODate,
    "clinical_notes": "Consistent with community-acquired pneumonia, admit for observation.",
    "reviewer_risk_override": null          // reviewer can optionally override Low/Medium/High
  },

  "report_pdf_url": "https://.../reports/AS-2026-000173.pdf"   // set once generated
}
```
**Indexes:** `created_by`, `patient_id`, `status`, compound `{status: 1, created_at: -1}` for the reviewer dashboard's default sort/filter.

### 2.4 Why no separate `reviewer_notes` collection
Your Scope's reviewer features ("add clinical notes," "mark case as reviewed") are 1:1 with a single assessment — there's no case where one assessment has multiple independent review threads in v1. Embedding `review` inside `assessments` avoids an unnecessary join/lookup and matches your ER diagram's "Patient Record [is] the main entity which links users, clinical information and predicted risk."

### 2.5 Storing images and PDFs — not in MongoDB itself
MongoDB documents have a 16MB limit and aren't designed for binary blobs. Store the actual JPEG/PNG and generated PDF files in object storage, and keep only the **URL** in MongoDB (as shown above). Simplest free option for a coursework project: **Cloudinary free tier** (25GB storage, direct upload from the app or backend, returns a URL instantly) or **Supabase Storage free tier** used purely as a file bucket (not a database) — either is fine since only file URLs touch Mongo, not Supabase-as-database.

---

## 3. New Backend API Endpoints

All routes below require a valid JWT (`Authorization: Bearer <token>`) except `/auth/register` and `/auth/login`. Role column shows who's allowed to call it.

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create staff or reviewer account |
| POST | `/auth/login` | Public | Returns JWT + user profile |
| GET | `/auth/me` | Any | Current user's profile |
| POST | `/auth/consent` | Any | Records consent acceptance timestamp |
| POST | `/patients` | Staff | Create a new patient record |
| GET | `/patients/{id}` | Staff/Reviewer | Fetch one patient + their assessment list |
| GET | `/patients?search=` | Staff | Search patients by name/ref, for the "new assessment" flow |
| POST | `/assessments` | Staff | Submit new assessment — internally calls ML models, stores result, generates PDF |
| GET | `/assessments/mine` | Staff | List assessments created by the logged-in staff user |
| GET | `/assessments/{id}` | Staff/Reviewer | Full assessment detail |
| GET | `/assessments/{id}/report` | Staff/Reviewer | Signed URL / redirect to the PDF report |
| GET | `/reviewer/dashboard` | Reviewer | All assessments, filterable by `status`, `overall_risk`, date range |
| POST | `/reviewer/assessments/{id}/review` | Reviewer | Add clinical notes, set `reviewed_by/at`, flip status to `reviewed` |

`POST /assessments` request body:
```json
{
  "patient_id": "665f...",
  "symptoms_text": "...",
  "vitals": { "HR": 128, "O2Sat": 87, "...": "..." },
  "image_base64": "..."          // or multipart file, same as your existing /predict-fusion
}
```
Internally this handler: (1) calls `run_image_model`, `run_text_model`, `run_vitals_model`, `run_fusion` — the exact same functions already in `main.py` — (2) builds the `differential_summary` via your existing `build_differential_summary()`, (3) uploads the image to Cloudinary and stores the URL, (4) generates the PDF (Section 3.4 below), (5) inserts the `assessments` document, (6) returns it to the app.

### 3.1 PDF Report Generation
Use `reportlab` or `weasyprint` (Python, runs fine in the same Docker container) to render the clinical report — same fields as your `generate_clinical_report()` output, formatted as: header (patient ref, date, facility), risk summary block, per-modality breakdown, differential summary, the standing disclaimer text, and a reviewer sign-off section left blank until reviewed. Store to Cloudinary, save the URL on the assessment document (matches Scope §3.2: *"A structured clinical report in PDF format (patient info, input summary, risk level, recommendation, disclaimer)."*)

---

## 4. React Native (Expo SDK 56) Project Structure

Using **Expo Router** (file-based routing, the current standard for SDK 56) with role-based route groups.

```
clinical-rss-app/
├── app/
│   ├── _layout.tsx                    # Root layout — loads fonts, auth check, splash
│   ├── index.tsx                      # Splash / redirect logic
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── consent.tsx
│   ├── (staff)/
│   │   ├── _layout.tsx                # Tab navigator: Home, New, History, Profile
│   │   ├── home.tsx
│   │   ├── new-assessment/
│   │   │   ├── _layout.tsx            # Stack — enforces step order
│   │   │   ├── patient-info.tsx       # Step 1
│   │   │   ├── symptoms.tsx           # Step 1b
│   │   │   ├── image-capture.tsx      # Step 2
│   │   │   ├── vitals.tsx             # Step 3
│   │   │   ├── review-submit.tsx      # Step 4
│   │   │   ├── analyzing.tsx          # Loading screen
│   │   │   └── result.tsx             # Final result + differential summary
│   │   ├── history/
│   │   │   ├── index.tsx              # List
│   │   │   └── [id].tsx               # Detail (past assessment, read-only)
│   │   └── profile.tsx
│   ├── (reviewer)/
│   │   ├── _layout.tsx                # Tab navigator: Dashboard, Profile
│   │   ├── dashboard.tsx
│   │   ├── case/
│   │   │   └── [id].tsx               # Case detail + notes + mark reviewed
│   │   └── profile.tsx
│   └── +not-found.tsx
├── components/
│   ├── ui/                            # Buttons, Cards, Inputs, Badge (risk-colored), etc.
│   │   ├── RiskBadge.tsx
│   │   ├── Button.tsx
│   │   ├── TextField.tsx
│   │   ├── VitalsInputGrid.tsx
│   │   ├── ProgressSteps.tsx          # step indicator for new-assessment flow
│   │   └── LoadingSpinnerMedical.tsx
│   ├── charts/
│   │   └── RiskProbabilityBar.tsx     # Low/Medium/High % stacked bar
│   └── layout/
│       ├── ScreenContainer.tsx
│       └── SectionHeader.tsx
├── services/
│   ├── api.ts                         # Axios instance, base URL, interceptors (attach JWT)
│   ├── authApi.ts                     # login/register/me
│   ├── patientsApi.ts
│   ├── assessmentsApi.ts
│   └── reviewerApi.ts
├── store/
│   ├── authStore.ts                   # Zustand — user, token, role
│   └── assessmentDraftStore.ts        # Zustand — in-progress multi-step form state
├── hooks/
│   ├── useAuth.ts
│   ├── useAssessments.ts              # TanStack Query wrappers
│   └── useReviewerDashboard.ts
├── types/
│   ├── user.ts
│   ├── patient.ts
│   └── assessment.ts                  # mirrors the MongoDB schema in Section 2
├── constants/
│   ├── theme.ts                       # colors, spacing, typography (Section 5)
│   └── config.ts                      # API_BASE_URL, etc.
├── assets/
│   ├── fonts/
│   └── images/
├── app.json
├── package.json
└── tsconfig.json
```

**Key libraries:**
- `expo-router` — navigation
- `zustand` — lightweight global state (auth session, draft form)
- `@tanstack/react-query` — server state, caching, loading/error states for every API call
- `axios` — HTTP client
- `expo-secure-store` — JWT storage (never AsyncStorage for tokens)
- `expo-image-picker` + `expo-camera` — image capture/upload step
- `react-hook-form` + `zod` — form state + validation across every input screen
- `react-native-svg` + a small chart lib (or hand-rolled bars) — risk probability visualization
- `expo-print` or a WebView pointed at the backend's PDF URL — viewing/sharing the report in-app

---

## 5. Design System — "Premium, Modern, Clinical"

A healthcare tool earns trust through restraint, not decoration. Avoid generic bright "consumer app" gradients; use a calm, precise, high-contrast palette that reads as clinical software, not a wellness app.

**Color palette**
| Token | Hex | Use |
|---|---|---|
| `primary` | `#0F4C5C` (deep teal-navy) | Headers, primary buttons, active states |
| `primary-light` | `#1D7A8C` | Secondary accents, links |
| `background` | `#F7F9FA` | Screen background |
| `surface` | `#FFFFFF` | Cards, inputs |
| `text-primary` | `#1A2B32` | Body text |
| `text-secondary` | `#5C7079` | Labels, helper text |
| `risk-low` | `#2E9E5B` | Low risk badge/chart segment |
| `risk-medium` | `#E0A100` | Medium risk badge/chart segment |
| `risk-high` | `#D14343` | High risk badge/chart segment |
| `border` | `#E3E9EB` | Dividers, input borders |

**Typography:** `Inter` (variable font, excellent legibility at small sizes on clinical data) — weight 600/700 for headers, 400/500 for body. Numeric vitals use tabular figures (`fontVariant: ['tabular-nums']`) so columns of numbers align.

**Spacing scale:** 4/8/12/16/24/32/48 (px) — consistent throughout, no arbitrary values.

**Component principles:**
- Risk badges are the one place color carries real semantic weight — Low/Medium/High always render in the same three colors everywhere in the app (list rows, detail headers, charts), so a reviewer scanning the dashboard can triage by color alone.
- Cards use a subtle 1px border (`border` token) rather than heavy drop shadows — flatter, more clinical, less "consumer social app."
- All interactive targets ≥ 44×44pt (accessibility, and gloved-hand usability in a clinical setting).
- Every screen that calls the API has three explicit states built into the component from the start: loading (skeleton, not spinner-only), error (retry button, not silent failure), and empty (e.g. "No assessments yet").

---

## 6. Screen-by-Screen Specification

Each entry: **Route** · **Role** · **Purpose** · **Fields/Elements** · **API calls** · **Navigation**.

### 6.1 Auth & Onboarding

**Splash — `app/index.tsx`**
Checks `expo-secure-store` for a saved JWT. If valid → decode role → redirect to `(staff)/home` or `(reviewer)/dashboard`. If none/expired → redirect to `(auth)/login`. No UI beyond a centered logo — this should resolve in under a second.

**Login — `(auth)/login.tsx`**
Fields: email, password. Validation: valid email format, password non-empty. Calls `POST /auth/login`. On success: store JWT in SecureStore, store user in `authStore`, check `consent_accepted_at` — if null, route to `consent.tsx` first; else route by role. Link to Register and Forgot Password.

**Register — `(auth)/register.tsx`**
Fields: full name, email, password, confirm password, role (segmented control: "Healthcare Staff" / "Reviewer"), facility name. Validation: email format, password ≥ 8 chars with `zod`, passwords match. Calls `POST /auth/register` → auto-login → routes to `consent.tsx`.

**Forgot Password — `(auth)/forgot-password.tsx`**
Field: email. For v1 scope, this can be a simple "reset link sent" stub (email delivery is infrastructure beyond coursework scope) — note this explicitly as a known v1 limitation rather than half-implementing it.

**Consent & Disclaimer — `(auth)/consent.tsx`**
Required first-use screen per Scope §4/§5.1. Displays: what data is collected (symptoms, images, vitals), how it's used (AI-assisted risk screening, not diagnosis), the same clinical disclaimer text your API already returns, and data storage notice (MongoDB, this facility). A single "I Understand and Consent" button, disabled until the user scrolls to the bottom (`onScrollEndDrag` check) — this isn't decorative, it's a genuine consent-capture pattern for a healthcare tool. Calls `POST /auth/consent`. Cannot be skipped or dismissed without accepting.

### 6.2 Healthcare Staff Flow

**Staff Home — `(staff)/home.tsx`**
Dashboard summary: greeting with user's name, quick stats (assessments this week, pending reviews on their submissions), a prominent "New Assessment" CTA button, and a short list of the 3 most recent assessments with risk badges. Calls `GET /assessments/mine?limit=3`.

**New Assessment — Step 1: Patient Info — `new-assessment/patient-info.tsx`**
Search-or-create pattern: search field (calls `GET /patients?search=`) showing matching existing patients, or a "+ New Patient" form (name, age, sex, phone). Selecting/creating a patient stores `patient_id` in `assessmentDraftStore` and advances.

**Step 1b: Symptoms — `new-assessment/symptoms.tsx`**
Large multiline text field for free-text symptom description (matches your `/predict-text` input). Character counter, placeholder examples. Stored in draft store on "Next."

**Step 2: Image Capture — `new-assessment/image-capture.tsx`**
Two options: "Take Photo" (`expo-camera`) or "Choose from Gallery" (`expo-image-picker`). Preview thumbnail with retake option. This step is **skippable** ("Continue without image") since your API already supports partial-modality fusion — reflect that explicitly in the UI with a visible "Skip" link, not a forced requirement.

**Step 3: Vitals — `new-assessment/vitals.tsx`**
Numeric input grid (`VitalsInputGrid` component) for HR, O2Sat, Temp, SBP, DBP, Resp — the core fields from your Phase 3 model, with the rest (MAP, Age, etc.) available under an expandable "Advanced" section. Each field shows the clinical normal range as helper text (e.g. "HR: 60–100 bpm") so staff immediately notice an out-of-range entry.

**Step 4: Review & Submit — `new-assessment/review-submit.tsx`**
Read-only summary of everything entered across steps 1–3 with per-section "Edit" links (jumps back). Final "Submit for Analysis" button. Calls `POST /assessments`.

**Analyzing — `new-assessment/analyzing.tsx`**
Loading screen shown while the backend call is in flight (typically a few seconds — image model + text model + vitals model + fusion, sequentially, on CPU). Animated but calm (not a spinner racing) — a short progressive checklist works well: "Analyzing image... Analyzing symptoms... Analyzing vitals... Combining results..." even if it's just timed/simulated progress rather than genuine real-time per-step callbacks, since the backend currently returns one combined response.

**Result — `new-assessment/result.tsx`**
The most important screen in the app. Large risk badge (Low/Medium/High) with the triage tier and escalation text at top. `RiskProbabilityBar` showing the 3-way percentage split. Three collapsible sections — Image Finding, Symptom Match, Vitals Flags — each showing that modality's own risk + confidence, matching your `per_modality` API field exactly. A dedicated **Differential Summary** card (your new `differential_summary` field) with its `consistency_note` displayed prominently since that's often the most clinically useful sentence. Grad-CAM overlay image shown if available. Standing disclaimer text pinned at the bottom, always visible, never collapsible. Two actions: "Generate PDF Report" and "Done" (returns to Home).

**History — `(staff)/history/index.tsx`**
List of the staff user's own past assessments, each row: patient name, date, risk badge, review status ("Pending Review" / "Reviewed" tag). Search/filter by patient name or risk level. Calls `GET /assessments/mine`.

**History Detail — `(staff)/history/[id].tsx`**
Same layout as the Result screen, read-only, plus the reviewer's clinical notes section if `status === "reviewed"`.

**Profile — `(staff)/profile.tsx`**
Name, email, facility (editable), logout button, app version, link to view the consent text again.

### 6.3 Reviewer Flow

**Reviewer Dashboard — `(reviewer)/dashboard.tsx`**
List of **all** submitted assessments across all staff, not just the reviewer's own. Filter chips: All / Pending Review / Reviewed, and by risk level. Each row: patient ref, submitting staff name, date, risk badge, status. Sorted pending-first, most-recent-first by default (matches the compound index in 2.3). Calls `GET /reviewer/dashboard`.

**Case Detail — `(reviewer)/case/[id].tsx`**
Full assessment detail (same rich layout as Staff Result screen) plus a **Clinical Notes** text field and a "Mark as Reviewed" button. Optional reviewer risk override control (dropdown, defaults to the AI's `overall_risk`, only used if the reviewer clinically disagrees — this is explicitly logged as a *reviewer override*, never silently replacing the AI output, preserving an audit trail). Calls `POST /reviewer/assessments/{id}/review` on submit.

**Export Report** — same PDF flow as staff, accessible from Case Detail once reviewed — the exported PDF now includes the reviewer's sign-off section filled in.

**Reviewer Profile — `(reviewer)/profile.tsx`**
Same pattern as staff profile.

---

## 7. Navigation Map

```
Splash
  ├─▶ (no token) ──▶ Login ──▶ Register
  │                     │
  │                     ▼
  │                  Consent (if not yet accepted)
  │                     │
  └─▶ (has token) ──────┴──▶ role check
                              ├─ staff ────▶ Staff Tabs: Home | History | Profile
                              │                 Home ──▶ New Assessment (4-step wizard) ──▶ Analyzing ──▶ Result
                              │                 History ──▶ History Detail
                              └─ reviewer ─▶ Reviewer Tabs: Dashboard | Profile
                                                Dashboard ──▶ Case Detail ──▶ (mark reviewed) ──▶ back to Dashboard
```

---

## 8. Traceability — Scope Features → Screens

So this maps cleanly back to your approved Scope §5 for your report/viva:

| Scope §5 Feature | Screen(s) |
|---|---|
| Secure sign-in and registration | `login.tsx`, `register.tsx` |
| Consent and disclaimer screen | `consent.tsx` |
| Personal profile management | `profile.tsx` (both roles) |
| New assessment workflow (symptom → image → vitals → review) | `new-assessment/*` (5 screens) |
| AI analysis loading screen | `analyzing.tsx` |
| Result screen with risk + explainability | `result.tsx` |
| Generate clinical report (PDF) | Result screen action + `POST /assessments/{id}/report` |
| Assessment history and saved reports | `history/index.tsx`, `history/[id].tsx` |
| Reviewer dashboard listing all cases | `dashboard.tsx` |
| Case detail: AI prediction + modality scores | `case/[id].tsx` |
| Doctor notes and manual validation | `case/[id].tsx` (notes field) |
| Mark case as reviewed | `case/[id].tsx` (action) |
| Export finalised report | `case/[id].tsx` (action) |

Every feature in your approved scope has exactly one home in this spec — nothing invented beyond it, nothing missing from it.

---

## 9. What's Deliberately Not Here (matches Scope §5.3)

Appointment booking, pharmacy/prescriptions, live chat, payments, and full EHR integration are excluded, per your own confirmed out-of-scope list — don't let the "must be perfect" instinct pull any of these back in; adding them would work *against* your approved scope, not for it.
