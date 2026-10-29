# Saving and exports · 2.19.0

- Browser autosave stores work on this browser/device only.
- Save complete project file downloads an editable backup to disk.
- In Save project file, choose Save destination → GitHub and enter the studio publishing password to upload. The connection status states whether the server has GITHUB_PROJECT_TOKEN (repository Contents write permission) and STUDIO_ACCESS_TOKEN configured. Credentials are never embedded in project files. A successful upload reports a GitHub commit; failed uploads leave local work intact. Server configuration is still required when the connection is unavailable.
- On opening, choose Load latest GitHub save or Keep local project. The hosted loader retrieves the current repository file, rather than only the snapshot bundled at deployment. Loading keeps a recoverable local copy. The engine code and project file remain separate. Offline editors need a network connection to fetch the latest remote project through the hosted app.
- Each asset has an expand icon beside its own card.
- In the library footer, open Advanced playable export. Select Entire story, One chapter, Scene range, or Dialogue range. Boundaries are inclusive in authoring order. Chapter export starts at that chapter’s configured starting scene. Branches outside the selection finish the demo. Mid-story exports use initial variables and do not replay preceding choices. Exports retain project resources and use playback boundaries; they are not a tool for removing unreleased source content.

Existing authored images, dialogue and effects are unchanged.
