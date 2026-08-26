# Vyra — UI Upgrade Design System Spec (Glassmorphism, Light + Dark)

Status: supersedes the visual-design portions of `Clinical_RSS_Frontend_Architecture_Spec.md` §5
("Premium, Modern, Clinical" palette). Screen inventory, routes, API contracts, and state
management in the original Architecture Spec are UNCHANGED — this document only replaces the
**design system and component skin**, and adds ONE new screen (Settings).

Direction: **"Clinical Glass"** — a premium, minimal, glassmorphic evolution of the existing
teal-navy clinical identity. Frosted translucent surfaces floating over soft gradient
backgrounds, restrained motion, generous whitespace, high-contrast typography. This must read
as a serious clinical tool that happens to be beautiful — not a wellness/consumer app. No
saturated candy colors, no heavy neumorphism, no drop-shadow-heavy skeuomorphism.

The app already depends on `expo-glass-effect` (Liquid Glass on iOS 26+) — use it as the
primary glass primitive on iOS, with an `expo-blur` `BlurView` fallback for Android/web so the
effect is never missing on any platform. See §7.

---

## 1. Design Principles (apply to every screen)

1. **Depth through translucency, not shadow.** Cards/sheets/tab bars are frosted glass panels
   sitting above a background layer (gradient mesh + subtle blurred color blobs), not flat white
   rectangles with drop shadows. Shadows are still used, but softer and rarer (§4.6).
2. **One accent, disciplined use.** The teal-navy brand color (`primary`) is the only saturated
   hue used for interactive/brand moments (primary buttons, active tab, selection states, focus
   rings, chart accents). Risk semantic colors (Low/Medium/High) are the only other saturated
   colors on screen, and only appear on risk data itself.
3. **Legible glass.** Never place body text directly on unblurred imagery or on a glass panel
   with insufficient contrast. Every glass surface has a text-contrast-safe tint layer under it
   (§3.3). Run every screen through the contrast checklist in §8 in BOTH modes before calling it
   done.
4. **Motion is quiet.** 150–250ms ease-out for entrances, 100–150ms for presses. No bouncy
   spring on data screens (clinical = calm). Reserve spring/scale feedback for confirmatory
   micro-interactions (toggle switches, success checkmarks) only.
5. **Same information density as today.** This is a skin + component upgrade, not a redesign of
   what data appears where. Don't remove fields, steps, or states while restyling.

---

## 2. Color Tokens — Light + Dark

Replace the flat `Colors` object in `src/constants/theme.ts` with a light/dark token pair. Keep
the same **semantic names** used across the codebase (`primary`, `background`, `surface`,
`textPrimary`, `textSecondary`, `border`, `riskLow/Medium/High`) so existing screens keep
compiling while they're migrated phase by phase — just resolve them through `useTheme()` instead
of importing `Colors` directly (§6).

### 2.1 Brand / semantic

| Token | Light | Dark | Usage |
|---|---|---|---|
| `primary` | `#0F4C5C` | `#4FD1E0` | Primary buttons, active tab, links, focus ring, chart accent |
| `primaryLight` | `#1D7A8C` | `#7FE3EE` | Secondary accents, pressed states |
| `primaryGradientStart` | `#0F4C5C` | `#123B47` | Hero/header gradient start |
| `primaryGradientEnd` | `#1D7A8C` | `#1D5A66` | Hero/header gradient end |
| `riskLow` | `#2E9E5B` | `#3FBE73` | Low risk |
| `riskMedium` | `#E0A100` | `#F0B429` | Medium risk |
| `riskHigh` | `#D14343` | `#EF5A5A` | High risk |
| `danger` | `#D14343` | `#EF5A5A` | Destructive actions (alias of riskHigh) |
| `success` | `#2E9E5B` | `#3FBE73` | Success toasts/checks (alias of riskLow) |

### 2.2 Backgrounds

| Token | Light | Dark |
|---|---|---|
| `background` | `#F4F7F9` | `#0B1418` |
| `backgroundGradientStart` | `#EAF3F5` | `#0B1418` |
| `backgroundGradientEnd` | `#F7F9FA` | `#101E24` |
| `blobAccent1` (blurred decorative shape) | `#0F4C5C` @ 10% opacity | `#4FD1E0` @ 8% opacity |
| `blobAccent2` (blurred decorative shape) | `#1D7A8C` @ 8% opacity | `#1D7A8C` @ 10% opacity |

### 2.3 Glass surfaces

Glass is a **layered token**, not a single color — every glass component composites: a tint
color, a blur amount, and a hairline border.

| Token | Light | Dark |
|---|---|---|
| `glassTint` (base fill under blur) | `rgba(255,255,255,0.55)` | `rgba(18,28,32,0.55)` |
| `glassTintElevated` (sheets/modals — more opaque, must read clearly over anything behind) | `rgba(255,255,255,0.78)` | `rgba(16,24,28,0.82)` |
| `glassBorder` (1px hairline) | `rgba(255,255,255,0.6)` | `rgba(255,255,255,0.08)` |
| `glassBorderStrong` (cards holding critical data, e.g. risk result) | `rgba(255,255,255,0.85)` | `rgba(255,255,255,0.14)` |
| `glassHighlight` (top inner-edge sheen, 1px, optional) | `rgba(255,255,255,0.9)` | `rgba(255,255,255,0.06)` |
| blur amount — standard card | 20 | 24 |
| blur amount — tab bar / sticky header | 30 | 36 |
| blur amount — modal / bottom sheet | 40 | 48 |

### 2.4 Surface (opaque, non-glass — form inputs, table rows, code blocks)

| Token | Light | Dark |
|---|---|---|
| `surface` | `#FFFFFF` | `#141F24` |
| `surfaceRaised` | `#FFFFFF` | `#1A272D` |
| `surfaceSunken` (input fields) | `#F0F4F5` | `#0F1A1E` |

### 2.5 Text

| Token | Light | Dark |
|---|---|---|
| `textPrimary` | `#132229` | `#EAF3F5` |
| `textSecondary` | `#5C7079` | `#8FA3AB` |
| `textTertiary` (placeholders, disabled) | `#8FA1A8` | `#5C7079` |
| `textOnPrimary` (text on solid brand fill) | `#FFFFFF` | `#0B1418` |
| `textOnGlass` — same as `textPrimary`; never introduce a separate lower-contrast "on glass" text color, that's how glass UIs become illegible |

### 2.6 Borders / dividers

| Token | Light | Dark |
|---|---|---|
| `border` | `#E3E9EB` | `#233238` |
| `borderStrong` | `#CBD7DA` | `#324349` |
| `divider` | `#E9EEEF` (1px) | `#1C2A2F` (1px) |

---

## 3. Elevation System (replaces `Shadows.card`)

Four elevation levels. Glass panels use blur + border as their primary depth cue; shadow is a
secondary, much softer cue than before.

| Level | Used for | Shadow (light) | Shadow (dark) |
|---|---|---|---|
| `flat` | inline rows, list items | none | none |
| `raised` | standard cards | `0 2px 12px rgba(15,76,92,0.08)` | `0 2px 16px rgba(0,0,0,0.45)` |
| `floating` | FAB, active input, hovered/pressed card | `0 8px 24px rgba(15,76,92,0.12)` | `0 8px 28px rgba(0,0,0,0.55)` |
| `overlay` | modals, bottom sheets, dropdown menus | `0 16px 48px rgba(15,76,92,0.18)` | `0 16px 56px rgba(0,0,0,0.65)` |

Corner radius scale (new — was implicit/inconsistent before): `sm:8` `md:14` `lg:20` `xl:28`
`pill:999`. Glass cards default to `lg` (20). Buttons default to `md` (14). Tab bar / bottom
sheets default to `xl` top corners only.

---

## 4. Typography

Keep Inter as the type family (already loaded via `@expo-google-fonts/inter`); this upgrade is
about scale/hierarchy and adding two weights, not swapping fonts.

- Add `Inter_800ExtraBold` for the new large numeric/hero moments (risk score, dashboard KPI
  numbers) — pull from the same `@expo-google-fonts/inter` package, no new dependency.
- New type scale (name → size/line-height/weight):

| Token | Size / Line | Weight | Usage |
|---|---|---|---|
| `display` | 34 / 40 | ExtraBold | Onboarding/auth hero headlines |
| `h1` | 26 / 32 | Bold | Screen titles |
| `h2` | 20 / 26 | SemiBold | Section headers, card titles |
| `h3` | 17 / 22 | SemiBold | Sub-section headers, list section headers |
| `bodyLg` | 16 / 24 | Regular | Primary reading text |
| `body` | 14 / 20 | Regular | Standard body/labels |
| `bodySm` | 13 / 18 | Regular | Secondary/help text |
| `caption` | 12 / 16 | Medium | Timestamps, meta, badges |
| `numericLg` | 40 / 44 | ExtraBold | Risk score, KPI numbers — use tabular figures |
| `button` | 15 / 20 | SemiBold | Button labels |

---

## 5. Iconography & Imagery

- Keep `@expo/vector-icons` (Ionicons) — swap the outline set consistently: **outline weight for
  inactive/secondary, filled/solid weight for active/selected state** (currently mixed
  inconsistently, e.g. tab bar uses `-outline` names always). This alone reads much more premium.
- Standardize icon sizes: `sm:16 md:20 lg:24 xl:32`.
- Doctor/reviewer avatars: circular, 1px `glassBorder` ring, soft `raised` shadow — matches
  reference screenshots' avatar treatment.
- Decorative background blobs (§2.2 `blobAccent1/2`): 2–3 large soft-edged blurred circles/ovals
  placed behind hero/header areas only (auth screens, dashboard header, result screen header) —
  never behind dense data tables/lists, where they'd hurt legibility.

---

## 6. Theming Architecture (implementation contract for Antigravity)

This is the concrete engineering shape the tokens above must take — Roadmap phase U0 implements
exactly this:

1. `src/constants/theme.ts` exports `LightColors` and `DarkColors` (each implementing a shared
   `ColorTokens` TypeScript type covering every token in §2–§3), plus `Spacing`, `Radius`,
   `Typography` (scale from §4), `Elevation` (shadow presets from §3), and `Glass` (blur amounts
   + tint tokens from §2.3).
2. `src/hooks/use-theme.ts` is rebuilt to:
   - Read device scheme via existing `use-color-scheme` hook AND a user override stored in
     `authStore`/a new lightweight `settingsStore` (System / Light / Dark — see §9 Settings spec).
   - Return `{ colors, isDark, mode, setMode }` from a `ThemeProvider` (new — wrap it around the
     existing `QueryClientProvider` in `src/app/_layout.tsx`), not a bare hook reading
     `Colors[theme]` (today's version is broken — `Colors` has no `light`/`dark` keys — this is a
     genuine bug fix, not just a restyle).
   - Persist the chosen mode with `expo-secure-store` (already a dependency) so it survives app
     restarts.
3. Every screen/component currently importing `Colors` directly from `@/constants/theme` must
   switch to `const { colors } = useTheme()` and reference `colors.primary` etc. This touches
   every file in `src/app/**` and `src/components/**` — tracked per-phase in the Roadmap so it
   doesn't happen as one giant unreviewable diff.
4. New shared primitive components (put in `src/components/ui/`):
   - `GlassCard.tsx` — wraps `expo-glass-effect`'s `GlassView` on iOS; falls back to
     `expo-blur`'s `BlurView` (add as a new dependency, it's the standard Expo blur primitive)
     + a semi-opaque tint `View` on Android/web, so the same `<GlassCard>` API works everywhere.
     Props: `elevation`, `radius`, `tint` (`'default' | 'elevated'`), `borderStrong?: boolean`.
   - `GlassHeader.tsx` — sticky translucent header/navbar variant, used to replace the current
     solid-color `headerStyle` in every `_layout.tsx`.
   - `Screen.tsx` — standard screen wrapper that renders the gradient mesh background
     (`backgroundGradientStart/End` + the two blurred `blobAccent` shapes) once, so individual
     screens don't hand-roll it.
5. Add `expo-linear-gradient` if not already resolvable transitively (check — `expo` SDK 57
   should include it) for the gradient backgrounds and hero headers.

---

## 7. Component Restyle Specs

For each existing primitive in `src/components/ui/`, the required new look:

- **`Button.tsx`** — `primary` variant: solid brand-gradient fill (`primaryGradientStart→End`),
  `md` radius, `button` type token, subtle `raised` shadow, 96%-scale press animation (120ms).
  `outline` variant: becomes a **glass** button — `GlassCard` background + `glassBorderStrong`,
  text in `primary`. `ghost`/text-only variant: unchanged structurally, just repointed to new
  color tokens. Disabled state: 40% opacity, no shadow.
- **`TextField.tsx`** — background `surfaceSunken` (opaque, NOT glass — inputs need to stay
  legible/stable while typing, no blur), `md` radius, 1.5px `border` default, `primary` border +
  soft glow (`0 0 0 4px primary@12%`) on focus. Label uses `caption` token, floats above on focus
  (small motion, 150ms).
- **`RiskBadge.tsx`** — pill (`radius: pill`) with tinted-glass background (`riskLow/Medium/High`
  @ 15% opacity + blur) rather than today's solid fill, text/icon in the full-saturation risk
  color. Keeps the same three-state color mapping.
- **`ProgressSteps.tsx`** — active step: filled `primary` circle + connecting line in `primary`;
  completed: `primary` outline + checkmark; upcoming: `border`-colored outline. No glass here —
  small UI, glass adds noise not depth.
- **`VitalsInputGrid.tsx`**, **`RiskProbabilityBar.tsx`** — repoint colors/spacing to new tokens
  only; layout logic unchanged.
- **Tab bar** (`(staff)/_layout.tsx`, `(reviewer)/_layout.tsx`) — replace solid
  `backgroundColor: Colors.surface` with `GlassCard`-style translucent bar (blur 30/36, per
  §2.3), floating with a small margin off the bottom safe area and rounded top corners (`xl`)
  rather than edge-to-edge square, per the reference screenshots. Active icon: filled variant +
  `primary` tint pill behind it. Inactive: outline variant, `textSecondary`.
- **Header** (`headerStyle` in every `_layout.tsx`) — replace solid `Colors.primary` fill with
  `GlassHeader` (translucent over the gradient mesh) on scrollable screens; keep a solid gradient
  hero header only on screens that intentionally want a strong color block (dashboard top,
  onboarding).
- **Cards throughout** (patient info summary, history rows, case detail, notifications) —
  migrate to `GlassCard` at `raised` elevation, `lg` radius, `glassBorder`.

---

## 8. Light/Dark QA Checklist (run per screen before marking a Roadmap phase item done)

For **both** Light and Dark, on the actual device/simulator (not just code review):

1. Every text token passes WCAG AA contrast (4.5:1 body, 3:1 large text) against whatever is
   directly behind it — including when it's sitting on a glass panel over the gradient mesh
   background, which is the case most likely to silently fail.
2. No hardcoded hex colors remain in the screen's `StyleSheet` — everything resolves through
   `useTheme().colors`.
3. Status bar style (`expo-status-bar`) matches the mode (`dark` content on light backgrounds,
   `light` content on dark).
4. Glass panels are still legible over BOTH the lightest and busiest parts of the background
   (e.g. directly over a `blobAccent` shape).
5. Risk semantic colors (`riskLow/Medium/High`) are colorblind-distinguishable by more than hue
   alone where they carry meaning on their own (icon/shape/label accompanies color, not color
   alone) — check `RiskBadge` and `RiskProbabilityBar` specifically.
6. Toggle the OS theme mid-session (not just app restart) and confirm the screen re-renders
   correctly with no stale colors — this is the most common glass/theme bug.

---

## 9. New Screen: Settings

Today `(staff)/profile.tsx` and `(reviewer)/profile.tsx` just render a bare `ProfileView`
(name/email/facility + Log Out + consent link). That stays as **Profile** (identity + logout,
kept minimal), and a new, separate **Settings** screen is added — this is the "real app" screen
the reference images show. Both roles get the same Settings screen; a couple of items are
role-conditional (marked below).

**Route:** `src/app/(staff)/settings.tsx` and `src/app/(reviewer)/settings.tsx` (thin wrappers,
same pattern as today's `profile.tsx` → shared `src/components/ui/SettingsView.tsx`).

**Entry point:** gear icon in the header next to the notification bell (staff) / in the reviewer
header — NOT a new tab (5 tabs is already the max for a clean bottom bar; Settings is reached
from Profile via a "Settings" row, or from the header gear icon — Roadmap phase decides which,
recommend: Profile screen gets a "Settings" list item at the top that pushes this screen).

### 9.1 Sections & rows

**Account**
- Full name, email, role, facility — read-only summary row (links back to existing Profile info,
  avoid duplicating editable state that doesn't exist in the backend yet)
- "Change Password" → existing `forgot-password` flow reused, or a stub row wired to it
- "View Consent Agreement" (move here from Profile, or keep in both — Roadmap decides)

**Appearance**
- **Theme**: segmented control — `System / Light / Dark` (wires directly to §6's `setMode`)
- **Reduce Motion**: toggle — when on, drop entrance animations to instant/opacity-only across
  the app (respect `AccessibilityInfo.isReduceMotionEnabled` as the default, but let the user
  override)
- **Glass Intensity**: toggle or 3-way (`Off / Reduced / Full`) — accessibility escape hatch for
  users who find blur effects visually uncomfortable or have lower-end Android devices where
  blur is expensive; "Off" swaps `GlassCard` to a flat opaque `surface` card app-wide

**Notifications**
- Master "Push Notifications" toggle (ties into existing `notificationService.ts` /
  `notificationStore.ts`)
- Sub-toggles, only enabled when master is on: "New case assigned" (reviewer), "Assessment
  reviewed / risk result ready" (staff), "System announcements"
- These are **local preference toggles** stored client-side to start (no backend notification-
  preferences endpoint exists yet per the current Architecture Spec) — Roadmap should flag this
  explicitly as client-only unless a backend phase adds a persistence endpoint

**Privacy & Data**
- "Download my data" / "Request data export" — stub row → shows an informational sheet if no
  backend endpoint exists yet (don't silently no-op a button in a clinical app)
- "Clear local cache" — clears TanStack Query cache + any local drafts
  (`assessmentDraftStore`), with a confirm dialog
- Link to Privacy Policy / Terms (external link, reuse `external-link.tsx` component)

**Security**
- "Biometric unlock" toggle (Face ID / fingerprint app-lock) — flag as a **future** row if
  `expo-local-authentication` isn't already a dependency (it isn't currently) rather than wiring
  a non-functional toggle
- "Active session" info (device, last login) — only if the backend already exposes this; else
  omit rather than fake it

**Support & About**
- "Help & FAQ", "Contact Support" (mailto: or external link)
- "App Version" (already computed via `expo-constants` in `ProfileView.tsx` — move here)
- "Report a Bug"

**Danger Zone** (visually distinct — `riskHigh`-tinted glass card, separated with extra spacing)
- "Log Out" (moved here from Profile, or duplicated in both — Roadmap decides)
- "Delete Account" — only if backend supports it; otherwise a "Contact support to delete your
  account" info row, never a dead-end confirm dialog that does nothing

### 9.2 Interaction/visual spec
- Grouped list rows in `GlassCard` sections per §7, section headers in `h3`/`caption` style,
  chevron-right on navigable rows, right-aligned `Switch`/segmented control on toggle rows.
- `Switch` component: track uses `border`→`primary` tint transition, thumb white with soft
  shadow — standard RN `Switch` re-themed via `trackColor`/`thumbColor` props, not a custom
  component, to keep native accessibility behavior (VoiceOver/TalkBack) intact.
- All toggles must give immediate visual feedback (state flips instantly) even if the underlying
  persistence write happens async — never block the UI on a store write.
