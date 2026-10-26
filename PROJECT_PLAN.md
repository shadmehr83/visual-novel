# Implementation status

Source: Visual_Novel_Studio_Technical_Build_Specification.docx. The document describes multiple phases. This implementation targets Phase 1 and its playable vertical slice; it does not claim the entire production engine is finished.

## Phase 1 — working vertical slice

| Specification area | Status / implementation |
| --- | --- |
| Editor layout | Scene/assets/character/state navigation; central live stage; atmosphere/background inspector; dialogue, state and log panels; responsive layout |
| Project model | Versioned Zod project schema; runtime graph/action/condition validation; unsupported versions rejected |
| Create/open/save/reload | Blank project and demo; one active project in IndexedDB; bundled JSON import/export; local playthrough recovery; truthful save/error states |
| Asset workflow | Original PNG/JPEG/WebP import and decode; rename, tags, notes, dimensions, approval/reference distinction; reuse across scenes; dialogue portrait assignment |
| Background transforms | Cover/contain/stretch, X/Y/scale; safe-area guides; metadata-only changes |
| Atmosphere | Brightness/contrast/tint; positional soft radial light; vignette; defaults reset and disable-all |
| Live rain | Density, speed, angle, length, opacity, colour; deterministic initial layout; distinct glass streaks; particle cap; reduced effects |
| Rain region | Editable polygon with append/remove-last/clear/invert; clipped rain; scene coordinates follow background transforms; hidden in play |
| Dialogue authoring | Add nodes and choices; edit text/speaker/next/targets; validated action and condition JSON; simple variable interpolation |
| Narrative runtime | Authored deterministic transitions; protected state allowlist/type checking; entry actions once per visit set; condition checks; choice/event history; replay |
| First demo | Bedroom → delayed/opened notification → playful/guarded app conversation → 3 outfits + optional item → café replies → clue/boundary outcome → ending |
| Debugging | State and discovered clues; event log; restart; jump to any scene while retaining state |
| Reversible editing | 40 project snapshots of common edits; no source-image modification |
| Offline / privacy | Core has no backend; production service worker caches shell/assets; no mandatory AI; nothing sent externally |
| Assistant foundation | Honest offline rain/dim helper; explicit proposal/apply/reject; fixed allowlisted operations; undo. Not a general LLM assistant |
| Delivery | Production static build; hosting instructions; Netlify defaults; no public deployment performed; a GitHub delivery package is available in `downloads/` |

## Deliberate limitations and next milestones

### Phase 1 refinements

- Imported originals are embedded as data URLs in the IndexedDB project bundle, not individual Blob records. ZIP/binary asset storage, thumbnails, quota forecasting, streaming import/export, and unused-asset cleanup remain to implement. Large projects can approach browser storage/memory limits.
- Polygon editing supports append/remove-last, clear and invert. Dragging arbitrary vertices, brush add/erase and source-pixel mask painting remain.
- One fixed-warm soft light and explicit fixed layer order. Multiple coloured lights, reorderable sprite layers, camera/parallax, advanced shaders and a GPU renderer are future improvements.
- Only Mara has a character editor and imported dialogue portrait. General character CRUD, expression selection, sprite positioning and transition animations remain.
- State values are inspectable; existing actions/conditions use a JSON editor. Dedicated variable/flag creation UI, author-facing entry-action controls, character portrait per-node selection, visual graph editing, and scene/node deletion are not yet available.
- Demo outfit is referenced in the café line; optional item is recorded but has no café callback yet. Dialogue is intentionally a short original seed rather than a complete game.
- Keyboard/touch use native accessible form controls. Full accessibility audit, keyboard mask editing, focus-trapped dialogs and assistive narration remain.
- No hosted URL or cloud persistence. Static deployment makes the app accessible online, but each browser/device retains its own project. Export/import bridges devices.

### Phase 2 — investigation and interaction

- Separate observation / interpretation / confirmed-evidence registries, authoring UI, prerequisite knowledge, inventory/items and conditional scene objects.
- Structured memory records with knowledge snapshots and validated callbacks; current foundation is flags, registered clue interpretations and event history only.
- Reusable scene QTE module with monotonic timer, exactly-once action/timeout resolution, focus pause, timing/skip accessibility and tests. Deferred deliberately; not required for the first demo.
- Audio import, volume/loop and ambience; no audio buttons pretending to work in this release.

### Phase 3 — production and optional AI

- Node graph, timeline/keyframes, route reachability, clue consistency, ending-eligibility explanations, robust version history.
- General provider-independent server AI adapter, schema-validated proposals, external-processing consent, character-knowledge constraints, authored fallbacks. Keys must stay server-side. Image generation outputs become candidate assets; originals never overwritten.
- Standalone player export, multi-project library, optional authenticated sync and backup service.
- Broader weather types, camera moves, production art pipeline and performance profiling on target hardware.

## Verification

Use `npm test`, `npm run build`, and `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`. The browser suite exercises real IndexedDB persistence, image import, mask editing/undo, dialogue editing, export, the complete branching opening, clue inspection, playthrough recovery and corrupt project rejection. Keep current results distinct from future roadmap checks; QTE, audio and provider integration have no implementation/tests yet.
