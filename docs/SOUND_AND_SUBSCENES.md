# Stillframe 2.4 — sound, wardrobe, phone and temporary views

## Clothing

Open **Editor → Items & outfits → Open saved outfit selection**, or select **Getting ready** and its first dialogue. The three original transparent clothing images are still embedded in the project. Inspect a card, choose it, then continue or choose **See the other outfits**. The chosen image remains visible during its descriptive dialogue.

**Outfits & Items → Keep selected item visible** controls this behavior for other item pickers. It follows the destination of each item’s confirmation choice; it does not insert a new main scene. **Restore missing demo outfits** repairs missing images and broken choice links without replacing custom garment descriptions or artwork.

## Sound

Choose **Sound** beside Rain, Lighting and Motion in the effect tabs, or use **Effects → Sound**. The library includes six original synthetic sound designs: rain outside, the same rain muffled through a room window, one wet pavement footstep, a soft two-tone phone alert, a closet opening and coat fabric. They are Ogg audio assets saved with the project; no external service or API key is involved. Rebuild them with `python scripts/make-demo-sounds.py` (requires ffmpeg).

- **Add background ambience** assigns an existing library sound to the scene. Adjust volume, loop it, or remove that assignment.
- **Upload sound** adds a reusable MP3, WAV, Ogg, M4A or WebM file up to 20 MB. Uploaded files are decoded before being accepted.
- **This dialogue sound** plays on arrival at that dialogue. A **Reply sound** plays when its linked reply is chosen.
- **Phone notification sound** plays for a new authored notification. A repeated notification label on its following decision does not chime again.
- **Inspect item sound** and **Choose item sound** are independent. Browsing clothing does not commit a choice.
- **Camera → Footsteps during camera movement** uses a reusable step sample at the footstep interval, for the camera approach duration. Volume is independent of ambience. Generated footsteps remain an available fallback.

The demo has muffled rain in scene 1, rain in scenes 4 and 7, and a brief walking approach with footsteps in scenes 5 and 7. The café image and effect masks remain unchanged. Sound begins during playback; **Mute sound** and **Sound volume** control the whole session across scenes. Browser autoplay restrictions may require tapping **Enable sound**. Pausing the story stops sounds and resumes scene ambience when the story resumes. The offline exported player uses the same sound engine.

## Phone

In the opening scene, **Check the phone** opens the existing scrolling Insta app. After a short pause, an Ember notification appears with its chime. Tap it to follow the authored Open route; the other story choices remain available. Home, back, chat history and the handset frame are preserved.

The project includes three matching image icons for Ember, Insta and Settings. **Advanced devices → Apps** offers icon selectors/uploads and separate **Ember profile image** / **Insta profile image** uploads. The same controls are in the phone’s own **Home → Settings**. Profile uploads do not change Maria’s contact portrait. Insta displays its profile above the feed; Ember displays yours in the chat area.

Use **Advanced devices → Dialogue & replies → Show phone keyboard by default** to author the initial keyboard state. During play, use **Show keyboard / Hide keyboard** in chat, or the checkbox in phone Settings. This controls the decorative keyboard; self-reply remains available separately.

## Sub-scenes

Use **Editor → Sub-scenes → Add sub-scene for this dialogue**. Name the view, assign/upload its background and select the transition. The current dialogue uses that view; other dialogues keep their own view choice. Select **Original scene** on a returning dialogue to fade back to the main background.

The bedroom’s **Look at the monitor** now uses an original desk close-up matching the existing bedroom palette, then returns to the room’s choice dialogue. This adds no main scenes. Main-image rain masks, local lights, cloth zones and camera motion are suppressed in close-ups so they do not accidentally affect unrelated geometry. Configure a separate full scene if a different view needs its own collection of effect masks.

## Faster dialogue maps

**Dialogue advanced** has **+ Dialogue** and **+ Reply** on each box. + Dialogue inserts a new Continue step while retaining its old destination. + Reply creates a new destination and a new reply without deleting the original Continue or other choices. Edit text in the right panel, or drag an output dot to an input dot to reconnect it.

The **Quick connected dialogue** panel also accepts an explicit incoming dialogue, connection type and outgoing dialogue. Unconnected boxes and the original editor remain available. Timed-action nodes retain their two required outcome links; add dialogue after an outcome rather than replacing the timed action.

## Existing workspaces

On normal reload, compatible First Match projects receive these additions once. Custom artwork, uploaded sounds, app icons, clothing descriptions and existing routes are retained. Original wardrobe cards are repaired where missing, the café is not modified, and the complete previous workspace is saved atomically as a recovery copy. The missing-departure update and this update share one transaction when both are needed. Use **Restore previous local project** to review that copy. Other novels are not automatically changed. JSON exports include all new views, audio, images and routing; project schema remains version 1.

## Phone vibration and moving an existing light

The second bedroom dialogue, “Then my phone vibrates, and the day remembers me first,” has an original 0.95-second double motor buzz. **Sound → This dialogue sound** selects it; the adjacent volume control adjusts it. The sound travels inside JSON exports and the single-file editor. Compatible older saved projects receive only the missing cue, with a recovery copy; edited text and custom sound assignments are retained.

In **Lighting**, each local light using **Soft radial light** now has **Move light with mouse** directly above its coordinates. Click the button, then click the scene once to move that light’s centre. X/Y update immediately; its colour, radius, intensity, cycle and dedicated mask remain unchanged. **Cancel light move** cancels before placement, and **Undo** reverses a completed move. Use X/Y afterwards for exact adjustment. **Light Library → Place lights on scene** continues to create new lights from the selected favourite instead.

## Editing sub-scene effects

Expand the sub-scene list beneath the story scene cards, or select a scene in Scenes advanced and expand its sub-scene list. Each view lists its lights, rain and sounds and offers switches. Click its trigger dialogue to open it. Dialogue lists mark assigned views with “Sub-scene”. The preview identifies the current view.

With that dialogue selected, use the normal Lighting, Rain and Sound controls. These edit that view’s effects and ambience independently of the main background. Upload sounds through Sound, then choose Add background ambience or This dialogue sound. Main ambience continues beneath sub-scene ambience; mute the main track if it should not continue. Sub-scene sound switches mute/unmute all its tracks (unmuting starts at 30%; adjust individual volumes in Sound).
