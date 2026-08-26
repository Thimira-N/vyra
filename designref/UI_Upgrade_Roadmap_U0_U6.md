# Vyra — UI Upgrade Roadmap (U0–U6)

Companion to `UI_Upgrade_Design_System_Spec.md` (the single source of truth for tokens,
components, and the new Settings screen). This roadmap sequences the upgrade the same way
`Frontend_Roadmap_F0_F6.md` sequenced the original build: one phase at a time, in order, each
with an explicit file list and Definition of Done. **Do not skip ahead** — every later phase
assumes the theming foundation from U0 exists.

This is a restyle + one new screen. No screen is removed, no route changes, no API contracts
change, no backend work. Existing business logic (validation, API calls, state management) in
every touched file must be preserved exactly — only markup/styles/theme wiring changes, unless a
phase explicitly says otherwise (U0's `use-theme.ts` fix, U5's new Settings screen).

---

## U0 — Theming Foundation (do this first, nothing else works without it)

**Goal:** dual-mode token system + glass primitives exist and compile, with zero visual change
yet required on real screens (a single throwaway test screen is enough to prove it works).

**Files:**
- `src/constants/theme.ts` — rewrite per Spec §2–§4 (`LightColors`, `DarkColors`, `Spacing`,
  `Radius`, `Typography`, `Elevation`, `Glass`)
- `src/hooks/use-theme.ts` — rebuild as documented in Spec §6 (fixes the current `Colors[theme]`
  bug where `Colors` has no light/dark keys)
- New: `src/store/settingsStore.ts` (Zustand, mirrors `authStore` conventions already in the
  repo) — holds `themeMode: 'system'|'light'|'dark'`, `reduceMotion: boolean`,
  `glassIntensity: 'off'|'reduced'|'full'`, `notificationPrefs: {...}`, persisted via
  `expo-secure-store`
- New: `src/components/ThemeProvider.tsx` — React context wrapping `settingsStore` +
  `use-color-scheme`, exposes `useTheme()` returning `{ colors, isDark, mode, setMode }`
- `src/app/_layout.tsx` — wrap `<QueryClientProvider>` children in `<ThemeProvider>`; set
  `<StatusBar style={isDark ? 'light' : 'dark'}>` dynamically instead of the hardcoded `"light"`
- New dependency: `expo-blur` (add to `package.json`) for the Android/web glass fallback
- New: `src/components/ui/GlassCard.tsx`, `src/components/ui/GlassHeader.tsx`,
  `src/components/ui/Screen.tsx` per Spec §6.4

**Definition of Done:**
- [ ] App builds and runs on iOS simulator, Android emulator, and web with zero TypeScript errors
- [ ] A throwaway `/dev-theme-check` screen (delete before U6 closeout, or keep behind a dev flag)
      renders a `GlassCard`, a themed `Button`, and text at every `Typography` token, in both
      modes, on all three platforms, and matches Spec §2/§3/§4 visually
- [ ] Toggling OS dark/light mode while the app is open (not restarted) updates the throwaway
      screen live
- [ ] `settingsStore`'s persisted theme override survives an app restart
- [ ] No existing screen's visual output has changed yet (they still import `Colors` the old way
      and will until their own phase) — confirm the app still looks unchanged elsewhere

---

## U1 — Shared Component Restyle

**Goal:** every primitive in `src/components/ui/` speaks the new design language. Nothing in
`src/app/**` is touched yet — this phase only changes the components everything else is built
from, so later phases get the new look almost for free.

**Files:**
- `src/components/ui/Button.tsx`
- `src/components/ui/TextField.tsx`
- `src/components/ui/RiskBadge.tsx`
- `src/components/ui/ProgressSteps.tsx`
- `src/components/ui/ReportViewerButton.tsx`
- `src/components/ui/VitalsInputGrid.tsx`
- `src/components/charts/RiskProbabilityBar.tsx`
- `src/components/hint-row.tsx`, `src/components/themed-text.tsx`, `src/components/themed-view.tsx`

**Definition of Done:**
- [ ] Every file above imports `useTheme()` and contains zero references to the old flat `Colors`
      import
- [ ] Each component visually matches its Spec §7 restyle spec, verified in a Storybook-style
      throwaway screen (or the U0 dev-theme-check screen extended) in both Light and Dark
- [ ] `Button` press animation (120ms scale) and `TextField` focus animation (150ms label float)
      are implemented and feel like the "quiet motion" principle in Spec §1.4, not bouncy
- [ ] Run the Spec §8 QA checklist against the throwaway screen for every component

---

## U2 — Navigation Chrome (Tab Bars + Headers)

**Goal:** the floating glass tab bar and translucent headers from the reference screenshots,
app-wide.

**Files:**
- `src/app/(staff)/_layout.tsx`
- `src/app/(reviewer)/_layout.tsx`
- `src/app/(auth)/_layout.tsx` (header only, no tab bar)
- `src/app/_layout.tsx` (root `Stack` header defaults, pdf-viewer modal presentation styling)

**Definition of Done:**
- [ ] Tab bar is a floating `GlassCard`-style bar per Spec §7 (blur, rounded top corners, active
      icon fill + tint pill) on iOS AND the `expo-blur` fallback renders correctly on Android —
      test on a real/emulated Android device, not just iOS simulator
- [ ] Header uses `GlassHeader` on scrollable content screens; hero/gradient header retained only
      where Spec §7 calls for it
- [ ] Notification bell badge (`NotificationBell` in staff layout) still renders correctly over
      the new translucent header — re-check contrast of the badge itself
- [ ] Scrolling content behind the translucent header/tab bar looks correct (content visible
      through blur, no double-rendering or z-index glitches) on all three platforms

---

## U3 — Auth Screens

**Goal:** first-impression screens (login, register, forgot-password, consent) get the full
"Clinical Glass" treatment — gradient mesh background, hero typography, glass form card.

**Files:**
- `src/app/(auth)/login.tsx`
- `src/app/(auth)/register.tsx`
- `src/app/(auth)/forgot-password.tsx`
- `src/app/(auth)/consent.tsx`

**Definition of Done:**
- [ ] All four screens use `Screen.tsx` for the gradient mesh + blob background
- [ ] Form fields sit in a `GlassCard` (elevated tint, per Spec §2.3), not floating directly on
      the gradient
- [ ] `consent.tsx`'s scroll-gate mechanics (noted in project memory as a prior integration
      point) are functionally unchanged — scroll-to-bottom gating still works, only the visual
      chrome changed. Test this explicitly, it's the easiest thing to silently break here.
- [ ] Both modes pass Spec §8 checklist; specifically check hero headline legibility over the
      background blobs in Dark mode, the most likely failure point

---

## U4 — Staff Screens

**Goal:** the highest-traffic role's full flow — home, the 7-step new-assessment wizard, history,
notifications — restyled without touching any wizard state logic.

**Files:**
- `src/app/(staff)/home.tsx`
- `src/app/(staff)/notifications.tsx`
- `src/app/(staff)/history/index.tsx`
- `src/app/(staff)/history/[id].tsx`
- `src/app/(staff)/new-assessment/image-capture.tsx`
- `src/app/(staff)/new-assessment/vitals.tsx`
- `src/app/(staff)/new-assessment/symptoms.tsx`
- `src/app/(staff)/new-assessment/patient-info.tsx`
- `src/app/(staff)/new-assessment/review-submit.tsx`
- `src/app/(staff)/new-assessment/analyzing.tsx`
- `src/app/(staff)/new-assessment/result.tsx`

**Definition of Done:**
- [ ] Every screen above uses `useTheme()` / `Screen.tsx` / `GlassCard`, zero old `Colors` imports
- [ ] `result.tsx` (renders risk score + probabilities) gets special attention: `numericLg` token
      for the score, `RiskProbabilityBar` and `RiskBadge` from U1 wired in correctly, verify the
      three risk colors are still instantly distinguishable at a glance in both modes
- [ ] Wizard step state (`ProgressSteps`, draft persistence via `assessmentDraftStore`) is
      unchanged — walk through the full 7-step flow end to end on a real device after restyling,
      not just visually inspect each screen in isolation
- [ ] `analyzing.tsx`'s loading state gets a calm, non-bouncy loading animation consistent with
      Spec §1.4 (replace any spinner with something on-brand if one doesn't already fit)
- [ ] Spec §8 checklist passes on all 11 screens, both modes

---

## U5 — Reviewer Screens + New Settings Screen

**Goal:** finish the reviewer role, then add the net-new Settings screen from Spec §9 for both
roles.

**Files:**
- `src/app/(reviewer)/dashboard.tsx`
- `src/app/(reviewer)/case/[id].tsx`
- `src/app/(reviewer)/profile.tsx`, `src/app/(staff)/profile.tsx`
- `src/components/ui/ProfileView.tsx` (trim to identity + logout per Spec §9 intro; move the
  moved rows out)
- New: `src/components/ui/SettingsView.tsx`
- New: `src/app/(staff)/settings.tsx`, `src/app/(reviewer)/settings.tsx`
- `src/store/notificationStore.ts` — extend if needed to back the per-category toggles in
  Settings §9.1 "Notifications" (client-side prefs only, per Spec §9.1's explicit note — do not
  invent a backend endpoint)

**Definition of Done:**
- [ ] Reviewer dashboard and case detail restyled, both modes pass Spec §8
- [ ] Settings screen implements every section in Spec §9.1; any row that has no backing backend
      capability today is clearly marked as such in the UI copy (e.g. "Coming soon") rather than
      wired to a fake action — list which rows fall into this category in the phase closeout
- [ ] Theme segmented control in Settings actually drives `useTheme().setMode` live (this is the
      first real, non-throwaway consumer of U0's theming system — the true end-to-end test of U0)
- [ ] Reduce Motion and Glass Intensity toggles actually change app behavior globally, not just
      store a value nobody reads — wire them into `ThemeProvider`/`GlassCard` from U0
- [ ] Log Out from both Profile and Settings (wherever it ends up per Spec §9.1) still correctly
      calls `clearAuth()` and redirects to login — this touches existing auth logic, re-verify it

---

## U6 — Polish, Accessibility, and Final QA Pass

**Goal:** whole-app consistency pass. No new screens, no new components — just catching what
individual phases missed once everything is assembled.

**Files:** none pre-specified — this phase's job IS to find and fix inconsistencies, so the file
list is whatever the audit below turns up. Flag every file touched in the closeout report.

**Tasks / Definition of Done:**
- [ ] Delete the U0 throwaway dev-theme-check screen (or confirm it's behind a dev-only flag and
      excluded from release builds)
- [ ] Grep the entire `src/` tree for any remaining direct `Colors.` usage (the old flat import)
      — there should be zero outside `theme.ts` itself
- [ ] Grep for hardcoded hex colors (`#[0-9a-fA-F]{3,6}`) outside `theme.ts` — flag and fix any
      found
- [ ] Full click-through of both roles' entire flow on a real iOS device, a real/emulated Android
      device, and web — in both Light and Dark — using the Spec §8 checklist screen by screen
- [ ] Confirm `Reduce Motion` setting actually removes/shortens every entrance animation added
      across U1–U5, not just the ones in Settings itself
- [ ] Confirm `Glass Intensity: Off` correctly swaps every `GlassCard` instance app-wide to a
      flat opaque card with no blur cost
- [ ] Run a basic performance sanity check on the lowest-spec Android target device/emulator you
      have — blur is the most expensive part of this upgrade; if frame drops are visible on
      scroll, note it in the closeout even if not fixed in this phase
- [ ] Update `README.md` / `AGENTS.md` if either references the old flat color system
