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
- The graph is an inspectable connection list, not a draggable node canvas. Keyframes use basic linear interpolation; audio waveform tracks, multi-plane parallax and multitrack timelines are not implemented.
- There is no AI image-generation/editing provider, automatic art production, full sprite rigging, physically based lighting, brush masks, fog/snow/fireflies shaders or production art pipeline.
- There is no general object-interaction/inventory authoring UI, complete inference/evidence investigator, advanced memory-callback authoring, route/ending eligibility analysis or New Game+ system.
- Version history uses bounded in-session undo; durable named versions, shared authenticated cloud sync, multiple concurrent projects, collaboration and account management remain future work.
- IndexedDB bundles retain original assets as base64 data URLs. Binary/ZIP streaming, thumbnails, quota forecasts and large-project profiling remain improvements.
- Accessibility uses native controls and adjustable QTE timing; full assistive-technology and cross-device audits remain.

Future work should extend these real workflows with tests, preserve originals, and keep AI approval and protected narrative state intact. Do not label deferred features as implemented.

## Portable HTML edition

The full editor now also builds as a self-contained `stillframe-studio.html`, available as a download from the production app and in `downloads/`. The player-export bundle is embedded, so it works offline. Production tests cover offline editing/import/save/reload/undo/player export with external assets blocked. My Sites publication and real local-file storage behavior on the user’s device remain unverified; provider AI needs a hosted server. See docs/LOCAL_EDITOR.md.

## Multiple regions and portable authored projects

- Named enabled rain regions combine as a union. Existing legacy polygons are preserved on migration to named regions. A bounded connected-colour wand selects regions locally in imported art; it is not semantic AI segmentation.
- Independent global illumination multipliers and local coloured lights have their own intensity cycles. Local radii expand/contract with cycle values; optional polygon/wand affected areas clip the contribution. Lighting uses 2D compositing and preserves image originals.
- Hide/show dialogue is available while editing. Non-choice dialogue optionally accepts player-written responses, records them in playthrough history and follows the authored next transition. It does not generate a new NPC reply or replace authored choices.
- Header save opens complete-project file saving, with Save As and truthful cancellation/error/download messages. The project JSON includes original images/audio and all regions/settings.
- Authored snapshot moved intact to `projects/published.stillframe.json`, separate from engine files. Manual GitHub file upload is supported. Optional authenticated `/api/project` publishes only that fixed file and requires a server GitHub token; real publishing through that endpoint has not been tested with live credentials.
- Latest validation includes 43 unit/API tests, 12 browser workflows, production build, and offline/local HTML editor/player checks. Provider, GitHub publish and file-picker integrations use controlled test doubles where real credentials or desktop file selection are unavailable. Cloudflare deployment success is checked separately from a GitHub push.

## Workspace and masked motion refinement

Desktop controls now scroll independently of the fitted stage; rain/lighting/motion/save views share a left/right-dockable or draggable floating inspector. The dialogue editor can collapse for stage space. Local lights support full selected-region illumination without radial falloff, with existing polygon/wand selection. New independent motion zones provide bounded 2D pixel sway and ripple on selected art/sprites, respect reduced-motion settings, and persist in project files. This does not add semantic segmentation, true object extraction, or physical cloth simulation. Targeted tests cover pane scrolling/docking/dragging, light-wand region mode, motion animation/pause/reload, and schema roundtrips.

## Depth, sizing, help and appearance refinement

The story library now collapses and resizes; the dialogue divider and Layout controls adjust workspace proportions, preview zoom and pinned/page/hidden dialogue modes. Global dark/light/warm themes and custom panel backgrounds use browser-local preferences with automatic text contrast. Delayed pointer/focus help explains main controls, including a camera focal-frame diagram. An enabled-effects summary lists configured layers/zones and paused visual motion, rather than claiming to profile GPU usage.

Per-scene camera settings provide bounded focal zoom/pan approaches, walking bob/sway, preview replay, reduced-motion framing and optional synthetic or imported footsteps after sound consent. Camera settings serialize in project JSON and render in standalone players; the AI allowlist can propose camera settings for approval. This remains 2D camera motion, without new geometry generation or a full cinematic cut/fade sequencer. Local tests cover the UI, camera math/data, effect summary, synthetic audio scheduling and AI proposals. Final recorded sound quality and real provider/hosting configuration require independent checks.

Validation for the depth/workspace release: 49 automated tests and 16 browser workflows passed, along with the production build and offline editor/player checks. Live deployment and final audio quality remain separate checks.
