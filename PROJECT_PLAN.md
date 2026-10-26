# Engine status

The app implements the end-to-end authoring engine and the requested AI/voice, QTE, audio, sprite/expression and basic keyframe extensions. This is a working development release, not a claim that every long-term production feature in the supplied specification is finished.

## Implemented

- Scene editor, imported original art, reusable assets, lighting, rain/glass, polygon masks, transforms, guides, reduced effects, undo/redo.
- Versioned validated projects, IndexedDB persistence, bundled JSON import/export, compatible loading of existing projects, playable four-scene branching demo.
- Authored conditions/actions with protected state validation, inspectable relationship/practical/knowledge dimensions, clues with separate interpretations, event history and per-choice knowledge snapshots.
- Dialogue/choice authoring, scene creation, runtime restart/jump, character creation, expression library, dialogue portrait and stage expression assignment.
- Sprite layers with position, scale, opacity, flipping, order and removal; basic linear X/Y/opacity keyframes.
- Audio import/decode, preview, per-scene attachment, volume, loop and explicit player sound enablement; original audio travels with project exports.
- Node QTEs with success/timeout targets, monotonic timing, focus pause, one resolution per instance, keyboard/mouse/touch, pause/skip/timing controls and debug outcomes. Reload restarts the current QTE timer.
- Real optional server AI adapter, typed/voice requests, text-sharing consent, structured proposals, explanation/assumptions, schema and project validation, explicit approval, stale-context rejection, undo, graceful errors, offline preset fallback, proposal read-aloud. Configures supported features; never executes arbitrary generated code.
- Cloudflare advanced-mode worker in the production output; server provider key and studio-password authentication. No browser provider secrets. See docs/AI_SETUP.md for required Cloudflare secrets and limits.
- Standalone player HTML export containing original assets, renderer/effects and authored runtime, with no AI dependency.
- Automated model/runtime/AI/API/QTE tests and browser flows for imports, persistence, masks, story completion, audio, sprites, QTE and AI approval/undo/dictation. Provider and recognition services are simulated in automated tests.

## Still outside the current implementation

- Live provider response, real microphone performance and Cloudflare deployment health cannot be verified without credentials / the actual deployment URL. Browser voice support varies.
- The graph is an inspectable connection list, not a draggable node canvas. Keyframes use basic linear interpolation; audio waveform tracks, camera/parallax and multitrack timelines are not implemented.
- There is no AI image-generation/editing provider, automatic art production, full sprite rigging, multiple dynamic lights, brush masks, fog/snow/fireflies shaders or production art pipeline.
- There is no general object-interaction/inventory authoring UI, complete inference/evidence investigator, advanced memory-callback authoring, route/ending eligibility analysis or New Game+ system.
- Version history uses bounded in-session undo; durable named versions, shared authenticated cloud sync, multiple concurrent projects, collaboration and account management remain future work.
- IndexedDB bundles retain original assets as base64 data URLs. Binary/ZIP streaming, thumbnails, quota forecasts and large-project profiling remain improvements.
- Accessibility uses native controls and adjustable QTE timing; full assistive-technology and cross-device audits remain.

Future work should extend these real workflows with tests, preserve originals, and keep AI approval and protected narrative state intact. Do not label deferred features as implemented.
