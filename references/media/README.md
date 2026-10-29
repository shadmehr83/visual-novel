# Reusable Insta media archive

All original paintings, previous released clips and original soundtracks are retained.
The active feed uses the version-two animation exports. Nothing in this folder is
required to be uploaded to an external AI service. WAV files can be imported through
Stillframe’s Sound controls or reused in another project. On GitHub, open a file and
choose **Download raw file** to save it.

## What changed

- Street: separately moving windblown leaves, rain streaks and expanding puddle splashes.
- Reading: a page lifts and settles twice, visible steam curls, and rain moves outside.
- Desk: the monitor plays an independent moving display while rain stays at the window.
- Tram: a separately painted city passes behind a fixed window/plant mask.
- Sound: new wet footsteps, paper movement, ceramic clinks, keyboard keys, a tram bell
  and wheel joints; the reading clip includes an original 24-second piano composition.

The sound effects and piano are original synthesised designs. Standalone WAV stems,
short effects, music and full mixes are saved separately. The older exact AAC tracks
and deterministic pre-encoding WAV ambience are also saved for reuse.

The original paintings remain untouched in `artwork/insta-originals`. Three newly
generated illustration assets and the tram mask are in `artwork/insta-animation`.
Earlier clips and their compact copies live in `references/media/insta/v1`.
Version two lives in `references/media/insta/v2`; matching web exports live under
`public/media/insta`. `experiments` retains technical previews and rejected projection
trials; those are not used in the game. The catalog records every asset’s SHA-256.

## Generate or update the media

1. `python scripts/insta_audio.py` creates the reusable effects, music, ambience stems
   and full mixes under `references/audio/insta/v2`.
2. `python scripts/animate-insta-videos.py` renders version-two footage into its archive.
3. `python scripts/publish-insta-media.py` checks, remuxes with the saved source mixes,
   copies the active clips to the web folder, and refreshes the manifests.
4. `python scripts/catalog-insta-media.py` refreshes this index.

The earlier `scripts/make-insta-videos.py` now rebuilds only into `v1/rebuilt`, and
retains its WAV sources. It does not overwrite the active feed or the initial v1 files.
A byte-for-byte copy of its original code is retained in the v1 archive for reference.

## Original paintings

- [last-tram.png](../../artwork/insta-originals/last-tram.png) · 2255 KiB
- [midnight-monitor.png](../../artwork/insta-originals/midnight-monitor.png) · 2087 KiB
- [rain-walk.png](../../artwork/insta-originals/rain-walk.png) · 2485 KiB
- [tea-and-pages.png](../../artwork/insta-originals/tea-and-pages.png) · 2256 KiB

## New illustration assets and window mask

- [loose-page.png](../../artwork/insta-animation/loose-page.png) · 3109 KiB
- [passing-city.png](../../artwork/insta-animation/passing-city.png) · 2576 KiB
- [tram-window-mask.svg](../../artwork/insta-animation/tram-window-mask.svg) · 0 KiB
- [wind-leaf.png](../../artwork/insta-animation/wind-leaf.png) · 1345 KiB

## Original piano composition

- [tea-window-original-piano.wav](../../references/audio/insta/v2/tea-window-original-piano.wav) · 24.00s · 2250 KiB

## New reusable sounds and mixes

- [ceramic-cup-clink.wav](../../references/audio/insta/v2/ceramic-cup-clink.wav) · 1.20s · 113 KiB
- [keyboard-key.wav](../../references/audio/insta/v2/keyboard-key.wav) · 0.09s · 8 KiB
- [last-tram-ambience-stem.wav](../../references/audio/insta/v2/last-tram-ambience-stem.wav) · 24.00s · 2250 KiB
- [last-tram-soundtrack.wav](../../references/audio/insta/v2/last-tram-soundtrack.wav) · 24.00s · 2250 KiB
- [midnight-monitor-ambience-stem.wav](../../references/audio/insta/v2/midnight-monitor-ambience-stem.wav) · 24.00s · 2250 KiB
- [midnight-monitor-soundtrack.wav](../../references/audio/insta/v2/midnight-monitor-soundtrack.wav) · 24.00s · 2250 KiB
- [paper-page-turn.wav](../../references/audio/insta/v2/paper-page-turn.wav) · 1.15s · 108 KiB
- [rail-joint.wav](../../references/audio/insta/v2/rail-joint.wav) · 0.22s · 21 KiB
- [rain-walk-ambience-stem.wav](../../references/audio/insta/v2/rain-walk-ambience-stem.wav) · 24.00s · 2250 KiB
- [rain-walk-soundtrack.wav](../../references/audio/insta/v2/rain-walk-soundtrack.wav) · 24.00s · 2250 KiB
- [tea-and-pages-ambience-stem.wav](../../references/audio/insta/v2/tea-and-pages-ambience-stem.wav) · 24.00s · 2250 KiB
- [tea-and-pages-soundtrack.wav](../../references/audio/insta/v2/tea-and-pages-soundtrack.wav) · 24.00s · 2250 KiB
- [tram-warning-bell.wav](../../references/audio/insta/v2/tram-warning-bell.wav) · 2.10s · 197 KiB
- [wet-footstep.wav](../../references/audio/insta/v2/wet-footstep.wav) · 0.38s · 36 KiB

## Earlier sounds kept for reuse

- [last-tram.m4a](../../references/audio/insta/v1/last-tram.m4a) · 24.00s · 97 KiB
- [midnight-monitor.m4a](../../references/audio/insta/v1/midnight-monitor.m4a) · 24.00s · 97 KiB
- [rain-walk.m4a](../../references/audio/insta/v1/rain-walk.m4a) · 24.00s · 97 KiB
- [last-tram.wav](../../references/audio/insta/v1/source/last-tram.wav) · 24.00s · 1034 KiB
- [midnight-monitor.wav](../../references/audio/insta/v1/source/midnight-monitor.wav) · 24.00s · 1034 KiB
- [rain-walk.wav](../../references/audio/insta/v1/source/rain-walk.wav) · 24.00s · 1034 KiB
- [tea-and-pages.wav](../../references/audio/insta/v1/source/tea-and-pages.wav) · 24.00s · 1034 KiB
- [tea-and-pages.m4a](../../references/audio/insta/v1/tea-and-pages.m4a) · 24.00s · 97 KiB

## Current animated clips and previews

- [last-tram.mp4](../../references/media/insta/v2/compact/last-tram.mp4) · 24.00s · 110 KiB
- [midnight-monitor.mp4](../../references/media/insta/v2/compact/midnight-monitor.mp4) · 24.00s · 86 KiB
- [rain-walk.mp4](../../references/media/insta/v2/compact/rain-walk.mp4) · 24.00s · 114 KiB
- [tea-and-pages.mp4](../../references/media/insta/v2/compact/tea-and-pages.mp4) · 24.00s · 100 KiB
- [last-tram.mp4](../../references/media/insta/v2/last-tram.mp4) · 24.00s · 642 KiB
- [midnight-monitor.mp4](../../references/media/insta/v2/midnight-monitor.mp4) · 24.00s · 443 KiB
- [last-tram-action.jpg](../../references/media/insta/v2/previews/last-tram-action.jpg) · 31 KiB
- [midnight-monitor-action.jpg](../../references/media/insta/v2/previews/midnight-monitor-action.jpg) · 32 KiB
- [rain-walk-action.jpg](../../references/media/insta/v2/previews/rain-walk-action.jpg) · 44 KiB
- [tea-and-pages-action.jpg](../../references/media/insta/v2/previews/tea-and-pages-action.jpg) · 41 KiB
- [rain-walk.mp4](../../references/media/insta/v2/rain-walk.mp4) · 24.00s · 1081 KiB
- [tea-and-pages.mp4](../../references/media/insta/v2/tea-and-pages.mp4) · 24.00s · 639 KiB

## Earlier released clips

- [last-tram.mp4](../../references/media/insta/v1/compact/last-tram.mp4) · 24.01s · 99 KiB
- [midnight-monitor.mp4](../../references/media/insta/v1/compact/midnight-monitor.mp4) · 24.01s · 94 KiB
- [rain-walk.mp4](../../references/media/insta/v1/compact/rain-walk.mp4) · 24.01s · 111 KiB
- [tea-and-pages.mp4](../../references/media/insta/v1/compact/tea-and-pages.mp4) · 24.01s · 107 KiB
- [last-tram.mp4](../../references/media/insta/v1/last-tram.mp4) · 24.00s · 293 KiB
- [midnight-monitor.mp4](../../references/media/insta/v1/midnight-monitor.mp4) · 24.00s · 263 KiB
- [rain-walk.mp4](../../references/media/insta/v1/rain-walk.mp4) · 24.00s · 380 KiB
- [tea-and-pages.mp4](../../references/media/insta/v1/tea-and-pages.mp4) · 24.00s · 322 KiB

## Technical experiments (inactive)

- [tea-and-pages.mp4](../../references/media/insta/experiments/fold-check/compact/tea-and-pages.mp4) · 9.00s · 72 KiB
- [page-lift.jpg](../../references/media/insta/experiments/fold-check/page-lift.jpg) · 21 KiB
- [tea-and-pages.mp4](../../references/media/insta/experiments/fold-check/tea-and-pages.mp4) · 9.00s · 358 KiB
- [perspective-mask-convex.jpg](../../references/media/insta/experiments/perspective-mask-convex.jpg) · 4 KiB
- [perspective-mask.jpg](../../references/media/insta/experiments/perspective-mask.jpg) · 7 KiB
- [tea-old-perspective-preview.jpg](../../references/media/insta/experiments/tea-old-perspective-preview.jpg) · 21 KiB
- [tea-unclipped-perspective.jpg](../../references/media/insta/experiments/tea-unclipped-perspective.jpg) · 19 KiB
- [tea-unclipped-perspective.mp4](../../references/media/insta/experiments/tea-unclipped-perspective.mp4) · 24.00s · 1033 KiB
