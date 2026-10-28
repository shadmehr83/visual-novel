# Stillframe 2.9.0 — Phone controls made clear

The live studio is https://visual-novel-8b9.pages.dev/?release=2.9.0 . The release parameter labels the link; the version badge in the studio confirms the actual deployed build. Normal links retain this browser’s local project. Only use `?snapshot=github` when intentionally loading the GitHub project checkpoint; that creates a recovery copy of different local work.

## Make “Check your phone” open a phone

1. In Dialogue advanced, select the dialogue box reached by the “Check your phone” reply.
2. Under **Phone on this dialogue**, turn on **Phone visible on this dialogue**.
3. Choose **Home**, **Insta**, or **Ember** in **Open app on this dialogue**.
4. Leave **Dialogue separate from phone** on for narration/actions beside the phone. Turn it off to open Ember with integrated dialogue and replies.
5. On a later box, switch Phone visible off to explicitly hide the phone there. Each quick override belongs to its own box. Boxes without an override retain the scene’s existing schedule.

These same controls appear in the original dialogue editor, the simple Phone panel, and Advanced devices. **Use scene schedule for this dialogue** clears only the selected box’s visibility, app and placement overrides. It leaves the existing scene schedule intact.

Advanced devices still offers start/end visibility ranges, per-dialogue app schedules within those ranges, separate texting ranges, frame controls, appearance, apps and return routes. Quick visibility overrides take priority over scheduled visibility and the scene master switch. Individual quick boxes do not silently expand the range or change other boxes.

## Keep images across scenes

Device icons, wallpaper, app profiles and the contact portrait inherit saved project defaults. A newly added phone uses the existing saved images, including Maria’s rainlit portrait. Changing an image with sharing on updates the project’s shared phone appearance. Appearance and image files are included in a complete project JSON export and the playable export.

In **Advanced devices**, turn off **Use shared phone appearance** to freeze that scene’s current appearance and edit it independently. Phone position, size, timing and story routes always remain scene-specific. Existing custom scene appearance is retained until you explicitly save a shared change.

## Find settings

**Effects & interactions** selects tools such as Phone, Rain and Light Library. **Scene & workspace** selects general atmosphere, background, workspace, appearance, Active and transitions. The highlight identifies the settings currently open; Phone no longer highlights Atmosphere at the same time. Switches have bounded tracks, an ON/OFF label, focus outlines and a disabled state.

The release also publishes the previously unshipped v2.8 docking and search tools. Outfits, scene artwork and effect settings have not been edited for this release.
