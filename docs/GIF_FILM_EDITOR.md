# GIF film editor and transition timing

Open **Scenes advanced**, select a scene and click its background thumbnail in **Background sequence**. GIF thumbnails open the film editor below the cards and widen the right panel. Drag the vertical divider, use **Panel width**, or click **Compact panel** to resize it. Width is remembered in this browser; story settings are saved with the project.

## Work with the film

The large preview, frame strip and playhead show the original GIF. Drag the playhead or type **GIF preview time (seconds)** to pause at an exact moment. **Play GIF preview**, **Pause GIF preview**, **First frame** and **Last frame** only control this editor preview. Previewing does not change a saved dialogue or the player's story position.

Default playback belongs to this view, independently of other sub-scenes using the same asset:

- **Loop** repeats the whole GIF.
- **Play once, then hold** runs from the start time to the end, then holds the last frame or the chosen hold frame.
- **Paused / still frame** holds the selected frame until a dialogue cue starts it.
- **GIF speed multiplier** accepts 0.01–16. `1` is normal speed, `0.1` is ten times slower, `0.01` is one hundred times slower, and `2` is twice as fast. The full-cycle playing time is shown below.
- **GIF start time** chooses where the first playback begins. Later loops repeat the whole source GIF.
- **Choose a specific frame to hold** exposes **GIF hold time**. This is a source-frame position, not a delay or a maximum playback length.

All frame positions use seconds in the **original GIF**, independently of speed. If a source frame is visible from 0.2s to 0.5s, seeking to 0.3s shows that frame; it does not create an interpolated frame. Values beyond an imported GIF's end are clamped to its final frame during playback.

## Trigger a blink once, then hold

1. Select the GIF background card.
2. Set default playback to **Paused / still frame** and choose a natural resting frame with the playhead and hold-time field.
3. Under **Dialogue cues on this film**, choose the dialogue that should trigger the blink.
4. Seek to its starting frame and click **Play one cycle at dialogue**. Set the cue's speed if needed.
5. Select **Choose frame after this cycle** and enter the resting frame's source time, or let it inherit the view's hold frame.

The cue runs when that dialogue is entered. It does not advance the dialogue. Later dialogues on the same view keep the held frame unless another cue changes playback. Revisiting the trigger along a story route triggers it again. Changing backgrounds or re-entering a view resets that view to its defaults before applying its dialogue cue.

**Pause here at dialogue** freezes the selected frame when that dialogue begins. **Play from here at dialogue** starts a loop there. **Resume** without an exact cue time continues from the current frame. Turn off **Use an exact source time** for a pause that should freeze whichever frame is playing at dialogue entry. No cue leaves playback alone.

Saved cues appear as numbered markers under the film playhead and in a cue list. Click a marker to select its dialogue and inspect the source frame. **Preview selected dialogue cue** rehearses it in the editor.

## Set transition times

Each scene's main card has its entrance, exit and **Return to main view** transition. Each sub-scene card has its own transition and editable duration directly under it. Type exact seconds, from 0.05 to 120. Cut and snappy are immediate; smooth, fade and slide use the duration.

In the GIF editor, **Selected dialogue** can override that view's transition for one dialogue. The same override is available in **Dialogue advanced → Image for this dialogue → Dialogue view** for still images as well. Leave it on **Use view / scene default** to retain the normal transition.

A dialogue override takes priority; on a main-scene change the outgoing scene's explicit exit otherwise takes priority over the incoming scene/view default. Returning from a sub-scene to the main view uses the main card's return duration, replacing the formerly fixed 0.45-second return.

Transition duration controls the visual change, not GIF playback speed, dialogue reading time or automatic dialogue advancement.

## Save and play elsewhere

Defaults, dialogue cues and transition settings autosave with your local project and are included in complete project JSON and playable HTML exports. The original GIF bytes are retained. Preview playheads and inspector width are editor preferences, not story data. Use the existing complete-project export/publish process to carry your work to another device.

The studio, offline editor and exported player use the same controlled GIF renderer. The pause menu freezes it. Reduced-effects / reduced-motion settings hold animation (using the saved poster when available); they do not replay rapid native GIF animation in the background. The decoder observes frame delays and disposal patches. Large GIFs remain subject to the existing 15 MB import and 32-megapixel image limits, plus a 10,000-frame playback limit.
