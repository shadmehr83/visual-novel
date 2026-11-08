# Changes made by Claude

Every change in this list was written by Claude (Anthropic) at the request of the repository owner. Matching commits start with `[Claude]` and carry a `Co-authored-by: Claude <noreply@anthropic.com>` trailer.

> **Where this lives:** branch `claude` on GitHub (the hosted Claude version). Versions follow Stillframe 3 (3.x) and end in `-claude`. `main` is the original line and is untouched. The local Stillframe 3 studio (`npm run stillframe3`, localhost:5174) runs the same code from the local branch `claude-v3`, which is never pushed.

## Latest-version directions and main update (2026-11-08, engine 3.10.2-claude)

- **Directions** (`AGENTS.md`, `README.md`): a *Latest version: Stillframe 3* section says where the release number is, which branch holds it, how to open or run it, how to switch design and light/dark, and how projects move between addresses, so any person or AI assistant can open the right version. The README's old "Current release 2.9.0" line is replaced. No code changed.
- **Main:** at the owner's request `main` was fast-forwarded to this line, with its history intact.
- **Upgrade check:** a project and panel layout saved by the previous `main` site (2.21.1) opened in 3.10.2 at the same address with the story, sizes and theme kept. Both designs, light and dark, popped-out and minimised panels (kept after a reload) were checked. `/play` and `/admin` load.
- **Known:** the Playwright specs tried here (docking, customization, author play) fail on the previous `main` too, because the *Continue your story* start-up prompt covers the page; GitHub's checks on `main` were already failing.

## Stillframe 3.10.2 — scrolling beside the preview, Ctrl+Z undo (2026-11-05, engine 3.10.2-claude)

- **Scroll fix** (`src/style.css`): `.inspector` has `overflow-y:auto; overscroll-behavior:contain`. In the preview-screen drawer it was stretched to its full content height, so it had nothing to scroll itself and `contain` stopped the wheel / two-finger scroll from reaching the drawer. The inspector now fills the drawer's height and scrolls itself (the drawer no longer scrolls). The preview screen's preview area scrolls (`overflow:hidden auto`) when its content is taller than the window.
- **Keyboard undo** (`src/App.tsx`): a window-level keydown handler maps Ctrl/Cmd+Z to `history(true)` and Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z to `history(false)`, skipped in text fields (their own text undo) and while the story is playing locked. There was no keyboard undo before.

## Stillframe 3.10.1 — linked windows: no more jumping back to the main scene (2026-11-05, engine 3.10.1-claude)

- **Cause:** a studio window left open from before 3.9 (not reloaded after the update) is still linked and sends tool changes without the sub-scene field. `onTools` read the missing field as *main scene* (`t.view ?? null`), so picking a sub-scene or starting an effect in that window switched every linked window back to the main scene.
- **Version-gated linking** (`src/windowSync.ts`): every message carries `v: ENGINE_VERSION`. Messages from a window on another version (or with no version) are ignored and the window is listed in `outdated` (`self` when a peer runs a version this window does not know, so this one is older; `others` for older peers), dropped after the usual quiet spell or on goodbye.
- **Defensive tools** (`src/App.tsx`): a tool message without `view` leaves the sub-scene choice as it is.
- **Badge** (`src/SyncBadge.tsx`): *N older windows not linked, reload them*, or *Out of date, not linked* with a *Reload this window* button.
- Tests: `src/windowSync.test.tsx` (an unversioned window does not link or change the tool choice; a newer one marks this window out of date).

## Stillframe 3.10 — area tools on the scene: brush, eraser, undo and Done (2026-11-05, engine 3.10.0-claude)

- **Scene toolbar** (`src/Stage.tsx`): with the new `onTool` / `onUndo` props, the Stage shows a compact *Area tools* bar in its top-right corner while an area or the rain mask is being edited: Points / Wand / Edges / Brush / Eraser (plus Pivot / Move / Tilt for character patches), brush size, wand reach, Undo (the studio's undo, one point or stroke per step), Done, and a hover help. It replaces the 3.9 hint tag in the studio and shows in linked preview windows and the preview screen. The old *Selection tools* bar below the preview stays.
- **Zone buttons** (`src/Zones.tsx`): Brush and Eraser buttons (was *Edit selection / brush*); *Remove last point* only for areas drawn with points (it used to wipe a painted area); the zone being edited is outlined with a note and a Done button; the summary says when the boundary is locked.
- **Unlock boundary fix:** rain zones were merged with `Object.assign`, so a removed `boundary` stayed. They are now replaced whole.
- **Sub-scene choice** (`src/App.tsx`): `viewOverride` is now `{scene, view}` and holds while you stay in that scene (moving through dialogue, drawing, adding effects). Picking another scene, a dialogue from the sub-scene list, × or the *Editing effects of* menu ends it. In 3.9 it was tied to the selected dialogue, so any move to another dialogue (for example clicking the preview, also from a linked window) dropped back to the main scene.

## Stillframe 3.9 — sub-scene effects, preview with controls beside it (2026-11-05, engine 3.9.0-claude)

- **Sub-scene effects** (`src/App.tsx`, `src/SubsceneList.tsx`): `viewOverride` (`{scene, node, view}`) picks the sub-scene the effects controls edit and the preview shows, even when no dialogue uses it; it holds while the same dialogue stays selected. `sceneView(scene, node, viewId)` and the Stage's new `viewId` prop show it. *Edit effects* / *Preview* buttons on each sub-scene (library and Scenes advanced), an *Editing effects of* menu at the top of Effects & interactions, and a *Sub-scene* tag on the preview (× returns to the dialogue's own scene). The choice is shared with linked windows through the tool sync.
- **Preview with controls** : *Preview & effects* on the selected scene in Scenes advanced, and *Preview* on a sub-scene, open the preview screen. Its bar has *Show controls*, which portals the controls aside into `.preview-controls-drawer` beside the preview (closed by default; remembered per kind of window in `stillframe-preview-controls[-screen]`). When the preview screen opens from another workspace, the scene editor renders hidden (`.preview-screen-source`) so its preview and controls can be shown.
- **Hint**: the point-drawing hint is a small tag in the stage's top-right corner; the full help shows on hover.
- The sub-scene list scrolls on its own (up to 45% of the window) so every sub-scene can be reached.

## Stillframe 3.8 — reshape areas by moving their points, from any linked window (2026-11-05, engine 3.8.0-claude)

- **Move points** (`src/Stage.tsx`): while drawing an area with points (`regionEditor.mode === "polygon"`) or the rain mask, pressing on a point (within about 12 screen pixels) drags it; the change is saved once on release, so one drag is one undo step. Picking up a point never adds a new point on top of it.
- **Pause adding points:** right-clicking the scene while drawing toggles a paused state in which left clicks only pick up points (points get a white ring). A hint at the top of the scene says which state it is in. The old mask hint in `App.tsx` is replaced by this one.
- **Drawing in linked windows** (`src/windowSync.ts`): `useWindowSync` takes `tools` / `onTools` and shares the scene tool in use (`regionEditor`, `maskMode`) with a `tools` message. Each choice carries its time, so a window that just opened never switches the others' tool off. The tool goes out shortly after the edit that goes with it, and `App.tsx` does not drop a tool taken from another window while the area it edits is still on its way. The preview window now shows the area being drawn and accepts clicks and drags on it.
- Tests: `src/windowSync.test.tsx` (tool shared, kept when a window opens, finished in both).

## Stillframe 3.7 — two screens: preview window, minimise and sync status (2026-11-04, engine 3.7.0-claude)

- **Preview-only window:** View → Open preview window (preview only) opens `?screen=preview` (title *Preview · …*), a linked window that starts as the preview screen. `openControlWindow` became `openStudioWindow("controls" | "preview")` in `src/windowSync.ts`; each kind reuses its own named window.
- **Preview screen fix** (`src/App.tsx`): in preview-screen mode the preview section is rendered through a portal into `.preview-screen-host`, a direct child of `.app`, instead of being pinned with `position:fixed` inside the studio panels. A split view or scaled layout could trap the old overlay inside one panel (the glitch with a black stage in the control window). *Exit preview screen* is now *Show full studio*.
- **Minimise panels** (`src/DockPanels.tsx`, `src/docking.ts`): a – button on each panel title bar (not the workspaces) sets `min` on that panel's saved layout and folds it into a *minimised · click to show* bar. Its saved size and position are kept (a minimised floating window skips its resize observer).
- **Per-window layout** (`src/workspace.ts`): control and preview windows save their panel layout under `stillframe-workspace-controls` / `-preview`, starting from the main window's layout.
- **Sync status** (`src/SyncBadge.tsx`): the badge names the window (Control / Preview window), flashes on every edit sent (↑) or received (↓) and shows how long ago. An unlinked control or preview window says *not linked* and explains that Incognito windows cannot link. `useWindowSync` returns `activity`.
- Linked control and preview windows skip the *Continue your story* GitHub prompt.
- Tests: `src/windowSync.test.tsx` (sync activity, per-window layout key, minimised panel schema).

## Stillframe 3.6 — two screens: linked control window (2026-11-04, engine 3.6.0-claude)

- **Linked windows** (`src/windowSync.ts`): studio windows at the same address share every edit and the selected dialogue through a BroadcastChannel. Only artwork and sound that changed are sent. The window that made a change saves it; the others show it without saving (`App.tsx` autosave skips `sync.remote`). A window that falls behind asks for the full project. Each edit carries its time, so a window coming back from a long pause never replaces newer work; windows that close without a goodbye drop off after a quiet spell (heartbeat). A *Linked · N windows* badge shows next to the save status. Before this, two tabs kept separate copies and the last to save silently overwrote the other.
- **View → Open control window (second screen)** opens `?screen=controls` (window title *Controls · …*). It uses the Window Management API to place it on the other display when Chrome or Edge is allowed to; otherwise it opens beside you to drag across. **View → Preview screen** fills the window with the scene preview (`html[data-screen=preview]`), with an Exit button.
- **localhost:5175** (`scripts/stillframe3.mjs`) redirects to `localhost:5174/?screen=controls`. It has to be the same address because browsers keep each address's storage apart.
- **AI panel** (`src/Assistant.tsx`): on localhost, effects and interface tasks now default to Claude Code · this computer (subscription, no API key), like dialogue already did. Saved routes are kept.
- Test: `src/windowSync.test.tsx`.

## Stillframe 3.5 — one Stillframe: design switch in the hosted studio (2026-11-04, engine 3.5.0-claude)

- **One codebase:** `claude` now holds everything from Stillframe 3 (fast-forwarded to `claude-v3`), and both branches share the same code and version line. Earlier 2.x releases stay in Update history.
- **Design choice** (`index.html`, `src/v3/ui.ts`): a start-up script adds `data-ui="v3"`. The hosted studio and the dev server open in the classic design unless this browser chose Stillframe 3 (`localStorage["stillframe-design"]`). Local Stillframe 3 builds in `stillframe3` mode (`vite.config.ts` adds `data-sf3` and its title; `scripts/stillframe3.mjs`). It opens the new design unless the tab chose classic, as before, and skips the offline service worker.
- **Settings → Studio design** (`src/v3/StudioDesign.tsx`) and View → Switch to … design now appear in every studio. Light / Dark works in both designs: the classic interface theme, or the Stillframe 3 palette.
- The hosted studio also gets Stillframe 3's storage (artwork in a separate IndexedDB `media` store, version 2, migrated on the next save) and the GIF transition fixes.

## Stillframe 3.4 — story timer switches (2026-11-04, engine 3.4.0-claude)

- Merged `claude` (2.32.0-claude): timer on/off and bar shown/hidden per dialogue, per scene and for a dialogue range, in both dialogue editors. Details are under Iteration 12 below.

## Stillframe 3.3 — new game settings (2026-11-04, engine 3.3.0-claude)

- Merged `claude` (2.31.0-claude): Start new game asks for the player's settings, and the pause menu groups them under Settings with a Timed decisions switch. Details are under Iteration 11 below.

## Stillframe 3.2 — story timers (2026-11-03, engine 3.2.0-claude)

- Merged `claude` (2.30.0-claude): auto-continue, timed decisions and the timer bar now work in Stillframe 3 and in its classic design. Details are under Iteration 10 below.

## Stillframe 3.1.1 — design switch, dark palette, phone and history fixes (2026-11-03, engine 3.1.1-claude)

- **Design switch:** `index.html` marks the page with `data-sf3`. A tiny start-up script drops `data-ui="v3"` only when this tab chose the classic design (sessionStorage), so every new start opens Stillframe 3.1. Settings → **Studio design** (`src/v3/StudioDesign.tsx`) and View → Switch to … design save the project, then reload in the other design. Both designs share the project, saves and Update history. The local build never registers the offline service worker in either design.
- **Dark palette:** `html[data-palette="dark"]` maps the Stillframe 3 tokens to the classic dark colours. The light-only colours left in the stylesheets are now tokens (`--v3-on-accent`, `--v3-on-ink`, `--v3-switch-off`, `--v3-track`, `--v3-scroll`). Switch with the moon/sun button in the top bar or Settings → Studio design → Palette; the choice is kept in localStorage.
- **Phone and game keep their colours:** Stillframe 3 now uses its own theme names (`v3-light`, `v3-warm`), so the classic light theme's broad rules (headers, headings, labels, inputs) no longer reach the stage or phone. Their studio part is repeated with `:where` and the game areas excluded. Inside `.stage`, `.stage-frame`, `.device-shell` and `.standalone-experience`, the classic colour tokens, colour scheme, text colour and interface font are restored. Studio scrollbars and sliders stay out of them.
- **Update history** fills its panel. The classic padding was computed from the window width, which squeezed the notes in narrower panels.
- Release times for 3.0.0 and 3.1.0 now use their real commit times.

## Stillframe 3.1 — engine-style redesign (2026-11-03, engine 3.1.0-claude)

Same `claude-v3` line. The 3.0 top bar, palette and features stay; the rest of the studio is laid out like a game-engine editor. The layout is mostly `src/v3/stillframe31.css`, scoped to `html[data-ui="v3"]`, plus small JSX hooks.
- **Panels:** joined edge to edge with hairlines. Every dock panel has the same 32 px header, whose window buttons show on hover. The single-workspace header row is hidden (Windows & docking still moves it). There's an icon activity bar and a 28 px status bar.
- **Story outline:** the chapter picker comes first, then compact scene rows with 16:9 thumbnails and an accent bar for the selection. The static story note is hidden. Artwork shows as a two-column asset browser. The eight export buttons are in one **Export & share** menu (`src/v3/Popover.tsx`) pinned to the bottom of the outline; it closes on an outside click, on Escape or after an action.
- **Viewport:**
  - The project notice is now one quiet line.
  - The scene title, badges and tools sit in one toolbar.
  - The stage fits the available space on a dotted canvas, with no scrolling inside the preview. The script panel's minimum height is now `min(260px, 40vh)`.
  - In play, Pause menu and Fullscreen sit above the toolbar, and the sound control is in the status bar.
- **Script panel:** chip tabs, a segmented Normal/Advanced switch, and Add node and Collapse at the right. The outline has numbered rows with two-line previews, and the editors are carded.
- **Inspector:**
  - The six tabs are icon tiles.
  - The 13 effect panels are icon chips (the chosen one named) and show only under Atmosphere.
  - The order is: header, tabs, chips, this tab's properties, effect groups, then layout.
  - **Foldable groups** (`src/v3/folds.ts`): each group heading in the inspector and the map details folds like an engine component. The All view starts folded, each tab's state is saved in localStorage, and Search features unfolds the group around a found control.
  - Sliders use the exact-value box instead of a duplicate bubble.
- **Maps:** node-editor look, with white boards, tinted title bars, round copper ports, a dotted canvas and lighter wires. Chapter, device and update pages use the same page headers, segmented tabs and cards. The settings dialog is a two-column sheet.
- New pill on Export & share (3.1.0). Tests: `src/v3/folds.test.ts`; `src/recentFeatures.test.tsx` now runs as Stillframe 3. All 210 tests pass (`emberDialogue` can time out under a full parallel run and passes alone).

## Stillframe 3 — experimental light studio (2026-11-03, engine 3.0.0-claude)

> **Separate line:** branch `claude-v3`, worked on in the `stillframe-3` folder next to `visual-novel`, kept local. It runs at http://localhost:5174 (double-click `Start Stillframe 3.cmd`, or `npm run stillframe3`) with its own browser storage, so it never touches the classic studio at 5173. The classic studio stays the main line: new features land on `claude` first and are merged into `claude-v3` afterwards.

- **Runs from an optimised build** (`scripts/stillframe3.mjs`): `vite build --watch` plus `vite preview`. Per keystroke about 20–30 ms instead of 110–155 ms on the dev server, and about 120–130 MB of memory instead of 220 MB. Local Claude works there too (`configurePreviewServer` in `scripts/claude-local-plugin.ts` loads the story modules through a watcher-free Vite instance).
- **Autosave without copying artwork** (`src/storage.ts`, IndexedDB version 2): images and sounds live in a `media` store, keyed by asset, and are written only when they change. The saved project holds the story text. Older saves load as before. Memory stayed flat over 40 edits and 5 saves; before, it grew by about 4 MB per edit.
- **Light design** (`src/v3/stillframe3.css`, all scoped to `html[data-ui="v3"]`): one 52 px top bar plus one row for the menus, workspace tabs with icons, and icon quick tools. The classic layout row is in a new **Windows** menu. There are light panels, inputs, ON/OFF switches, menus, dialogs, search, hover help and floating windows, and no backdrop blur. The story stage, device screens and the game keep their own look. Theme choices are Light and Warm paper.
- **New pills** (`src/RecentFeatures.tsx`): controls from the five latest releases get a green "New" pill that shows the version on hover. Names can match by their start, and DOM changes inside the playing scene no longer re-run the scan.
- **GIF ↔ still backgrounds** (`src/BackgroundImage.tsx`, `src/SceneTransition.tsx`):
  - Each GIF frame is encoded once (WebP) and shared by every copy, up to 64 MB.
  - A GIF starts on its poster or a ready frame, and a frame is swapped only once it is decoded.
  - A transition waits up to 1.5 s for a new GIF's first frame.
  - "Smooth" is a true cross-dissolve: the new view stays opaque beneath the fading old one, so there is no dip to the dark stage.
- Tests: `src/recentFeatures.test.tsx`; all 209 tests pass.
## Iteration 12 — Story timer per dialogue, range and scene (2026-11-04, engine 2.32.0-claude)

- **Model:** `node.timerOff` and `node.timerHidden` (true/false override, unset follows the scene). `scene.storyTimers` `{off, hidden, range: {enabled, start, end, effect: "hidden" | "off"}}`. The range counts along the path played, like the texting range, and is removed when its start or end dialogue is deleted (`src/authoring.ts`).
- **Rules** (`timerRule` in `src/storyTiming.ts`): the dialogue's own choice wins, then the range, then the scene. Off stops auto-continue and timed decisions; a line's own `autoAdvance` still runs. Hidden keeps the timer running with `visibility:hidden`; in the studio the bar shows as a faint dashed outline (`src/StoryTimer.tsx`).
- **Editors:** `src/StoryTimerControls.tsx` in the Normal dialogue editor and in the Advanced (map) editor's selected dialogue; the map's scene view shows the scene part. Editable during Author's playthrough.
- Search entries, New marks, tests in `src/storyTimer.test.tsx`.

## Iteration 11 — New game settings (2026-11-04, engine 2.31.0-claude)

- **Title screen:** every game (play link and exports) now opens on its title screen. Start new game opens `src/NewGameSetup.tsx`, which asks three questions. How to move on: Continue on screen, Enter (not on phones), or a click/tap on the scene. Whether dialogue is timed (auto-continue). Whether decisions have a time limit, asked only when the story has timed decisions. Choices apply at once. A note says they can be changed anytime from Pause menu → Settings.
- **Pause menu:** a Settings group holds Advance story, Auto-continue dialogue, the new **Timed decisions** player switch and sound (`src/PlaySession.tsx`, `src/AutoContinueSetting.tsx`). Player switches share one store in `src/storyTiming.ts` (`timedDecisionsPreference`, localStorage `stillframe-timed-decisions:<id>`). `StoryTimer` skips the countdown when the player turned it off.
- Tests: `src/storyTimer.test.tsx`. The export browser tests now pass through the new screen. Releases 2.25.0 to 2.31.0 now carry their commits and real commit times instead of placeholders.

## Iteration 10 — Story timers: auto-continue and timed decisions (2026-11-03, engine 2.30.0-claude)

- **Auto-continue** (`src/storyTiming.ts`): plain lines move on after 3 s (under 10 words), 4 s (one line) or 8 s (two lines), plus 4 s per extra line. Lines are counted as the dialogue box shows them, or estimated on a phone. The project default is `settings.autoContinue` (Settings → Auto-continue dialogue by default). Players switch it in the pause menu (`src/AutoContinueSetting.tsx`); their choice is kept per game in localStorage.
- **Timed decisions:** `node.timedChoice` `{enabled, seconds, choice}`. The dialogue editor has Timed decision, Seconds to choose and When time runs out (`src/TimedDecisionControls.tsx`). When time runs out, the chosen reply is taken, or the first available one. `settings.timedDecisions === false` switches them all off without losing them. Project timing scales decision time.
- **Timer bar** (`src/StoryTimer.tsx`): a draining bar with no numbers, along the bottom of the dialogue box, or in the scene's lower-right corner while a phone or computer screen is up. It holds while paused, while the author edits, while the player types, while a character answers, and while a phone message is still being typed. A line's own `autoAdvance` now runs here (moved out of `SceneAudio`), so it shows the bar too. Used in the studio's play mode and in exported games.
- Search entries, New marks, tests in `src/storyTimer.test.tsx`. The 2.29.0 release now has its real commit time.

## Iteration 9 — Bug-fix pass, AI search, on/off dialogues, image expand (2026-11-03, engine 2.29.0-claude)

- **On/Off switches:** a node can now be switched off (`disabled`), and replies already had `enabled: false`. Both have On/Off pills on the Dialogue advanced map (`src/FlowCanvas.tsx`, `src/FlowEditor.tsx`, `src/flow.ts`) and a switch in the normal editor. `skipDisabled` in `src/model.ts` passes switched-off lines during play and start. Switched-off items are greyed and struck through.
- **AI parallels on the map:** `flowGraph(…, rewrites)` marks adapted dialogues and replies, which get an orange outline and the parallel text during a playthrough.
- **Search by AI** (`src/aiSearch.ts`, `/api/claude-local/search`, `src/FeatureSearch.tsx`): Claude Code ranks the search catalogue for misspelled or described queries; toggle in the AI panel. Local studio only, never the API.
- **Image expand:** ⤢ and double-click on scene thumbnails and Scenes advanced backgrounds; `AssetPicker` `fallback` shows and expands the scene background a dialogue uses.
- **Settings:** an Open playtest admin link.
- **Hover help:** `src/familyHelp.ts` gives specific text to about 500 controls that had generic help (519 → 0 found in an audit of six workspaces). The outdated Self-reply help was fixed.
- **Checks and fixes:** `src/storyCheck.test.ts` plays every branch of the published story (all 186 lines reached, 6 endings, no errors or dead ends). The Scenes advanced map had duplicate React keys when two lines share a reply id (Getting ready, `journey-18`); ports are now keyed by line and reply. New tests are in `src/switches.test.ts`.

## Iteration 8 — Playtest admin website, Claude exports, AI panel fix (2026-11-03, engine 2.28.0-claude)

- **Admin website** `/admin` (`admin.html`, `src/admin.tsx`): password `ADMIN_PASSWORD`. It lists testers (automatic name or chosen name, device, country, first and last seen, visits, steps, AI replies, progress, access) and shows each run's timeline (lines, choices, typed messages, AI answers, errors). It can block, allow or delete a tester's records, and refreshes every 30 s.
- **Server** (`functions/api/playtest.ts`, routed in `functions/worker.ts`): `/api/playtest` for events and the access check, using the playtest code, simple requests and batching; `/api/admin/*` for the admin page. Storage is a Cloudflare D1 database bound as `PLAYTEST_DB`, which creates its own tables. `/api/reply` refuses blocked testers (`X-Player-Id`).
- **Game** (`src/playtest.ts`, `src/Player.tsx`): Claude versions only (the play link with `?code=` and Claude exports). A random tester ID in localStorage, an optional name on the title screen, a plain notice of what is recorded, batched step, choice, AI and ending events, and a blocked screen. No IP, email or account is stored.
- **Exports:** the library's two quick exports now come "without Claude" and "with Claude"; Advanced export defaults to the Claude site and the saved playtest code.
- **AI panel:** tabs no longer float over the text.

## Iteration 7 — Author-only AI status, Normal/Advanced editor, per-line Self-reply (2026-11-03, engine 2.27.2-claude)

- **No AI tags inside the game.** Author's playthrough shows "AI · parallel to Scene · Dialogue" or "AI · extra responses after Scene · Dialogue · n messages", and the dialogue editor lists the parallel or the extra messages.
- **Normal / Advanced switch** in the bottom Dialogue tab, which shows the Dialogue advanced map (`FlowEditor`) under the preview at a fixed, scrollable height.
- **"Self-reply on this dialogue"** (`allowSelfReply` on a node): hides Self-reply on that line only, everywhere. The normal/device custom-response options are untouched.

## Iteration 6 — One AI panel, narrated-scene replies, AI labels, preview window, fifth Insta clip (2026-11-03, engine 2.27.0-claude)

- **AI panel** (`src/Assistant.tsx`): one **AI assistant** tab where each job picks its AI: Claude Code on this computer (shows which Claude model and plan), OpenAI API, or Claude API. The Claude API asks for confirmation for anything but character texts. **AI Demand Export** stays as its own tab, and the old "Cilia AI assistant" and "OFFLINE MODE" labels are gone.
- **Narrated scenes:** self-replies on Narrator or You lines are answered by the character present, the last one who spoke in the scene. Narration is labelled as narration for Claude. Outside the phone, a story-advancing answer stays visible until **Continue story**, and the chosen path is still followed (`src/characterReply.ts`, `src/SelfReply.tsx`).
- **Last line reminder** (`src/LastLine.tsx`) on lines with choices, in the studio and in exported or shared games.
- **AI labels** (studio only): "AI reply" and "AI parallel" tags in the phone and dialogue box, an author toolbar note naming the dialogue a parallel replaces, and a note in the dialogue editor.
- **Preview window** (`src/PreviewWindow.tsx`, `src/App.tsx`, `src/style.css`): Lock, Fill and Reset are pinned at the top when unlocked; the window scrolls inside and resizes from every edge and corner; the preview and dialogue editor scroll together when they don't fit.
- **Story bible voice rules** and phrase-repetition limits in Claude's instructions.
- **Fifth Insta clip, "harbour-lights":** rendered in the browser from `artwork/cafe-animation/street-source.png` (`scripts/insta/render.html`, `render-harbour-lights.ts`, `receive.mjs`; dev dependency `mp4-muxer`). It is registered in the feed, the manifest, the offline editor and the media pattern.

## Iteration 5 — Hosted studio on the Claude API, the script follows your conversation (2026-11-03, engine 2.26.0-claude)

- **Hosted studio (2.25.1-claude):** opened with `?code=<playtest code>`, character replies use the Claude API with no password. **Assistant → Character replies** shows "Claude API · texts only · connected".
- **Live fixes:** Haiku 5.5 thinks by default and used up the reply budget, so quick replies now turn thinking off. JSON is read even when the model wraps it in text, and a failed reply or adaptation is retried once.
- **Adapted script:** when a free conversation ends, the next authored lines (up to the next choice, 4 at most) and their choice texts are rephrased to follow on from it. The first line reacts briefly to the last message. Meaning, information and branches stay the same (`rewrite*` and `upcomingLines` in `src/characterReply.ts`; `shownText`/`shownChoice` and `runtime.rewrites` in `src/model.ts`; `/api/reply?rewrite=1`; `/api/claude-local/rewrite`).
- **Bridging answers** no longer end with a question the player can't answer.
- **Bug fix:** a free conversation, including an answer still arriving, survives the pause menu and other workspaces (`chatStore` in `src/characterReply.ts`, `src/SelfReply.tsx`).

## Iteration 4 — Free texting that returns to the story, playthrough logs, play link (2026-11-02, engine 2.25.0-claude)

- **Keep texting:** after a self-reply you can keep texting the character. Each answer has an `advance` decision: when your message engages with the story (or after 4 free texts, `MAX_FREE_TURNS`), the authored route resumes on your chosen path. Off-topic chats get steered back, more firmly each turn (`src/characterReply.ts`, `src/SelfReply.tsx`, `src/PhoneUI.tsx`).
- **No duplicate line:** when the character's answer moves the story on, it carries the next authored line's content, and `respond()` skips that plain line of theirs (`src/model.ts`).
- **Natural side answers:** characters may answer harmless questions (where, when…) using names from the story: current and upcoming scene titles, plus lines from other branches of the scene. No secrets or invented clues.
- **AI playthrough log:** every exchange is logged with time, playthrough id, scene, line, chosen path, turn, your text, the answer, the advance decision, response time and recent choices. Use **Assistant → Character replies → Download log / Clear**. The local studio also appends to `playtest-logs/claude-YYYY-MM-DD.jsonl`, which Git ignores. Players can download theirs from the Pause menu.
- **Share link:** `/play` is a game-only page with no editor. Add `?layout=phone` for the phone layout and `?code=<PLAYTEST_TOKEN>` for live character replies (`play.html`, `src/play.tsx`, `vite.config.ts`).
- One quiet automatic retry when an answer fails. The local bridge loads story code on demand, so editing it no longer restarts the dev server.
- Versions renamed to `2.22.0-claude` … `2.25.0-claude`; `AGENTS.md` notes the branch convention.

## Iteration 3 — Phone chat replies, chosen-path intent, Claude edition export, bigger stage (2026-11-02, engine 2.24.0)

- **Phone chat:** your self-reply appears as your chat bubble, the contact shows typing dots, and their answer arrives as their own message before the authored conversation continues (`src/PhoneUI.tsx`, `src/SelfReply.tsx`, `src/model.ts` `respond(…, answer)`, `src/playerSave.ts`).
- **Chosen path:** the authored reply you pick under *Follow this authored path* is sent as the intent behind your own words. Claude reacts to that tone and consequence and steers toward the route without repeating the authored text (`src/characterReply.ts`: transcript prompt, perspective note, echo retry).
- **Speed:** in-game replies use Haiku, the fastest and lightest model. The local bridge passes the character rules as the system prompt and skips MCP and session saving (`scripts/claude-local-plugin.ts`, `functions/api/reply.ts`). Replies take about 4–8 seconds through Claude Code.
- **No Claude tag inside the story:** tags stay in the studio only.
- **Claude edition export:** Advanced playable export → Character replies → Claude edition, for both desktop and phone layouts. The file embeds the game server address and a playtest code, has its own title badge and warm accent, and calls `/api/reply` with `X-Playtest-Token`. The server needs the `ANTHROPIC_API_KEY` and `PLAYTEST_TOKEN` secrets (`src/AdvancedExport.tsx`, `src/playerExport.ts`, `src/Player.tsx`, `functions/api/reply.ts`, `functions/worker.ts`).
- **Author's playthrough:** controls compacted to one row, and the game stage keeps a playable minimum size (`src/style.css`).
- Update history 2.24.0, ✓ New markers, tests, and a refreshed `downloads/stillframe-studio.html`.

## Iteration 2 — Claude on this computer, automatic replies, Claude and ✓ New markers (2026-11-02, engine 2.23.0)

Uses your own Claude Pro sign-in, through Claude Code on this computer, instead of an API key. Self-reply now gets an answer automatically: no tick box and no password.

- `scripts/claude-local-plugin.ts` (new): local studio bridge at `/api/claude-local`, active only in `npm run dev`. It runs the signed-in `claude` CLI with tools disabled. Story text goes in through stdin, and only requests from this computer are accepted.
- `vite.config.ts`: loads the bridge.
- `functions/api/assistant.ts`: the assistant's instructions are now a shared `assistantSystem` constant, so the local bridge uses the same rules.
- `src/characterReply.ts`: reply mode setting (Claude on this computer / Claude API / Off), connection status and local requests.
- `src/SelfReply.tsx`: removed the tick box and password. The character answers automatically ("… is typing…") and the answer carries a Claude tag.
- `src/Assistant.tsx`: new **Character replies** section showing "Claude Pro connected", plus **Claude (this computer)** as a provider choice for assistant tasks (no password needed).
- `src/ClaudeMark.tsx` (new): the small CLAUDE tag with hover description.
- `src/ReleaseHistory.tsx`, `src/RecentFeatures.tsx`, `src/releases.ts`: releases record who made them, Claude releases show a CLAUDE tag, the newest release's features show a ✓ New mark with hover descriptions, and new controls get a ✓ (✓ Claude) marker.
- `src/style.css`, `src/characterReply.test.ts`, `package.json`: styles, test, version 2.23.0.

Setup on another computer: install Claude Code (`npm install -g @anthropic-ai/claude-code`) and run `claude auth login` once. The public Cloudflare site cannot use a personal Claude subscription; it still needs `ANTHROPIC_API_KEY`.

## Iteration 1 — In-character Claude replies (2026-11-02, engine 2.22.0)

When a player uses **Self-reply**, they can tick **Let Claude answer in character**. The speaking character then answers what the player typed, in their own voice, before the authored story continues unchanged.

- `functions/api/reply.ts` (new): `/api/reply` server endpoint. Calls Claude, requires the studio password and same-origin requests, and validates input and output.
- `src/characterReply.ts` (new): builds the request (reply, current and next lines, speaker notes, recent scene lines) and holds Claude's instructions. Claude stays in character, respects what the character knows and never changes the plot.
- `src/SelfReply.tsx`: Claude toggle, studio password field, "thinking…" state, answer panel and Continue story or Skip.
- `src/PlaySession.tsx`: shares the current story position with the reply box. Turned off in exported games.
- `functions/worker.ts`: routes `/api/reply`.
- `src/aiProviders.ts`: default Claude model updated to `claude-sonnet-5-5`; per-request token limit.
- `src/style.css`: styles for the answer panel.
- `src/characterReply.test.ts` (new): request building, Claude routing and endpoint guards.
- `src/releases.ts`, `package.json`, `docs/AI_SETUP.md`: Update history entry 2.22.0 and setup notes.

Needs `ANTHROPIC_API_KEY` and `STUDIO_ACCESS_TOKEN` set as Cloudflare Pages secrets to work on the live site.
