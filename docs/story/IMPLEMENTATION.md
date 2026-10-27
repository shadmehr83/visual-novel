# The First Match — opening adaptation

The user's story bible and aesthetic brief inform the authored project in `projects/published.stillframe.json`. Their extracted source text is retained alongside this guide. Story content and editable backgrounds remain separate from the engine.

## Playable sequence

1. **Another evening:** wake, inspect the window/monitor/clothes through optional dialogue-menu interactions, check the first Nearside notification, open/ignore/dismiss, discover the second message or leave the app unopened.
2. **A small possibility:** Maria's profile, playful/direct/guarded message exchanges, follow-up about horror films, and optional questions about what she wants.
3. **An invitation:** public Lantern Room café at four; accept, flirt, ask details, state a boundary, defer or decline. Refusal/deferment ends this slice without forcing the date.
4. **Getting ready:** three cosmetic outfits, mirror reflection, optional address/message check.
5. **The Lantern Room:** wet-street transition; go inside or notify Maria and head home.
6. **A table by the window:** arrival, seating, all twelve café beats, bounded tone choices, drink selection, app conversation, profile detail, interests, vulnerability, orange-peel recommendation, personal-life boundaries, apology, humour, one selected reflection, second-date choices and optional final message.

Maria's knowledge refers to a visible protagonist profile detail (bad horror films and “strong opinions about very unimportant things”), replacing the bible's template fields. Neutral/warm reflections use accumulated warmth; the player can explicitly remain undecided instead. Facts and interpretation remain distinct. Declining a second meeting skips her follow-up. No API is required and no new facts are invented by AI during playback.

## Visual preservation

The café's uploaded PNG, background ID, fit, position, scale, rain masks, lights, cycles, motion settings and other visual fields were preserved exactly. `preserved-cafe.json` records the protected scene values and original decoded PNG SHA-256. Only café dialogue/entry content is revised.

Three refreshed embedded PNG environments follow the supplied reference board and café painting: a lived-in bedroom, wardrobe and wet street. A reusable device UI now replaces the phone close-up image. Shared charcoal/blue-grey, dusty mauve, wood and restrained amber replace generic scenery. They are labelled as replaceable, unapproved mood placeholders in Assets. They can be replaced with normal background import controls. The device UI shares the bedroom background between messages and the invitation. Existing effects from the old illustrated bedroom are not applied to the new painting because their coordinates would illuminate/move unrelated objects.

## Deliberate simplifications

Room inspections use menu choices rather than spatial hotspots. Seat/outfit choices store flags and flavour without moving the preserved café image or changing attraction. Sound cues are described in the source brief but no new recorded audio is claimed. Café departure/follow-up is narrated over the preserved café image so the café remains the final scene. There are no later acts, AI-generated conversations, or new branching engine mechanics in this adaptation. Non-choice authored lines use Continue, with a compact expandable Self-reply option restored in the cinematic/device update. Replies are recorded and follow the authored next line; they do not generate AI dialogue.

## Opening on another device

After the connected Cloudflare deployment succeeds, open https://visual-novel-8b9.pages.dev/?snapshot=github and press **Play story**. The explicit link loads this GitHub checkpoint while retaining a recovery copy of different local work. The editor initially focuses on the preserved café; playback begins in the bedroom. Subsequent edits still need a complete project save/export and publish to update the shared checkpoint. Standalone editor and Cloudflare ZIP downloads are refreshed with this project too.

For current hinge poses, device UI, fullscreen and refreshed artwork, see [cinematics and devices](../CINEMATICS_AND_DEVICES.md). The later update reuses the camera engine in the bedroom and journey; café visual settings remain protected.
