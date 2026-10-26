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

## Pinned workspace and panel placement

On desktop, the app fits the viewport. The inspector, story/assets library and bottom dialogue editor scroll independently; creating more effects no longer pushes the scene off the page. Collapse the bottom dialogue editor for more stage space. Use the inspector's **Rain**, **Lighting**, **Motion**, **Save**, or **All** panel buttons to shorten the controls you are working with. These are separate views in one inspector window.

**Controls placement** supports right dock, left dock, and a floating window. In floating mode, use **Drag window** to position the inspector; **Reset panels** beside the scene breadcrumb returns it to the right. Placement is local UI state and does not change the authored project. On narrow screens the inspector uses a bounded scrolling section instead of an overlapping floating desktop window.

## Selective depth light without a radius

For a local light, choose **Light coverage → Selected area only (no radius)**. Use **Draw region** or **Magic wand** to define the affected area. That entire shape receives the light intensity, colour and cycle without a circular falloff. This supports selective bright areas and depth against darker global illumination. **Soft radial light** retains the prior radial/expanding behavior and can also be clipped to a selected area. The light wand and rain wand use the same local connected-colour selection; neither is semantic object recognition.

## Wind and cloth / plant motion

Open **Motion → Add motion zone**. Draw the area or select it with **Magic wand**, then **Finish zone editing**. Set sway strength (0–20 scene pixels), seconds per cycle, direction, and additional ripple distortion (0–15). Motion zones are independent and saved with the complete project JSON and published snapshot; they also render in the standalone editor and player. Existing original image files remain unchanged.

The renderer displaces/offsets the underlying background and sprite pixels inside a fixed selected region. It simulates subtle 2D cloth or plant motion; it is not 3D cloth simulation, object extraction, hidden-background reconstruction, or a semantic selection model. Multicoloured objects may require a polygon or several regions. Small motion strengths reduce edge artifacts. Reduced effects or the system reduced-motion preference pauses motion; disabling a motion zone or Disable all effects removes its contribution. The animation loop is cleaned up on scene change/unmount.

## Unified selection tools and confined painting

Choose **Edit existing rain selection**, **Edit selection / brush**, Draw region, or Magic wand on any named rain/local-light/motion region. The shared **Selection tools** toolbar appears in the inspector and keeps the scene visible. Its target selector switches between region-based effects; global illumination and camera framing remain whole-scene operations.

Tools in that single toolbar:
- **Polygon:** add vertices for an outer or affected area.
- **Colour wand:** select pixels connected to the clicked colour.
- **Snap to edges:** locally grow a connected region until stronger neighbouring colour boundaries are encountered. This is approximate image processing, not a semantic AI object model; gradients/open boundaries can leak.
- **Paint brush:** drag a circular brush to add affected pixels. Radius uses scene pixels, scales with the background transform and has a visible cursor.
- **Eraser:** remove affected pixels with the same radius control.

Selection reach presets replace numeric tolerance as the main automatic-tool control: Strict stays closer to the clicked colours/boundaries; Broad includes more differences and may select too much. Nothing changes in the original artwork and no image is uploaded for these tools.

For fine tuning without overpainting: draw/select an outer region → **Lock selection as outer boundary** → optionally **Start empty inside boundary** → paint the desired affected areas. Brush additions and erasing stay inside the locked boundary. The dashed blue outline shows the limit. Automatic results are clipped to the same boundary. Unlock removes the restriction; Clear affected area empties the mask while retaining the boundary. Painting uses a bounded-resolution local raster mask converted into portable numeric SVG paths. Very detailed selections are rejected with guidance rather than silently dropping data. Each completed stroke is one undoable edit; a cancelled pointer stroke is discarded.

Masks and locked boundaries are included in project JSON, browser saves, published snapshots and standalone exports. Shapes are binary affected areas, not an opacity-painting or semantic segmentation system. Use the existing light/rain intensity and opacity controls for effect strength. Complex multicoloured objects may need a polygon or brush correction.
