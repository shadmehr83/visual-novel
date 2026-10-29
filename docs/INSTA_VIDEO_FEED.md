# Insta video feed

Insta is a fictional, local social app inside the existing phone/computer. Home,
Ember messages, notification branches, device return routes and dialogue-based
screen schedules still work. Browsing, likes and comments never pick a story reply.

## Add or edit videos

1. Open **Advanced devices** from the studio navigation.
2. Select **Insta feed** in its section tabs.
3. Use **Upload more feed videos**. H.264 video with AAC audio in an MP4 works
   across the widest range of browsers; WebM and Ogg are also accepted if the
   current browser can read them. Each upload may be up to 10 MB and three minutes;
   uploaded video totals are limited to 20 MB, with up to 40 posts.
4. Expand a post to change the account, title, caption, starting likes and authored
   comments. Move earlier/later sets the scrolling order. Remove video removes only
   that feed post; editor Undo can restore it. Restore missing original videos adds
   only missing originals, preserving uploads and existing edits.
5. Autoplay, feed replay, comments and feed volume have their own switches here.
   These are shared project settings across scenes, independent of phone appearance.

Uploads stay in browser autosave until exported. **Save complete project file** or
**Export project** embeds all feed videos and posters alongside existing artwork,
audio and effects. **Export playable HTML** also embeds them. Import that project
file on the other device to retain uploaded media. The four built-in web videos
live in this GitHub repository, so they are available on every deployed device
without uploading them again. File exports fail visibly if a built-in clip cannot
be downloaded; they do not silently create incomplete backups.

## During play

- Scroll inside Insta to switch videos. Only a mostly visible clip plays; scrolling
  away pauses it. Loops replay their full 24 seconds. Reduced-motion preferences
  start clips paused. Tap Play to watch explicitly.
- Videos begin muted. The sound button unmutes the feed; the story master sound and
  volume still apply. Editing previews are silent. The feed volume is a multiplier
  of the master volume. Pause menu, comments, background tabs, putting the phone
  away and leaving the app stop playback.
- The heart toggles your one like and adjusts its count. Comments show the authored
  fictional discussion, including context-specific jokes, criticism and one clearly
  fictional scam followed by the author's warning. All comments are plain text.
- A player can add a local comment. Likes and up to 20 replies per post are kept in
  local browser storage per project, independent of story state. These player
  reactions are not sent to a real account and are not part of author project
  exports. Authored comments are included in exports.
- **Keep scrolling · watch again** adds another round of the feed; the same posts
  share likes and replies. Ten rounds are retained before returning to the start.
- Home, Ember and story notifications remain accessible. Story progression controls
  sit outside the phone; clicking a feed video never advances the dialogue.

## Original clips and production

All four are 24-second illustrated cinemagraphs, not live-action or character acting.
Their new paintings were generated using the preserved Rainy Café Conversation
image as an art-style reference, without altering that scene or its artwork.
Original paintings are archived in `artwork/insta-originals/`.

| Clip | Character-relevant theme | Motion and original ambience |
| --- | --- | --- |
| Took the long way home | Quiet walks, understated melancholy | Slow camera drift, rain, subtle lamplight, soft wet footsteps |
| Reading the same page again | Books, quiet cafés, distracted afternoons | Slow framing, window rain, steam, local lamp shimmer, porcelain and muffled rain |
| One more before I sleep | Dry humour, avoidance, late-night scrolling | Gentle framing, window rain, local lamp shimmer, monitor hum and light desk clicks |
| A seat by the window | Small pauses, everyday city life | Gentle camera sway, window rain, warm lamp shimmer, tram rumble and track rhythm |

The videos use original procedural ambient sound, no borrowed song or voices.
`python scripts/make-insta-videos.py` recreates their MP4s, posters and compact
copies with ffmpeg. Web clips are H.264/AAC, 360×640, 20 fps. To preserve a single
HTML editor below Cloudflare's 25 MiB asset limit, its embedded copies use the same
24 seconds at 216×384, 15 fps. The web editor uses the larger copies. A media
manifest records durations, sizes and SHA-256 hashes in `public/media/insta/`.
The service worker precaches the four web clips and posters for offline reloads.

Version 2.12 adds stronger independent animation, original soundtracks and a draggable
comments sheet. See [the updated guide](INSTA_ANIMATION_AND_COMMENTS.md) and the
[complete reusable-media archive](../references/media/README.md). The earlier renderer
now rebuilds only into its v1 archive; the active pipeline is documented in that archive.
