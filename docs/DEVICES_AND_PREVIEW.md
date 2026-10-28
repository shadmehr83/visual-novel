# Stillframe 2.2 — devices, saved outfits and preview sizing

The earlier scene/dialogue maps and all original story controls remain available. The published project retains its three outfit images, item picker, self-reply, Home, Ember messages, Insta feed and device Settings. The rainy departure scene from 2.1 is included too.

## Advanced devices

Open the **Advanced devices** workspace tab, or **Editor → Phone → Open advanced devices**. Choose an existing device scene or add a phone/computer to the selected scene. The workspace has five sections:

- **Frame & placement:** device shape, independent width/height and upper-left X/Y coordinates, optional proportion lock, contact/status/portrait, typing delay, entrance and decorative keyboard.
- **Timing:** simple dialogue start/end range, default screen, notifications and optional per-dialogue advanced screen switches.
- **Appearance:** device-only wallpaper uploads, background/text colours, font and size, plus the saved Maria profile portrait.
- **Apps:** keep the full Home/Ember/Insta/Settings interface, or explicitly choose messages-only. Custom named/icon shortcuts open an existing built-in screen. Adding a shortcut never removes the existing apps.
- **Dialogue & replies:** edit the selected line and its independent device self-reply preference, or jump to the original editor for all choices/state settings.

The left preview is interactive: open Home, browse messages, scroll Insta, and open Settings. Preview app buttons do not rewrite the authored schedule. Story choices and Self-reply run in **Play story**, not this authoring preview. Phone and computer share the same apps; Insta remains a fictional offline feed, not a real social-media connection.

## Device width no longer drifts diagonally

Old frames retain their existing visual placement until edited. Width now changes only the right edge while height stays unchanged; height changes only the bottom edge. The upper-left corner stays fixed. **Lock frame proportions** deliberately scales both dimensions together. **Fit standard device proportions** restores a normal handset or landscape laptop shape without moving the upper-left corner.

The new optional frame fields are stored with the device in the project file. The project format remains schema version 1 and older exports remain valid. Existing legacy `x`, `y` and `width` values are still read correctly. New geometry edits convert positioning to an explicit upper-left anchor.

## A lockable game preview window

In the **Editor**, use **Unlock window** below the scene. Drag the lower-right corner of the *whole preview pane* or focus the handle and use arrow keys. **Fill preview space** gives it the available height and width, leaving the dialogue tab bar available. The image keeps its scene aspect ratio; giving the pane more height reduces the dead space beside the artwork.

Choose **Lock window** to keep the allocation and hide the handle. **Reset preview window** restores the original responsive layout. This is separate from Editor preview zoom, background scale and camera zoom, so it does not change the novel’s artwork, lighting masks or game framing. Preferences stay on this browser. The window remains bounded by the available editor area; collapsing the story library or moving controls to another dock gives it more room.

## The outfit picker and dialogue controls

The bottom panel now has **Dialogue**, **Items & outfits**, **State & clues** and **Event log** tabs. Open **Items & outfits → Open saved outfit selection**, or **Edit → Saved outfit selection**, to jump to the wardrobe’s `effort` dialogue. Its original three cards still inspect, show their descriptions, return to other options, and confirm an authored outfit choice during playback.

Cards appear only on dialogues containing their linked choices. Selecting a different dialogue does not delete the saved picker. The editor panel displays saved card thumbnails; clicking one jumps to the appropriate dialogue. The picker can be enabled or disabled without discarding cards.

**Restore missing demo outfits** is an explicit recovery action. It adds missing saved cards/images, keeps existing custom cards/descriptions/backgrounds, and reuses existing wardrobe choices where possible. It does not replace the entire project or load a GitHub snapshot.

**Add item for current dialogue** adds a new card with its own confirmation choice. Upload an image directly, describe it and choose its destination. Existing clothing options remain in place. Self-reply, author notes, choice destinations and state actions remain in the original Dialogue tab; phone self-reply also has its own control in Advanced devices.

## Saving and the rainy departure

Project exports include device configuration, apps, items, images, story routes and graph coordinates. Workspace preview dimensions/lock state are browser-local preferences.

The seventh scene **After the café** holds the café departure and follow-up phone branches over the new downward-looking rainy pavement art. The original café visuals are preserved. **Load GitHub snapshot** explicitly loads the published authored project and keeps a recovery copy of different local work. A normal engine upgrade keeps your existing browser project instead of replacing it.
