# Stillframe engine update history

Current version: **2.3.0**. Earlier version numbers were assigned retrospectively from Git milestones. Directions below point to their current location; the in-app Update history tab also offers feature shortcuts. Dates use Australia/Sydney time. Project format remains schemaVersion 1.

## v2.3.0 — Phone navigation and missing story updates (2026-10-28)

### Integrate the missing café departure into saved projects

Compatible older First Match projects receive the rainy After the café scene on normal reload. Existing backgrounds, effects, other scenes and edited farewell lines are preserved; the previous project is backed up.

1. Open or reload the studio
2. Scenes library
3. After the café; Restore previous local project opens the recovery copy

### Home and back in every device mode

The back arrow and labelled Home button remain available in phone and computer interfaces, including older configurations that open directly to chat. They stay outside the app scroll area.

1. Open a device scene
2. Use the header back arrow or Home button
3. Choose Ember, Insta or Settings

### Texting controls only inside chat

Home, Insta and Settings no longer contain a second dialogue pane, reply choices or the texting keyboard. Reopen Ember to see conversation text and authored replies.

1. Advanced devices
2. Open Home or Insta in the preview
3. Open Ember to show messages and reply controls

### Separate story controls when browsing the phone

Authored opening actions such as continuing the story or choosing to open an app stay outside the handset while Home/feed is shown. Actual texting choices remain inside chat, and navigation does not advance unseen chat lines.

1. Play story
2. Browse the opening phone Home/feed
3. Use story actions outside the device or open Ember to text

### Add departure without replacing a project

A focused update button can add the missing departure to a copied project. It preserves custom café loops and creates a recovery copy instead of replacing the full project with a snapshot.

1. Editor
2. Project banner
3. Add missing café departure (shown only when the scene is absent)

## v2.2.0 — Dedicated devices and a flexible preview (2026-10-28)

[Source milestone 24935cf](https://github.com/shadmehr83/visual-novel/commit/24935cf)

### Advanced devices workspace

A full workspace groups phone and computer controls into Frame & placement, Timing, Appearance, Apps, and Dialogue & replies. Existing Home, Ember, Insta and Settings remain available.

1. Top tabs
2. Advanced devices
3. Choose a scene with a device
4. Select a settings section

### Independent device frame resizing

Width moves the right edge without changing height or drifting diagonally. Height moves the lower edge. Optional proportion lock scales both dimensions around a fixed upper-left corner.

1. Advanced devices
2. Frame & placement
3. Device width or Device height; enable Lock frame proportions when wanted

### Resizable and lockable preview window

Unlock and resize the entire game preview pane, not just its artwork zoom. Fill preview space gives the scene more height; lock saves that allocation while the dialogue editor uses the remainder.

1. Editor
2. Preview footer
3. Unlock window
4. Drag its lower-right corner or Fill preview space
5. Lock window

### Saved outfits in the dialogue panel

The original three clothing cards and inspect/confirm flow are preserved. The dialogue panel now has an Items & outfits tab and a direct shortcut to the saved wardrobe selection.

1. Editor
2. Items & outfits beside Dialogue
3. Open saved outfit selection; or Edit
4. Saved outfit selection

### Recover missing outfit cards without replacing a project

An explicit restore button adds missing demo cards and images while keeping existing custom cards, descriptions, backgrounds and dialogue routes.

1. Editor
2. Items & outfits
3. Restore missing demo outfits

### Additional items keep their own choice routes

New item cards create independent confirmation choices and direct uploads remain available. Enabling/disabling a picker retains its existing cards. Normal dialogue and device self-reply are kept.

1. Editor
2. Items & outfits
3. Add item for current dialogue
4. Upload image and choose its destination

### Full app preview and scrolling feed

Browse Home, Ember, scrolling Insta and Settings in the device workspace preview. Add custom app shortcuts and icons without altering story progression or removing the original apps.

1. Advanced devices
2. Apps
3. Enable full app system or Add app shortcut; browse using Preview app buttons

## v2.1.0 — After the café (2026-10-28)

[Source milestone 0aa0629](https://github.com/shadmehr83/visual-novel/commit/0aa0629)

### Separate rainy departure scene

The café goodbye, second-meeting choices and follow-up messages now continue in a separate scene after the café, preserving all branches and the original café visuals.

1. Editor
2. Scenes library
3. After the café; during playback choose Step outside after the café reflection

### Return to Maria’s phone chat

The departure plays through the existing phone interface. Maria’s follow-up is an incoming message with authored replies, and the ending closes the phone. Declining a second meeting still skips the follow-up.

1. Editor
2. Select After the café
3. Phone; Play story from the café to continue into the phone sequence

### Rainy pavement background

A new downward-looking illustration shows rain ripples on wet paving and warm reflected café light. It is embedded in portable project exports and leaves the café’s original background untouched.

1. Editor
2. Select After the café
3. Scene properties
4. Background

## v2.0.0 — Connected story workspace (2026-10-28)

[Source milestone 77b169e](https://github.com/shadmehr83/visual-novel/commit/77b169e)

### Scenes advanced

Move scene boxes, see their real exits, name routes and connect a dialogue branch to another scene.

1. Top tabs
2. Scenes advanced
3. Select a scene
4. Add a scene branch, or drag an output dot to a scene input

### Dialogue advanced

Arrange dialogue boxes and connect Continue, reply and timed-action paths. It edits the same project as the original editor.

1. Top tabs
2. Dialogue advanced
3. Choose scene
4. Drag a box heading or connect its output to another input

### Named routes

Label a branch Friendly route or Hostile route without changing the text shown to the player. Existing state actions and conditions survive reconnection.

1. Dialogue advanced
2. Click a route label or connecting line
3. Route name

### Graph navigation and saved layouts

Pan, zoom, search, fit all, focus a selection and auto arrange. Box coordinates travel with project exports and GitHub snapshots; moving a box does not change story order.

1. Scenes advanced or Dialogue advanced
2. Map toolbar
3. Find, Fit all, Focus selection or Auto arrange

### Top menu and workspaces

File, Edit, View, Effects and Instructions organise commands above the workspace. The original editor and its settings remain available.

1. Top menu
2. Choose a menu; switch back using the Editor tab

### Dock controls at the top

Keep controls above the stage, with an adjustable dock height. Left, right and floating placement still work.

1. View
2. Dock controls at top; drag the divider below the dock to resize

### Version history and feature directions

Browse every recorded milestone, search for a feature and open its current control location. Previous milestone numbers were assigned retrospectively from Git history.

1. Top tabs
2. Update history
3. Search or expand a release

## v1.15.0 — Simpler devices and safer playback (2026-10-28)

[Source milestone 16b90c1](https://github.com/shadmehr83/visual-novel/commit/16b90c1)

### Simple device timing

Show a device from one dialogue through another, with optional advanced individual overrides.

1. Top tabs
2. Advanced devices
3. Timing
4. Interaction timing
5. Simple start & end dialogues

### Stable app navigation and computer layout

Home, Ember messages, Insta and Settings share one device system. Opening an app does not advance dialogue. Choose the wider computer shape when needed.

1. Top tabs
2. Advanced devices
3. Frame & placement
4. Device shape
5. Computer / laptop

### Device Settings and custom apps

Change device-only wallpaper, font, colours and text size; upload icons and add shortcuts to built-in screens. The Settings app exposes device appearance during play.

1. Top tabs
2. Advanced devices
3. Appearance; during playback open Home
4. Settings

### Independent device self-reply

Allow custom replies in device dialogue separately from the normal dialogue overlay.

1. Editor
2. Select dialogue
3. Dialogue editor
4. Allow custom response in device dialogue

### Pause and Escape recovery

Pause controls, effect animation, sound and timed choices. Escape exits editor playtest; in the exported player it toggles pause. Render recovery avoids a permanently blank page.

1. Editor
2. Play story
3. Pause menu; press Escape to return to editing

### Separate docks

Show Effects & interactions beside Scene properties with independent scrolling.

1. Editor
2. Controls placement
3. Two separate docks

### Active layer switches

Toggle an effect for immediate comparison while retaining saved positions, masks and intensity values.

1. Editor
2. Scene properties
3. Active

### Direct item image upload

Add an item even without existing choices, then upload its picture directly. Item text and controls are larger.

1. Editor
2. Outfits & Items
3. Add item picker
4. Add item for current dialogue
5. Upload item image

### Outgoing scene effects

Choose the transition used when leaving a scene; it can override the next scene’s entrance.

1. Editor
2. Scene properties
3. Transitions
4. After this scene · exit effect

### Maria’s separate profile portrait

A new rainlit portrait keeps the café character’s style in a different composition. It can be imported into an existing local project without replacing that project.

1. Advanced devices
2. Appearance
3. Use Maria’s new profile portrait

### Clearer phone and lighting controls

Moved device placement into Phone, clarified chat-only versus app mode, and hid foreground overlays while placing lights so clicks reach the artwork.

1. Editor
2. Phone, or Light Library
3. Place lights on scene

## v1.14.0 — Scheduled screens and light favourites (2026-10-28)

[Source milestone 254cc74](https://github.com/shadmehr83/visual-novel/commit/254cc74)

### Hinge dialogue range

Choose the dialogue where a hinge starts and ends, then hide it or hold its final pose.

1. Editor
2. Cinematics
3. Expand a hinge
4. Restrict hinge to a dialogue range

### Same-scene app switches

Change the displayed device screen on authored dialogues without creating extra scenes. The old per-line schedule now lives under Advanced.

1. Top tabs
2. Advanced devices
3. Timing
4. Advanced dialogue screen schedule; for a range enable Advanced overrides first

### Phone home and offline feed

Functional back/Home buttons and a fictional scrolling feed accompany messages. Apps now use the names Ember and Insta.

1. Advanced devices
2. Apps
3. Device experience
4. Device with apps; in playback use the device Home button

### Individual light favourites

Save one lamp’s colour, radius and cycle, then reuse it with a click on the scene. The default loop is 0.5 → 1 → 0.5 at one second per step.

1. Editor
2. Light Library
3. Save individual light favourite; choose Placement preset
4. Place lights on scene

### Playback advance options

Choose Continue only, Enter key, or clicking the scene. Choices, forms and timed interactions still require their own input.

1. Editor
2. Play story
3. Advance story selector above the scene

### Named panels and specific help

Explicit Outfits & Items and Effect Presets names and control-specific hover explanations make tools easier to locate.

1. Editor
2. Effects menu
3. Choose a named panel; hover or focus a control

## v1.13.0 — Items, presets and authoring refinements (2026-10-27)

[Source milestone e5b7548](https://github.com/shadmehr83/visual-novel/commit/e5b7548)

### Item and outfit inspection

Show clothing, books or custom PNG items as foreground cards; inspect before confirming an authored choice, with optional background blur.

1. Editor
2. Outfits & Items
3. Add item picker
4. Add item for current dialogue

### Reusable rain, lighting and motion setups

Save whole categories or all scene effects as a named preset, then apply them in other scenes. Review copied masks against new artwork.

1. Editor
2. Effect Presets
3. Enter name
4. Choose category
5. Save; select a saved preset to apply

### Dialogue notes and deletion

Add private planning notes and delete an accidental node. Incoming links and related data are repaired; Undo restores the edit.

1. Editor
2. Select a dialogue
3. Author note or Delete dialogue node

### Numbered destinations

Next-dialogue and choice targets show scene and dialogue numbers with speaker/text context.

1. Editor
2. Dialogue editor
3. Next dialogue or a choice’s destination selector

### Exact slider values

Sliders have paired numeric fields for precise coordinates and repeatable settings.

1. Editor
2. Select an effect
3. Type into the numeric field beside its slider

### Fonts and character colours

Choose editor typography separately from story dialogue typography and character name colours.

1. View
2. Appearance
3. Interface appearance or Story typography & speaker colours

### Phone replies and proportions

Narrower handset proportions and self-reply alongside multi-choice replies improve phone playback.

1. Advanced devices
2. Frame & placement for size; Play story
3. Self-reply
4. Select authored path
5. Send

### Authored subtle environmental effects

Carefully masked rain, local lamp cycles, slight foliage motion and camera approaches were applied to earlier scenes. The café visuals were preserved.

1. Editor
2. Select bedroom, wardrobe or journey scene
3. Rain, Lighting, Motion or Camera

## v1.12.0 — Hinges and foreground devices (2026-10-27)

[Source milestone 6390bb2](https://github.com/shadmehr83/visual-novel/commit/6390bb2)

### Hinges and small joint motion

Select a region, place a pivot, then save position, rotation, scale and opacity poses on dialogue slides.

1. Editor
2. Cinematics
3. Add hinge
4. Select its region
5. Place pivot
6. Save poses on dialogues

### Expression replacement and foreground objects

Swap a selected region’s artwork or use a transparent foreground asset. Flat-image patches do not reconstruct hidden background.

1. Editor
2. Cinematics
3. Expand hinge
4. Choose source/replacement artwork and pose settings

### Pose and scene transitions

Choose cut, snappy, smooth, sliding or fading motion between poses and scene entrances.

1. Editor
2. Cinematics
3. Hinge transition; for scenes use Scene changes

### Device conversation interface

A styled phone/chat overlay supports authored message history, typing indicators, a decorative keyboard and phone or desktop shape.

1. Editor
2. Phone
3. Add phone system
4. Device placement & contact

### Custom replies and fullscreen

Self-reply expands only when requested and follows a selected authored path. Fullscreen enlarges playback.

1. Editor
2. Play story
3. Self-reply, or fullscreen button above the scene

### Maria and new opening artwork

Renamed the girl Maria and integrated matching bedroom, wardrobe and street art. The manually edited café was retained.

1. Editor
2. Scenes library
3. Select an opening scene; Characters lists Maria

## v1.11.2 — Reference archive (2026-10-27)

[Source milestone 282f111](https://github.com/shadmehr83/visual-novel/commit/282f111)

### Archived supplied image collection

Stored the supplied ZIP’s images together with an inventory and checksums for future art work. They do not automatically replace scene backgrounds.

1. GitHub repository
2. references
3. incoming
4. Reference inventory and archived files

## v1.11.1 — Opening and café reference board (2026-10-27)

[Source milestone 5359105](https://github.com/shadmehr83/visual-novel/commit/5359105)

### Recorded visual reference

Saved the supplied opening/phone/café mood reference for later use without applying it to the final café image.

1. GitHub repository
2. references
3. incoming
4. Supplied visual reference

## v1.11.0 — The First Match story adaptation (2026-10-27)

[Source milestone d0ca7ec](https://github.com/shadmehr83/visual-novel/commit/d0ca7ec)

### Scripted opening and café routes

Adapted the story bible into linked opening and café dialogue, with invitation choices, boundaries, observations and multiple endings.

1. Editor
2. Scenes library
3. Select a scene
4. Dialogue; use Play story to follow a route

### Mood-matched placeholder scenes

Opening scenes received backgrounds matching the mood brief, ready for later replacement. Original café artwork and effects were protected.

1. Editor
2. Select an opening scene
3. Scene properties
4. Background

### Source and implementation notes

Kept extracted document sources and the story mapping alongside the project.

1. GitHub repository
2. docs
3. story
4. IMPLEMENTATION.md and source documents

## v1.10.1 — Portable authored checkpoint (2026-10-27)

[Source milestone 35de011](https://github.com/shadmehr83/visual-novel/commit/35de011)

### Uploaded project saved in GitHub

Published the uploaded checkpoint with original embedded artwork, lighting, rain, motion and camera settings for retrieval from another computer.

1. Editor
2. File
3. Open project for your exported JSON; Load GitHub snapshot loads the committed checkpoint

## v1.10.0 — Unified selection and brush tools (2026-10-27)

[Source milestone d9e1e5a](https://github.com/shadmehr83/visual-novel/commit/d9e1e5a)

### Brush and eraser

Paint or remove affected pixels with a circular brush and adjustable radius. Each stroke supports Undo.

1. Editor
2. Edit a rain, local light, motion or hinge region
3. Selection tools
4. Paint brush or Eraser

### Locked outer boundary

Lock a polygon/automatic selection, optionally empty its inside, then paint only within it for precise masking.

1. Editor
2. Region selection
3. Lock selection as outer boundary
4. Start empty inside boundary
5. Paint brush

### Shared wand and edge tools

One toolbar offers Polygon, Colour wand and Snap to edges for all region effects. Strict/Broad reach presets simplify tolerance; selection is local image processing, not semantic AI.

1. Editor
2. Region’s Edit selection / brush
3. Selection tools
4. Choose tool and Selection reach

## v1.9.1 — Dialogue layout refinement (2026-10-27)

[Source milestone 9232d40](https://github.com/shadmehr83/visual-novel/commit/9232d40)

### Expanded page dialogue editing

Switching between pinned, full-page and hidden dialogue modes properly expands the editing area.

1. View
2. Layout
3. Dialogue layout
4. Full page scrolling or Pinned scrolling panel

## v1.9.0 — Camera depth and workspace comfort (2026-10-27)

[Source milestone 2df1e97](https://github.com/shadmehr83/visual-novel/commit/2df1e97)

### Camera approach and walking movement

Animate a zoom/focal approach with optional bob and sway to suggest walking toward a point.

1. Editor
2. Camera
3. Enable camera
4. Set focal point, zoom, duration, bob and sway

### Footsteps

Use generated placeholder steps or imported audio with a camera move. Playback sound must be enabled explicitly.

1. Editor
2. Camera
3. Configure footsteps; Play story
4. Enable scene sound

### Resizable and collapsible workspace

Collapse the story library, resize panels, change preview zoom and choose pinned/page/hidden dialogue layouts.

1. View
2. Layout, or drag a panel divider; use Hide story for extra preview room

### Themes and panel colours

Choose dark, light or warm editor themes and customise each panel background independently.

1. View
2. Appearance
3. Interface theme and panel backgrounds

### Delayed descriptive hover help

Hover or focus a control to see its explanation; help can be disabled in Appearance.

1. View
2. Appearance
3. Delayed hover help

### Effect activity count

A count above the workspace opens a list of configured visual effects; it is not a GPU performance measurement.

1. Top menu
2. Effects count, or Scene properties
3. Active

## v1.8.0 — Dockable controls and selective motion (2026-10-26)

[Source milestone bf8b8f2](https://github.com/shadmehr83/visual-novel/commit/bf8b8f2)

### Independent scrolling controls

The inspector and dialogue area scroll without pushing the scene out of view. Named effect panels shorten long control lists.

1. Editor
2. Effects menu
3. Choose Rain, Lighting or Motion

### Left, right and floating docks

Place or drag the control window around the editing workspace while keeping the stage visible.

1. View
2. Dock controls left/right or Floating controls; use Drag window when floating

### Selected-area lighting without a radius

Illuminate only a chosen mask to add depth instead of relying on circular falloff.

1. Editor
2. Lighting
3. Local light
4. Light coverage
5. Selected area only (no radius)

### Wind and cloth / foliage motion

Apply gentle sway and distortion inside a drawn or automatically selected region. It is a small 2D displacement, not physical cloth simulation.

1. Editor
2. Motion
3. Add motion zone
4. Select region
5. Set strength, direction and cycle

## v1.7.0 — Multiple effect zones and project publishing (2026-10-26)

[Source milestone 4df4a84](https://github.com/shadmehr83/visual-novel/commit/4df4a84)

### Multiple rain regions

Create independent named rain zones with polygon or approximate colour-wand selection; enabled regions combine into the weather mask.

1. Editor
2. Rain
3. Add rain zone
4. Draw or select its area

### Global and local lights

Use whole-scene illumination or local lights with their own position, radius, colour and animated intensity.

1. Editor
2. Lighting
3. Add global light or Add local light

### Dedicated affected light areas

Constrain light to a face, arm or object with a selected region; spread can change the local footprint with its intensity cycle.

1. Editor
2. Lighting
3. Local light
4. Add dedicated affected area
5. Draw or use selection tools

### Custom normal dialogue replies

Allow an expandable Self-reply on authored non-choice dialogue without changing narrative state automatically.

1. Editor
2. Dialogue
3. Allow custom response in normal dialogue; Play story
4. Self-reply

### Hide dialogue while editing

Move the dialogue overlay out of the preview to see and edit the full background.

1. Editor
2. Hide dialogue above the scene; click Show dialogue to restore it

### Complete project saves and optional publisher

Save portable JSON with assets and all effects; an optional authenticated server publisher can update only the project snapshot in GitHub.

1. File
2. Save project, or Editor
3. Save
4. Publish directly to GitHub

## v1.6.1 — Snapshot recovery (2026-10-26)

[Source milestone adfd600](https://github.com/shadmehr83/visual-novel/commit/adfd600)

### Open committed café with local recovery

Loading the GitHub snapshot selects the preserved café and keeps a recovery copy of different local work.

1. Editor
2. Load GitHub snapshot; Restore previous local project returns to the recovery copy

## v1.6.0 — Cross-device project checkpoint (2026-10-26)

[Source milestone 6c45162](https://github.com/shadmehr83/visual-novel/commit/6c45162)

### Embedded exported project in GitHub

The committed project snapshot includes uploaded backgrounds and authored effects. Website code updates and browser-local edits remain separate.

1. Editor
2. Load GitHub snapshot; to move newer local edits use File
3. Save project and Open project on the other device

## v1.5.0 — Editable light intensity loops (2026-10-26)

[Source milestone 4d8d93e](https://github.com/shadmehr83/visual-novel/commit/4d8d93e)

### Loop intensity sequence

Enter a repeating list of intensity multipliers with smooth fades and seconds per step. Reduced motion holds the base light intensity.

1. Editor
2. Lighting
3. Loop lighting
4. Intensity sequence
5. Apply light sequence

## v1.4.0 — Café ambience (2026-10-26)

[Source milestone d9a4aa3](https://github.com/shadmehr83/visual-novel/commit/d9a4aa3)

### Subtle flicker and selected motion

Introduced lamp variation and gentle plant/person shading motion in the café checkpoint, preserved as authored visual settings.

1. Editor
2. Select café
3. Lighting or Motion
4. Inspect its existing zones

## v1.3.0 — Hosting and AI handoff (2026-10-26)

[Source milestone 0a63b09](https://github.com/shadmehr83/visual-novel/commit/0a63b09)

### Project and hosting documentation

Collected engine/source/download links, deployment steps and AI setup. AI still needs its server-side provider configuration.

1. GitHub repository
2. docs
3. AI_SETUP.md and DEPLOY_CLOUDFLARE.md; for the in-app helper use Assistant

## v1.2.0 — Single-file local studio (2026-10-26)

[Source milestone 4feca74](https://github.com/shadmehr83/visual-novel/commit/4feca74)

### Offline HTML editor

Download a self-contained studio and open it in a browser. Local authoring works without hosting; remote AI still needs the configured server.

1. File
2. Download local editor
3. Open the downloaded HTML in a browser

## v1.1.0 — AI, sound and interactive playback (2026-10-26)

[Source milestone b36af25](https://github.com/shadmehr83/visual-novel/commit/b36af25)

### Provider AI assistant

Ask for supported scene/dialogue/effect edits, review the proposal and apply or reject it. Requires Cloudflare server-side secrets for online requests.

1. Editor
2. Assistant (sparkle icon)
3. Enter studio password
4. Ask AI
5. Review proposal

### Voice input and read-aloud

Dictate a request with browser speech recognition and optionally read proposals aloud. Microphone support and permissions depend on the browser.

1. Editor
2. Assistant
3. Speak your request
4. Review transcript before sending

### Sprites and expressions

Import and place character sprites, select expressions, and author sprite keyframes.

1. Editor
2. Tools (speaker icon)
3. Sprites and keyframes

### Audio tracks

Import scene music/ambience and set looping and volume. The player explicitly enables sound.

1. Editor
2. Tools
3. Audio
4. Import audio; Play story
5. Enable scene sound

### Timed choices / QTEs

Author timed prompts with success and timeout dialogue destinations and accessibility controls.

1. Editor
2. Select a dialogue
3. Tools
4. Timed interaction / QTE

### Standalone playable export

Export the authored story and embedded assets as a playable HTML file without an AI dependency.

1. File
2. Export playable HTML
3. Open the downloaded game in a browser

## v1.0.0 — Stillframe studio foundation (2026-10-26)

[Source milestone 24b4a6e](https://github.com/shadmehr83/visual-novel/commit/24b4a6e)

### Scene and dialogue editors

Create and edit scenes, lines and reply branches using the original list-based editor.

1. Editor
2. Scenes library
3. Select a scene
4. Dialogue panel

### Backgrounds and asset library

Import artwork, fit and position it, and retain original embedded images in complete project files.

1. Editor
2. Scene properties
3. Background
4. Import background; Assets opens the image library

### Atmosphere, lighting and rain

Adjust grading, tint, soft light, weather, vignette and the original rain mask with live preview.

1. Editor
2. Scene properties
3. Atmosphere; use Effects
4. Lighting or Rain for related tools

### Characters, narrative state and observations

Maintain character notes, variables, conditional choices and authored interpretations of clues.

1. Editor
2. Characters or State in the library; Dialogue
3. State & clues shows runtime values

### Playtest and event history

Play the authored branches and inspect the recorded choice/transition history separately from software update history.

1. Editor
2. Play story; View
3. Playthrough event log

### Autosave, undo, project import and export

Browser autosave retains work on this device; complete project JSON moves it between devices. Undo/Redo reverses edits.

1. File
2. Save project or Open project; Edit
3. Undo or Redo

### Cloudflare web delivery

A built static package makes the studio available over HTTPS. Git-connected Pages deploys main automatically once configured.

1. Internet browser
2. Open visual-novel-8b9.pages.dev; hosting instructions are in docs/DEPLOY_CLOUDFLARE.md

