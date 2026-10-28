# Stillframe 2.6 — artwork, return routes and player progress

Open the current hosted studio at https://visual-novel-8b9.pages.dev/?release=2.6.0 . Compatible older saved demo projects receive a focused content update with a recovery copy. The update adds missing images, repairs the saved clothing cards and connects the window and wardrobe views. It preserves existing custom images, effect settings, other item cards and the café scene. Website code is deployed from `shadmehr83/visual-novel`, branch `main`; the authored checkpoint lives in `projects/published.stillframe.json`.

## Saved artwork and clothing

Choose **Assets → Artwork folder**. The initial folders are **Background scenes**, **Outfits & items**, **Profiles & app icons** and **Other artwork**. Select an image and edit **Move to artwork folder** to move it or create a named folder. These are project categories; all image data remain embedded in JSON exports. The **Import missing GitHub artwork** button adds committed images without replacing images already present in your project.

Sub-scene backgrounds, scene backgrounds, item images, device wallpaper, icons and profile images have folder selectors. Changing a folder only filters the list; it does not replace the current image. Current selections remain visible even if the folder filter differs.

In the opening room, **Look at the window** opens the saved rainy window illustration, and **Check the wardrobe** opens the wardrobe illustration as temporary views. Their next dialogue returns to the room options. Configure other views under **Sub-scenes → This dialogue view**. **After this sub-scene** sets a normal next dialogue, or use each choice's destination when the dialogue has choices. Dialogue destination labels and advanced map cards identify sub-scenes.

**Outfits & Items** (or **Items & outfits** below the scene) contains the clothing picker. **Open saved outfit selection** goes to its dialogue. In playback: inspect an outfit, then choose it or see other options. Selecting a card does not commit its story choice. Its transparent PNG remains visible on the selected outfit's result dialogue. The opening wardrobe is an inspection view; the later **Getting ready** scene contains the actual outfit selection.

## Put a phone or computer away

Open **Advanced devices → Timing → Put device away · return route**.

- Enable the return control and select its inclusive **start** and **end** dialogue.
- Choose **Return destination**, or leave **Automatic** to find the most recent choice menu in this scene along the player's actual route.
- **Put-away button on this dialogue** can follow the range, force it on or force it off for one dialogue. Off continues the story on the device.

The opening phone returns to the room's four options. Reopening its original entry route restores the dialogue where it was put down, without applying the entry choice's state actions a second time. It preserves conversation messages and story state. If no return destination exists, the button hides the device and becomes **Pick phone back up** or **Return to computer** at the same dialogue. The phone's existing Home, Back and app UI are unchanged.

## Layout and playback

Use the visible **Tools** and **Controls** dropdowns above the workspace. Tools can sit on the left or at the top. Clicking the current tool again closes its panel; clicking another opens that panel. **Layout & project settings** also contains dock placement, separate effects/properties docks, library size, dialogue placement/height, custom preview sizes, preview lock, fonts and colours. Layout preferences are saved in this browser.

Playback places **Pause menu** and **Fullscreen / Exit fullscreen** inside the game area, so they remain available in fullscreen. The pause menu also has fullscreen, resume, restart and back to editor. Escape opens/closes pause. **View Current Progress** is a read-only route view: visited dialogue and selected responses are highlighted, while unexplored responses and the future route are question marks. Viewing progress pauses sound, animation, dialogue advancement and timed choices.

Project JSON export includes artwork, item mappings, device timing and return configuration. Browser-local saves do not automatically publish to GitHub; export or publish your changes before switching devices.
