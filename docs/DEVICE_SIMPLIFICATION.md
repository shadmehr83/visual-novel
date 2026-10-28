# Simpler device interactions and editing

Current device controls are in the **Advanced devices** workspace. The original outfit picker is in **Items & outfits** beside Dialogue. See [the 2.2 guide](DEVICES_AND_PREVIEW.md) for current locations and preview resizing.

Updated 28 October 2026.

## Device timing

Open **Phone → Interaction timing → Simple start & end dialogues**. Select the first dialogue, the last dialogue, and the screen to display. The phone includes both endpoints and closes on the following dialogue. Intermediate dialogues need no switches. Timing follows dialogues actually visited during play; skipping the start does not activate the phone. If a branch never visits the end, the device stays open until the scene ends or an advanced Off switch is reached.

Enable **Advanced: override individual dialogues** only when you need authored Home/Insta/chat changes within that range. The per-dialogue list is under the collapsed **Advanced dialogue screen schedule** section. Existing saved projects keep their old schedules until you choose the simpler timing; their individual switches are preserved for later advanced use. New phone systems start with simple timing.

**Messages only** opens a conversation directly. **Device with apps** adds Home, Ember messages, Insta and Settings. Ember and Insta are fictional offline apps. They make no external connections or real posts. Opening another app does not itself advance dialogue. A genuine authored screen change still switches the screen; another dialogue specifying the same screen does not repeatedly override the app you are browsing.

**Phone → Device placement & contact → Device shape** selects Phone or Computer. Both use the same app system. Phone position, size, typing delay, entrance, contact and portrait controls are grouped here, separate from Cinematics.

Normal dialogue and device dialogue have independent **Allow custom response** checkboxes in the dialogue editor. Older projects inherit their previous response preference until the device checkbox is changed. Self-reply follows an authored next path; it does not generate new NPC dialogue.

## Phone appearance and Settings

**Phone → Phone & computer appearance** changes background colour, wallpaper, font, text colour and size. Choose an image from assets or upload a wallpaper/icon directly. Uploads embed the original image in the project; they never replace the scene background.

The device's **Settings** app exposes the same device-only appearance controls during play. In the studio those changes autosave with the project. In an exported player they last for the current session. Extra app shortcuts can be named, assigned an icon and linked to an existing offline screen; they do not install an external app.

Maria has a separate generated profile illustration based on the café character, in a new rainy street composition. The original café image and visual setup remain unchanged. On an existing local project, use **Phone → Use Maria’s new profile portrait** to add it without loading or replacing the GitHub snapshot.

## Pause and recovery

**Pause menu** suspends story interaction, effect animation, scene sound and QTE countdowns. Resume or restart from the menu. In the editor, **Escape always exits Play story**. In an exported standalone player, Escape toggles the pause menu.

A render recovery screen offers **Return to editor** or Escape if a component fails. Previously, advancing to another scene could pass its dialogue ID to panels still editing the previous scene; controls now use a dialogue belonging to their actual scene instead.

## Docks, active effects and light placement

**Two separate docks**, below Controls placement, puts Effects & interactions beside Scene properties, each with its own scrolling. Turn it off to return to the combined dock. Placement left/right/floating and saved workspace preferences remain available. Scene properties contains Atmosphere, Background, Workspace, Appearance, Active, and Transitions; it no longer masquerades as phone settings when a phone tab is selected.

**Active** now lists enabled and disabled layers with toggles. Lamp/motion masks, intensity cycles and positions stay saved. Brightness, contrast, tint and soft-light numeric values are backed up while switched off and restored when enabled.

**Light Library → Placement preset → Place lights on scene** lets you stamp local lights directly on the artwork. Choose a saved favourite or the gentle default (0.5 → 1 → 0.5, one second per step). Stop placing when finished. Phone/item overlays are hidden while placing so they cannot obstruct the click. Undo removes an accidental placement. Complete rain/light/motion setups remain in **Effect Presets**.

## Items and scene changes

**Outfits & Items → Add item picker → Add item for current dialogue** opens an expanded item card with a direct image upload, image selector, description and confirmation path. If the current dialogue has no choices, a valid confirmation choice is created without losing its previous next destination. For a terminal dialogue a small continuation node is added. Adding/uploading an item never replaces the background. Item labels and controls are larger.

**Scene properties → Transitions** or **Cinematics → Scene changes** exposes both entrance and exit effects. An exit effect runs when a choice takes the player to another scene and takes priority over that next scene's entrance. “Use next scene's entrance” preserves the previous behavior. Effects do not change dialogue links or invent a destination; a terminal dialogue still ends the story. Reduced motion skips animated transitions.
