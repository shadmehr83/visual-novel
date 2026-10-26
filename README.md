# Stillframe — Visual Novel Studio

A working local-first visual novel authoring web app built from the supplied **Visual Novel Studio Technical Build Specification**. React 19, TypeScript, Vite, Zod, IndexedDB (`idb`), and native SVG compositing. No AI key or backend is needed.

## Run

Node 22+ (validated on Node 24.19), npm 11:

```sh
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5173
```

Open the address printed by Vite in your own local development environment. In Codex cloud, use the existing checkout at `/workspace/visual-novel`; each task is already isolated, so no additional Git worktree is needed.

```sh
npm test                     # schema and narrative runtime tests
npm run build                # TypeScript + production assets + offline worker
npm run preview -- --port 4173
# In another terminal, test production offline reload:
CHROMIUM_PATH=/usr/bin/chromium npm run test:offline
# Browser tests; use an existing Chromium when available:
CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
# Otherwise install once, preserving TLS verification:
npx playwright install chromium
npm run test:e2e
```

## Use the studio

- The included four-scene opening is loaded automatically. Select scenes in the left panel. The stage and right inspector are live.
- Import PNG/JPEG/WebP from **Assets** or **Background → Import background**. Imports become the current background. Originals stay unchanged; fit, position, scale, colour and effects are metadata. Images are limited to 15 MB / 32 MP to bound memory usage.
- Background fit supports cover, contain and stretch. Atmosphere includes brightness/contrast, ambient colour, a soft warm radial light with position controls, falling rain, rain-on-glass and vignette. Reduced effects caps rain at 35 particles (normal cap 200).
- **Edit polygon mask** shows the region. Click to append vertices; clear to redraw, remove last to erase a vertex, invert for the complement. Three points activate clipping. The region follows background position/scale; mask handles are hidden during play. Vertex dragging and brush painting are future work.
- Author dialogue below the stage. Add nodes and choices, select target nodes/scenes, and edit speaker/text. State actions and choice conditions are editable as validated JSON under each choice. Actions accept only existing state keys and correct types. Example action: `[{"key":"trust","op":"add","value":1}]`. Example condition: `{"key":"messageOpened","equals":true}`. Text may interpolate existing variables with `{outfit}`. No expression evaluation or arbitrary code runs.
- Play from the beginning or resume the saved playthrough. The left scene buttons act as debug jumps while playing. Inspect state, clues and event history below the stage. Restart clears playthrough state; jumping retains state and applies entry actions only on first visit.
- **Characters** edits Mara's name and voice/knowledge notes. Import a portrait in Assets and assign it to Mara. The current portrait support is a dialogue portrait, not a full sprite/expression system.
- Common project edits have 40-step undo/redo. Playthrough advancement has its own restart mechanism, not editor undo.
- The offline assistant is explicitly a local rain/dimming preset parser. It presents target and parameter changes for Apply/Reject; edits are undoable. There is no AI provider integration and no content leaves the browser.

## Persistence and portability

One active project and one playthrough are stored in this origin's IndexedDB. Editor changes debounce for 600 ms; story boundary saves are immediate. Wait for **Saved on this device** before closing. Failures show an error and must not be treated as successful saves.

**Export project** downloads a self-contained `.stillframe.json`: versioned story data, settings and original image bytes encoded as base64 data URLs. **Open project** validates and replaces the active project, with editor undo available. Export before creating a new project or loading the demo. Exports exclude playthrough state (that is local only), credentials and provider data. Base64 adds about 33% overhead. Browser databases store this bundle in IndexedDB, never localStorage. Separate binary asset stores/ZIP streaming are a future optimisation. Imports cap project files at 100 MB. Deleting browser data, private-mode eviction, or changing the hosting origin can remove or isolate local work. Keep downloaded backups. There is no cloud sync or multi-device login yet.

Schema v1 is validated at runtime. Unsupported versions are rejected with errors; no migrations are needed until a second version exists. Unknown target IDs, missing backgrounds, invalid conditions, undeclared state changes, and out-of-range effect parameters fail validation.

## Internet deployment

This app produces a static site in `dist/`. A development process in this machine is not a public deployment.

**Cloudflare Pages (recommended free default):** create a Pages project connected to your GitHub repository, set build command `npm run build`, output directory `dist`, and Node version `24`. After the files are pushed to GitHub, deploy. Pages supplies an HTTPS `*.pages.dev` URL; add a custom domain if desired. Alternatively upload the locally built `dist` folder through Pages Direct Upload. No server, database credential or API secret is required.

**Netlify:** connect the repository or drag `dist/` into Netlify Drop. The included `netlify.toml` sets build/output defaults.

**Vercel:** import the repository as a Vite project; build `npm run build`, output `dist`.

The ready-to-upload build is also included at `downloads/stillframe-cloudflare.zip`; use GitHub’s **Download raw file** button on that file. Alternatively connect this repository directly to Cloudflare Pages with the settings above. No hosting account is connected to this task, and the application has **not been deployed publicly**. Deployment requires your hosting account/access. Do not put secrets in frontend environment variables. Host at the domain root; subpath hosting needs a corresponding Vite base and service-worker path change.

The production build creates a versioned service worker that caches the application shell and bundled assets over HTTPS (or localhost). Once installed, editor reloads work offline; imported art lives in IndexedDB. Development mode has no service worker. There are no external fonts, image services or analytics. Core editing/playback works without the network. Service workers are origin-scoped; old caches update when a new deployment installs.

## Renderer choice

Native browser SVG is the compositing engine, rather than a custom canvas renderer. It supplies image fit, transforms, clipping masks, colour filters and alpha compositing, with capped deterministic particle placement driven by requestAnimationFrame (approximately 30 updates/sec). Layers explicitly order background, tint/light, weather, vignette, then HTML portrait/dialogue/choices. Animation callbacks are cleaned up on unmount or disable. Effects are bounded for this MVP; profiling/texture-based rendering may justify PixiJS later. The current stage illustrations are original vector placeholders, not production artwork.

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for specification coverage and remaining milestones.
