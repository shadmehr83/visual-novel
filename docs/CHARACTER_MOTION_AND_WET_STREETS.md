# Chapters, character motion and wet streets (2.14)

## Chapter correction

**Chapters advanced → Add chapter** creates and selects the new chapter settings after validating its new opening scene. Adding an opening/scene stays in that chapter. It no longer attempts to navigate to a scene before the parent editor knows it exists.

The authored boundary is **scene 7, After the café, dialogue 15**: this remains chapter one's last dialogue. Scenes 8–13 are chapter two's six conditional opening scenarios, not six consecutive required scenes. Previous choices select the appropriate opening. Compatible old local projects with all thirteen scenes in chapter one are regrouped once, with a recovery copy. Custom chapters, café artwork and local dialogue edits are retained. The later chapter remains an explicitly labelled opening draft.

The six morning openings share a new daylight rendering of the same bedroom. Chat UI opens on message/reply dialogues and is hidden during room narration, postponing a reply or putting the phone away. The farewell conversation outside the café is spoken in person; only the subsequent message uses the phone.

## Moving a character patch

Open **Cinematics → Add hinge region**. Draw or brush only the part that should move, or use the existing wand/edge selection tools. Place the pivot at its joint. For a head, use the neck; for a selected eye opening, place it at the eye's centre.

**Save selected snippet to gallery** extracts selected pixels into a transparent, scene-aligned PNG in **Assets → Character snippets**, then assigns it as this hinge's source. The original background stays unchanged. The snippet retains a full scene-sized transparent canvas to preserve alignment; it is not an automatic person cutout. Exports and GitHub project publishing include its image bytes. Reuse it from another hinge's Source image selector.

**Drag selected patch on scene** saves a translated pose on the current dialogue when you release the mouse. **Drag head tilt on scene** rotates around the pivot, limited to 15 degrees per gesture. Angle and position fields remain available for precise edits. Pose changes use the existing smooth/snappy/slide/fade transitions when their dialogue is entered. The optional start/end dialogue range controls when the whole hinge is active.

A moving patch leaves its original pixels in the underlying photograph. To prevent a duplicate silhouette, choose **Clean plate behind moving patch**: an aligned image of the scene with that part absent. Only the selected region is taken from the clean plate. Alternatively use **Cover original pixels** with a suitable flat colour for a small uniform region. Upload a clean plate through Assets and optionally put it in the Clean plates folder. This release does not perform background reconstruction, anatomical rigging or unseen-face generation.

## Blinks, gaze and idle motion

Inside a hinge's **Character motion** controls:

- **Loop character motion** repeats an idle effect, respecting its dialogue activation range, pause and reduced-motion settings.
- **Gentle head tilt** adds a small sinusoidal rotation around the pivot. Start at 0.5–1 degree.
- **Small eye / selected-patch drift** shifts the selected patch horizontally. It is a masked image shift, not eye tracking; use a very small amount and an appropriate cover/clean plate.
- **Blink selected eyelid region** briefly compresses the selected eye-opening pixels over a matching **Eyelid / skin colour**. The eye stays open for most of the interval, then smoothly closes and reopens. Paint the eye opening carefully, match its pivot and colour, and use separate hinges for differently angled eyes. For hand-painted expressions, the existing replacement image per dialogue remains available.

Use **Loop interval** to control the repetition period. Dialogue poses and idle loops can be combined, or disable looping and queue only the poses you authored. Existing artwork is not automatically face-detected or modified; these tools give you explicit control.

## Rain, puddles and walking

Scenes **5 (The Lantern Room)** and **7 (After the café)** now have two masked rain-impact zones over reflective wet ground. Expanding elliptical rings simulate raindrops hitting puddles without shifting or warping the pavement. The farewell scene adds a very restrained fluctuating warm doorway reflection. The café scene itself is unchanged.

For another background, **Motion → Add motion zone → Motion type → Rain impact ripples**, then paint/select the wet surface. Strength controls the number of impacts and Seconds controls ring lifetime. Reduced effects/motion suppresses ripples. Masks stay attached to the scene's background transform and camera.

**Sound → Upload sound → Add background ambience** already supports multiple tracks. Add each desired track; each gets separate volume, loop and remove controls. Outdoor scenes now mix existing rain with **Rain · close water splashes and puddle impacts**. **Walking · wet heel, toe and scuff** replaces the older walking sample for these scenes; slight alternating pitch and volume keep successive steps less mechanical. Camera timing still governs footstep cadence. All sounds are original synthesized assets, with reusable OGG and WAV files under references/audio.

Main ambience continues under a sub-scene; add extra view-specific tracks while its trigger dialogue is selected. Sound controls list the local tracks, and each retains its own level.
