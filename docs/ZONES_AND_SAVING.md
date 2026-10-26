# Regions, light zones, custom replies and reliable project files

## Rain zones and automatic selection

In Atmosphere → Effect zones, choose **Add rain zone**. An existing legacy window polygon becomes **Original window** so the authored mask is preserved. Click stage points to draw each polygon and choose **Finish zone editing**. Rain renders in the union of enabled named regions; a disabled or unfinished region contributes nothing. Falling rain and glass streaks share these regions and existing weather parameters. The legacy polygon/invert controls remain compatible.

**Magic wand** replaces the selected region with a local connected-colour selection around your click. It requires an imported background. Adjust tolerance to include more or fewer similar pixels. It is an approximate, bounded-resolution flood-fill tool, not semantic AI/object recognition. Selection uses the original pixels and correct cover/contain/stretch mapping; it follows the background position and scale. No artwork is uploaded or changed. Very complex selections are rejected with guidance to reduce tolerance or use polygons. Clear, redraw, remove points and editor Undo support corrections. Manual polygon editing is available independently of AI credentials.

## Global and local illumination

**Add global light** creates a whole-scene illumination multiplier. Multiple enabled global lights combine multiplicatively. Brightness zero darkens the base scene. Each zone has an independent smooth intensity sequence and timing.

**Add local light** creates a coloured soft light with position, radius, intensity and spread. It brightens underlying background/sprite detail through a radial mask and screen compositing. It can illuminate a face/arm while global illumination is low. These are 2D compositing effects, not physical 3D lighting.

Use **Add dedicated affected area**, then draw or use the wand to confine the light to a face, arm, candle-side surface or other selected area. The radial light is clipped to that area. **Use radial area only** removes the restriction. Each local zone supports its own cycle. The spread parameter expands/contracts the radial footprint as the cycle changes; intensity zero removes that contribution. Reduced motion/effects pauses cycles at their base values. Existing single-light controls and old projects remain compatible.

## Dialogue

**Hide dialogue / Show dialogue** beside the stage moves the dialogue overlay out of view while editing without deleting any text. Region editing also hides it so clicks reach the artwork. Playing shows dialogue normally.

During non-choice dialogue, the player can write and send a custom response alongside Continue. The author can disable this per dialogue using **Allow custom response during non-choice dialogue**. Replies are recorded in local playthrough responses/event history and advance the authored next transition. They do not override authored choices, set flags or automatically generate an NPC response. Standalone player exports include this feature. Choice nodes and QTEs keep their existing authored mechanics.

## Saving

The header save icon now opens a clear project-file save panel. A complete JSON includes original backgrounds/audio and all scene effects; browser autosave alone stays on the current device. File-system saving reports success only after the write/close completes; cancellation and errors are shown. Where the browser does not support a file picker, the app requests a download and tells the user to retain it.

See ../projects/README.md for uploading the project independently of the engine, or enabling the optional authenticated one-button publisher. The GitHub project snapshot moved from `src/saved-project.json` to `projects/published.stillframe.json` without changing the existing authored artwork or settings. Deployments package that file into the normal and single-file editors. A source push and a browser save are different operations; neither transfers uncommitted browser storage automatically.
