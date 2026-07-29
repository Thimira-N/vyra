# Antigravity Master Execution Prompt — Clinical RSS (Frontend)

Use this exact prompt at the start of every Antigravity session **inside the `clinic-app` repo**, one phase at a time.

## HOW TO USE THIS

1. Attach `Clinical_RSS_Frontend_Architecture_Spec.md` and `Frontend_Roadmap_F0_F6.md` (both in this repo's `designref/` folder) to the Antigravity workspace context.
2. Copy the prompt block below.
3. Replace `PHASE = ___` with the exact phase ID, in order: F0, F1, F2, F3, F4, F5, F6. Never skip ahead.
4. Paste, run, review the diff before accepting.
5. Paste the "Phase Closeout" block at the end to get a verifiable completion report before moving to the next phase.

---

## THE PROMPT

```
You are implementing ONE phase of a larger, already-fully-specified system. Two
documents are attached to this workspace and are the complete source of truth:

1. Clinical_RSS_Frontend_Architecture_Spec.md — defines every screen, every API
   endpoint, every database field, the exact folder structure, and the design
   system. Field names, route paths, and folder paths in that document are not
   suggestions — they are the literal names/paths to use in code.

2. Frontend_Roadmap_F0_F6.md — breaks the system into sequential
   phases with an explicit file list and Definition of Done checklist per phase.

CURRENT PHASE = ___   (e.g. "B1", "F2a")

HARD RULES — do not deviate from these under any circumstance:

1. Read both attached documents fully before writing any code. Locate the
   section in the Roadmap for CURRENT PHASE and the corresponding section(s)
   in the Spec that it references.

2. Only create or modify the files explicitly listed under CURRENT PHASE's
   "Files" section in the Roadmap. If completing the phase genuinely requires
   touching a file outside that list (e.g. mounting a new router in main.py),
   that's expected and fine — but do not modify, refactor, rename, or "clean
   up" any file or function that belongs to a DIFFERENT phase, even if it
   looks improvable. Previously completed phases are working and tested —
   treat them as frozen unless this phase's spec explicitly requires a change.

3. Do not invent endpoints, field names, folder paths, or screens that are not
   in the Spec. If something feels missing or ambiguous, stop and ask rather
   than guessing — a wrong guess here creates a mismatch between backend and
   frontend that won't surface until integration.

4. Write complete, functioning implementations — not stubs, not "// TODO:
   implement later" placeholders, not mocked API responses standing in for
   real calls. If CURRENT PHASE is a backend phase, routes must actually read
   from and write to MongoDB. If CURRENT PHASE is a frontend phase, screens
   must actually call the real deployed backend, not local dummy data.

5. Every screen or endpoint that touches the network must handle three states
   explicitly: loading, error (with a retry affordance), and empty — per
   Spec §5's "three explicit states" rule. This is not optional polish, it's
   part of the Definition of Done for every phase that touches the API.

6. Match exact field names between MongoDB schema (Spec §2), Pydantic models,
   and any frontend TypeScript types generated in this or a later phase.
   A field renamed even slightly (e.g. "riskProbabilities" vs
   "risk_probabilities") will silently break the connection between layers.

7. The existing ML inference code in main.py (run_image_model, run_text_model,
   run_vitals_model, run_fusion, build_differential_summary, and all existing
   /predict-* endpoints) is COMPLETE and WORKING. Never modify it. Backend
   phases call these as direct Python function calls within the same process
   — never as HTTP requests to itself.

8. Before declaring the phase complete, go through CURRENT PHASE's Definition
   of Done checklist from the Roadmap item by item. For each item, state
   explicitly how it was verified (e.g. "tested via /docs with a real image
   upload", "confirmed MongoDB document shape via Atlas console"). If you
   cannot verify an item, say so explicitly rather than marking it done.

9. Do not start any other phase's files, even opportunistically, even if it
   would be "efficient" to do while you're in a related file. Stop cleanly
   at the end of CURRENT PHASE's scope.

Now: read both attached documents, confirm your understanding of CURRENT
PHASE's scope and Definition of Done in your own words back to me BEFORE
writing any code, then proceed to implement it.
```

---


---

## PHASE CLOSEOUT (paste after the agent finishes)

```
Go through CURRENT PHASE's Definition of Done checklist from the Roadmap
line by line. For each item, output:

  [DONE / NOT DONE] — <checklist item> — <how it was verified>

Then list every file you created or modified in this phase, and confirm
explicitly: "No files outside this phase's listed scope were changed,"
or list any exception and justify it against Rule 2.

If any checklist item is NOT DONE, do not mark the phase complete — continue
working on it in this same session rather than leaving it partially done for
a future phase to inherit.
```

---


---

## NOTES FOR RUNNING THIS ON A BUDGET (Frontend)

- F0 (scaffold) is mostly mechanical file/folder creation — fine for Gemini 3.1 Pro High.
- Reserve Opus 4.6 Thinking for **F2** specifically (the new-assessment wizard) — it's the most cross-cutting screen (7 sub-screens, draft state across steps, renders the full real API response), so a subtle mistake here is the most expensive to discover later, deep into F3/F4 built on top of it.
- After every phase, actually run the app in a simulator/device and click through it yourself before starting the next phase. Don't chain phases on trust in the closeout report alone.

## Committing changes (frontend repo)

Same terminal git workflow, pushed to GitHub instead of Hugging Face:

```cmd
cd clinic-app
git add .
git commit -m "Phase F1: auth flow (login/register/consent)"
git push
```
When ready to produce an installable build:
```cmd
eas build --platform android --profile preview
```
(requires `eas-cli` installed and an Expo account logged in — `npx expo login` first if you haven't).

