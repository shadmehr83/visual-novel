# Animated feed, draggable comments and reusable media (2.12)

## Comments with the mouse as a finger

Open a video's comments. The header is now a compact 34-pixel strip, avoiding the
editor's large global header styling, and the reply composer starts at one line
(28 pixels). It grows only as needed while typing, up to 56 pixels, then returns
to one line after posting. The small arrow button posts the comment locally.

Drag the pill/title strip up to expand the sheet to the top of the whole phone,
or down to shrink it. The sheet is anchored to the device shell rather than a
post, so it can expand beyond the small video viewport. Drag inside the comment
list to scroll it like a finger. Wheel/trackpad scrolling and native touch scrolling
also work. Browsing comments pauses the clip and holds the feed in place.

Keyboard access: focus the Comments sheet height control, use Up/Down to resize,
Home for full height or End for the smallest size. Escape or the small X closes
comments. Focus returns to the original comments button. Story choices and saved
likes/replies are unchanged.

## Visible scene-specific animation

The four clips remain 24 seconds and retain the original paintings. Independent
2D elements now move, rather than relying mainly on a camera zoom:

- **Took the long way home:** tumbling painted leaves, falling rain, and puddle
  rings expanding where drops hit. New wet footsteps and wind/rain sound design.
- **Reading the same page again:** a page lifts and settles twice and several
  steam curls rise from the cup. Paper and ceramic effects accompany an original
  short piano composition and quiet rain.
- **One more before I sleep:** the monitor independently animates its display;
  rain remains at the window. New keyboard and computer/rain sound design.
- **A seat by the window:** a separately painted city slides behind a fixed
  window mask while foreground furniture and foliage remain in place. New tram
  wheel rhythm, rumble and bell sound design.

These are layered 2D animations, not generated live-action footage. The paintings,
new illustration layers and masks remain available for your own editing.

Videos still start muted. Tap the speaker and make sure the story's master sound
is enabled to hear the soundtrack. Editing previews are silent, as before.

## Old saves and uploaded videos

Built-in video paths request the updated revision automatically. If an imported
older complete project embedded the previous video bytes, use **Advanced devices →
Insta feed → Use updated included animations**. This replaces only the four included
posts' media sources. Uploaded posts, captions, authored comments, ordering and
like counts stay intact. Keep the older export if you want its embedded versions.

## Everything is retained for reuse

The [GitHub media archive](../references/media/README.md) links the original
paintings, new illustration layers, exact earlier MP4/AAC releases, original WAV
ambience, new sound-effect WAV files, separate ambience stems, the piano composition,
and full soundtracks. They can be downloaded and used elsewhere. The machine-readable
catalog includes file sizes, duration and SHA-256 hashes. Nothing in the new release
deletes the earlier backgrounds or sounds.

New audio is original synthesised sound design and an original composition, not a
borrowed song. Source mixes are lossless stereo WAV; active web video uses H.264/AAC
at 360×640 and compact offline copies use 216×384. All active clips and source media
are saved in GitHub. Technical experiments are retained separately and are not
loaded into the game.

The single-file editor now uses an HTML-safe ASCII85 wrapper around its existing
gzip payload. This saves space without changing any image or audio bytes, preserving
embedded offline media while remaining below the hosting platform's file-size limit.
