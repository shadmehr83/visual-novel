# Authoring and item picker update

## Replies at choices

Self-reply is now offered at both ordinary dialogue and authored choices (unless the author disables it or the node is a QTE). At a choice, the expanded composer includes **Follow this authored path**. Choose the branch whose meaning matches your reply. The engine records your words and applies that branch's existing actions and transition. It does not guess a route with AI. On the phone, the custom message replaces the generic choice bubble; it is not sent twice.

The phone retains a 9:19.5 aspect ratio rather than stretching to a wide percentage of the scene. Its existing width control scales the device while preserving the ratio. Desktop mode remains a wider panel.

## Dialogue authoring

Every node has an **Author note** field. Notes are saved in the project and not shown during playback. Next-dialogue and choice destination labels include scene and dialogue numbers plus a speaker/text preview; stable IDs continue to handle actual links.

**Delete dialogue node** removes the selected node and fixes incoming next/choice/QTE links using its authored successor or next node where available. If no successor exists, affected links end/remove rather than pointing to a missing node. Its hinge poses and item mappings are removed too. The last node in a scene cannot be deleted. Undo restores the project data; select the restored node in the list to return to it.

Sliders now have exact numeric inputs beside them. Values respect the same minimum, maximum and step settings. Existing range controls and keyboard interaction remain available; coordinates use their original scene-pixel or percentage units, not screen-device pixels.

## Reusable presets

Under **Presets**, save a named rain, lighting, motion or complete-effects preset. Applying a preset replaces that category on the current scene and supports Undo. Presets include intensity cycles and selected regions. Region coordinates need review against the new background; presets do not automatically find corresponding windows or lamps. Presets travel with complete project JSON exports and published checkpoints, not just local browser storage.

## Typography and colour

**Appearance** has separate controls for local interface fonts/sizes and exported story dialogue fonts/sizes. The choices use installed system fonts, so there is no web-font service dependency. Character name colours are stored per character and used for dialogue speaker labels. Existing light/warm editor themes also cover more form and panel surfaces. Typography and colours change the interface/story text; they do not recolour artwork.

## Items as overlays

The wardrobe now displays three generated isolated outfit items. Inspecting an item only opens its description. **See other options** returns to the set; **Choose…** commits the original authored choice. Original narration remains in the overlay. A configurable blur puts the background behind the item.

Under **Cinematics → Item picker overlay**, authors can add this same item UI to other scenes, give each option a label/description, select an imported PNG, and map confirmation to an existing choice. It works for clothing, books or other items. The item is an overlay, not a new background or scene. The existing phone/desktop device modes remain separate and reusable.

## Placed environmental effects

The bedroom and its phone scenes have faint rain confined to the upper window panes and low-intensity light around the bedside/desk lamps. The wardrobe has upper-window rain and local lamplight. The street has light outdoor rain, local street/entrance lighting and very small movement in overhanging foliage. No cobblestone displacement or invented puddle-bounce simulation was added.

Local cycles range from 0.98 to 1.015 of base intensity, with 2.6-second steps; they interpolate smoothly rather than strobing. The existing reduced-effects/motion controls pause animation. All these settings remain editable through the normal effect controls. The final café scene and original café image were preserved unchanged.
