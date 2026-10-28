# Stillframe 2.0 — advanced workspaces and named releases

The top workspace tabs are **Editor**, **Scenes advanced**, **Dialogue advanced**, and **Update history**. The original editor and every existing scene setting remain available. All views edit one project and share Undo/Redo; there is no separate graph-only copy of the story.

## Version numbers and update history

The engine now identifies itself as **Stillframe v2.0.0**. Engine versions are separate from the project file's `schemaVersion: 1`, which remains compatible with older project exports.

**Update history** lists the recorded repository milestones, including the original studio, AI/voice/audio/QTEs, local HTML, project snapshots/recovery, rain/light zones, wind, camera, brush tools, story adaptation, reference archives, hinge/device tools, items/presets, phone scheduling/favourites and device simplification. Earlier version names were assigned retrospectively from their source commits; they were not version labels displayed in those old builds. Dates are shown in Australia/Sydney time. Each feature has directions to its *current* location, and supported entries have an **Open feature location** shortcut. The searchable history is also available as [CHANGELOG.md](CHANGELOG.md).

The existing **Event log** records choices and transitions during a playthrough. It is intentionally separate from engine update history.

## Scenes advanced

1. Open **Scenes advanced**. Each scene is a box. A line represents an authored reply targeting another scene; scenes are not implicitly connected just because their boxes are adjacent.
2. Drag a box by its heading to arrange it. This saves its graph coordinates but does not change scene order or the starting scene.
3. Click a scene to select it. **Edit dialogue flow** or a double-click opens that scene's dialogue map. **Edit background & effects** returns to the original editor.
4. In **Add a scene branch**, choose the source dialogue, enter the reply the player sees, optionally name the route (for example Friendly route), select its destination, and press **Add branch connection**.
5. Alternatively, drag a scene's **New scene route** output dot to another scene's input dot. Its default source is the last available terminal dialogue. Use the form when you need a specific source dialogue.
6. Click a route label or line to edit its name, player reply or destination, or remove it. Removing a reply also removes its linked item-picker entry; Undo restores both.

Route names are author-facing labels. They do not appear as new story text and do not set friendly/hostile state automatically. Existing actions and conditions are retained when reconnecting a branch. The original editor remains the place to edit their state actions.

## Dialogue advanced

Choose the scene in the toolbar. Each dialogue box shows its speaker, a text preview and its outputs. Dashed scene destination boxes let a reply leave the current scene.

- **Move:** drag a box heading. A focused heading also moves with arrow keys; Shift moves farther. One completed drag is one undoable layout change.
- **Connect:** drag an output dot to an input dot. For precise or keyboard use, click an output then click the destination input. Escape cancels an unfinished connection.
- **Continue:** reconnects a non-choice dialogue to another dialogue. Connecting Continue to a scene creates one explicit Continue reply, because existing scene changes are authored choices.
- **Replies:** each reply has its own output. Reconnecting changes its destination while retaining its text, route name, actions and condition.
- **Timed events:** success and timeout outputs must point to dialogues in the same scene. To leave the scene, put a scene reply on their destination dialogue. Timed events keep both required paths.
- **Edit:** select a box to change its speaker, text or private note. **All dialogue settings in original editor** opens that same line in the original editor, including state/action and device settings.
- **Add:** **Add dialogue box** creates an unconnected line; connect it deliberately. **Add a reply branch** preserves any existing Continue route as a reply when adding the first alternative.
- **Delete:** **Delete selected dialogue** uses the existing deletion/repair logic. At least one dialogue stays in each scene. Undo restores a deletion.

Moving a box never rewrites a story link. Unconnected boxes can be unreachable. A dialogue with no next destination, replies or timed event ends the story exactly as it does in the original editor; it does not automatically jump to the next numbered scene.

## Map navigation and saving

Drag empty map space to pan. Scroll/trackpad movement pans; Ctrl or Command plus wheel zooms around the pointer. Toolbar buttons zoom, fit all boxes, focus the current selection or automatically arrange them. **Find** searches titles, speakers and dialogue text and centres a chosen result.

Positions are stored in the project's optional `flowLayout` field, separately for the scene map and each dialogue map. They survive browser autosave, complete JSON export/import, a committed project snapshot and standalone studio exports. Player exports ignore layout coordinates for playback. Merely saving in the browser still does not upload a project to GitHub.

New scenes inherit the selected background/effect setup while clearing dialogue-bound device schedules, hinge poses and item mappings; these cannot refer to dialogues that do not exist in the new scene.

## Top menus and docking

- **File:** save, open, export JSON, export a playable game or download the local HTML studio.
- **Edit:** Undo/Redo and the original dialogue editor.
- **View:** layout, appearance, story library, backgrounds, playthrough event log and control placement.
- **Effects:** jump to the named rain, lighting, motion, cinematics, items, phone, favourites, presets, camera or save panel; Active opens effect switches.
- **Instructions:** find a feature in update history, open advanced maps, or access the existing AI helper and project settings.

**View → Dock controls at top** adds a fourth placement beside left, right and floating. The **Controls placement** selector also has **Dock top**. Drag its lower divider, or focus the divider and use arrow keys, to resize its height. Top docking works with either a combined inspector or two separate docks. Its placement and height are local workspace preferences, not scene effects.

The final café scene, its background asset and authored visual effects are preserved by this engine update.
