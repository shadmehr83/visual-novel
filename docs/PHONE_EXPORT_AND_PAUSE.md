# Playable exports and reply switches (2.20.0)

In the dialogue editor, each reply has an **Enabled** checkbox. Switch it off to hide the reply during play while keeping its destination, actions, conditions and text. Switch it on to restore it. If every reply is unavailable, playback waits rather than inventing a route. Keep one reply enabled for a playable choice.

New devices and the published story hide the decorative keyboard by default. Players can still turn it on using phone Settings. Scene 3's invitation/confirmation responses are inside Ember. The separate “What are you actually hoping to find on here?” / “Keep talking” prompt remains outside.

Choose **Export phone game** in the library footer for a phone-specific HTML file. Advanced playable export also offers **Player layout: Phone** alongside its chapter, scene and dialogue ranges. Phone exports fill the viewport, crop the background to fit portrait, enlarge the phone and use compact dialogue and message fonts. The initial advance mode is tap/click. Taps never select choices; scrolling messages or operating apps does not advance the story. Desktop exports retain authored font and device dimensions and their configured advance mode. Exporting does not change the editable project.

Both exported players show only **Pause menu** above the story. Open it for:

- Resume and restart.
- Fullscreen / Exit fullscreen (fullscreen starts off). Browser/OS fullscreen escape gestures still work.
- Advance story: Continue button, Enter, or tap/click the scene.
- Enable/mute sound and volume.
- Current progress.
- **Save and quit**: write the complete current runtime (position, values, chosen route, transcript and replies) to browser storage, then return to the game title screen.
- **Quit without saving**: return to the title screen without overwriting the last checkpoint.

Use **Continue saved game** on the title screen to restore that checkpoint. Saves belong to the same exported story version and scope, device, browser and site/file origin. Opening a different story version or moving/renaming a local HTML file may use a different storage location. Mobile browsers may not execute HTML directly from file previews: serve the exported HTML as a website if your file viewer does not open it. These saves do not publish to GitHub or synchronize devices. Storage errors keep the paused story open and report the failure.
