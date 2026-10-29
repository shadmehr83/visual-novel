# Stillframe 2.18.1

This maintenance release preserves project content and the existing editing workflow.

- In Assets, select a picture and press **Expand image**. Artwork picker thumbnails also open a larger preview. Close with **Close preview** or Escape; focus returns to the opener.
- Library thumbnails load lazily and decode asynchronously instead of decoding every offscreen image immediately.
- Playback saves write the small runtime record separately when the immutable project has not changed. Actual project edits still validate and save the complete project. Both records commit atomically, with a project token guarding against stale progress after replacement or writes from another tab. Existing database records remain readable, and recovery snapshots include the latest progress.
- No-op edits no longer consume Undo slots. Scene animation skips state updates in hidden tabs.

These changes reduce unnecessary image decoding and repeated artwork serialization. Actual RAM and frame-rate improvements depend on image sizes, effects and the browser; this release does not reduce image quality.
