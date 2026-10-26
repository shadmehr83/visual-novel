# Camera depth, workspace sizing, appearance and help

## More room for the scene

- **Hide story / Show story**, above the preview, collapses or restores the story/assets library. The icon rail remains usable and selecting a library category reopens it.
- Drag the library's edge to choose its width. Drag the divider above the dialogue panel to choose its height. Dividers support keyboard arrows as well as pointer/touch input.
- Open **Layout** above the scene (or the **Workspace** inspector tab). Adjust story width, controls width, dialogue height and **Editor preview zoom**. Preview zoom is only an inspection preference; it is independent of the authored story camera. An enlarged preview scrolls inside its own scene view.
- **Dialogue layout → Pinned scrolling panel** keeps the fitted scene and independent panel scrolling. **Full page scrolling** restores a long document where you can scroll down through dialogue/settings. **Completely hidden** removes the entire bottom panel; reopen Layout to restore it. The existing Collapse/Expand button still supports a compact tab bar.
- Rain, Lighting, Motion, Camera and Save remain separate control views. The inspector still docks left/right or floats and drags. Window position is kept within the viewport when its width or the browser size changes. Reset panels returns to the right.

Workspace sizes, layout mode, theme, panel colours and help preference are small browser-local UI settings. They are not part of the authored novel and do not change the scene artwork. Complete project files still contain backgrounds, dialogue and scene effects/camera data. Float behavior is a desktop feature; narrow screens use bounded scrolling controls.

## Depth / camera effect

Open **Camera → Enable camera**. Set the focal point X/Y, target zoom (1–3×), approach duration, walking bob, horizontal camera sway and footstep interval. Zoom/pan smoothly approaches a target and holds the final frame. Bob/sway gently fade in and out over the approach. Cropping is constrained to the source frame with slight overscan for movement. This is a 2D camera effect, not generated room geometry or a complete cinematic transition sequencer.

For a closet approach, select a room background, choose the closet's scene coordinates as the focal point, use a moderate zoom and several seconds of approach, then small bob/sway amounts. **Replay camera preview** restarts the editor preview. Starting play or entering a new scene restarts the appropriate stage clock. Camera preview goes neutral while drawing masks/regions so selection coordinates remain correct. Reduced effects or the system reduced-motion preference applies the final framing without animated zoom/bob.

**Generated footsteps** provides a simple synthetic soft step. You can instead select a recording imported in Audio. Set footstep volume, then the player must explicitly choose **Enable scene sound**. Steps follow the approach timing and stop after its duration; sounds are not activated by merely opening the editor. Browser audio permission/autoplay rules can still require a retry. Generated sound is a convenience placeholder; use original licensed recordings for final production audio.

Camera data is included in project JSON, GitHub project snapshots, browser saves, and standalone player/editor exports. The optional AI helper can propose camera changes through the same locally validated approval/undo workflow. It cannot use camera commands to change protected narrative state.

## Delayed explanations

Keep the pointer over a main button, range or other control for about 0.7 seconds to see a small descriptive box. Keyboard focus also opens help. Escape, moving away or scrolling dismisses it. Camera help includes a small focal-frame diagram. Password/file-picker fields are excluded. The descriptions use the control labels, not the user's private field values. Disable **Delayed hover help** under Appearance if desired.

## Appearance and enabled effects

Open **Appearance** above the scene or in the inspector. Choose Dark, Light or Warm paper. Set individual backgrounds for the library, controls, dialogue editor and workspace; text contrast adjusts for each custom background. Reset a panel to follow the global theme. These controls do not tint or recolour the story image.

The **N effects** button above the scene opens an enabled-effects list. It counts configured visual layers/zones, not individual particles or measured GPU cost. It identifies paused visual motion where reduced effects/motion is active, and separately reports configured sound tracks/footsteps; audio still needs player consent. This is an authoring summary, not a live performance profiler.

## Checks and limits

Tests cover camera interpolation/bounds and reduced motion, project roundtrips and audio references, AI camera proposals, preference validation, panel collapse/drag/keyboard resizing, pinned/page/hidden modes, theme/colour persistence, delayed help, camera replay/persistence, effect counting and consented synthetic audio scheduling. Browser tests run headlessly; the synthetic audio path is exercised, but final sound quality and real-device readability still need human review. No live hosting or paid AI success is inferred from these local checks.
