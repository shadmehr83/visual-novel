# Stillframe 2.8 — windows, effect shortcuts and studio search

## Active layers open their settings

Under **Scene properties → Active**, click an effect's **name** to open its controls. The checkbox next to it only enables or disables the layer. Opening settings keeps the enabled state unchanged.

Falling rain and glass streaks open Rain; grading, tint, light cycles and named lights open Lighting; wind zones open Motion; foreground hinges open Cinematics. Camera, device, item and keyframe entries open their corresponding tools. Named layers scroll to their own settings, and the destination receives a temporary highlight.

## Pop out and restore panels

A small **Pop out** icon and a **Move** menu appear in panel title bars. They are available for the story library, controls, scene preview, dialogue editor and both workspace panes. When **Two separate docks** is enabled, Effects and Scene properties also get independent controls.

**Pop out** makes a resizable floating window inside the studio. Drag its title bar to move it, or resize from the bottom-right corner. The icon changes to **Restore**. Restore returns to the last dock; if another panel occupies that dock, it selects another available edge or the original position. **Move → Original position** returns directly to the built-in layout.

The title-bar **Move** menu offers Original position, Floating window, Dock left, Dock right, Dock top, Dock bottom and Split beside workspace. The dialogue editor can use all of these positions, including its own split column beside the scene. Text, choices, notes, items and state remain connected to the same project.

Use **Windows & docking** above the workspace, or in Project settings, to choose placements for all panels and recover hidden or off-screen windows. **Restore all window positions** restores the original docks without changing the story or artwork. Window positions and sizes are local workspace preferences saved in this browser. Playback temporarily returns panels to their normal places; editing restores the chosen floating layout.

## Snap while dragging

Drag a title bar near an edge of the workspace. A snap overlay highlights the destination. Release to dock there, or drop onto the Split view target to give the panel a separate column. Escape cancels the drag. The Move menu offers the same destinations without dragging.

Existing **Split view** still provides two synchronized editor/map/device workspaces, with a divider and side-by-side or stacked layouts. Either workspace can also float independently.

## Search the whole studio

Press **Search features** in the main header, or **Ctrl+K** / **Command+K**. Search named features, settings, scene names, authored dialogue, artwork and current effect layers. Mounted controls also contribute their labels, so particular sliders can be found directly.

Select a result to open its workspace or setting. Requested controls scroll into view and receive a highlight. Searching for an effect opens its settings; it does not toggle the effect. Arrow keys select a result, Enter opens it, and Escape closes search. Search is local and uses no AI/API connection. It is available while editing.

New title-bar icons, docking choices, split selectors, search controls and results include delayed, specific hover descriptions. Hover briefly to read them; delayed help can be disabled under Interface appearance.

## Packaging

The hosted engine, browser saves and project exports retain the original image bytes. The downloadable single-file editor uses lossless gzip for its code to remain below Cloudflare Pages' 25 MiB asset limit. A current Chrome, Edge, Firefox or Safari decompresses it locally with native DecompressionStream support; no extra service or network request is required. Its embedded standalone story player remains available for offline export.
