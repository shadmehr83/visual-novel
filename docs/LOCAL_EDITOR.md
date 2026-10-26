# Single-file editor (HTML)

The entire editor is available as `stillframe-studio.html`: React, CSS, illustrations, effects, audio/sprite/QTE tools, narrative runtime, offline preset helper, and player-export bundle are inline in one file. It is generated from the same source as the hosted studio, rather than maintained as a separate reduced app.

## Get it and use it

In the production website, click **Download local editor** in the left footer. Alternatively open `downloads/stillframe-studio.html` in this GitHub repository and choose **Download raw file** (the download-arrow button). Save the file as `stillframe-studio.html` and open it in a modern desktop browser. No Node installation or build command is required to use this generated file.

You can also open `/stillframe-studio.html` on the deployed website. When served by the same Cloudflare origin, it can use that site's existing AI worker and browser project storage. If uploaded to another host, that host must provide an equivalent API to enable provider AI.

## Move your authored project

On your existing hosted studio, choose **Export project**. In the HTML edition, choose **Open project** and select the downloaded `.stillframe.json` file. The export contains your scene data and original image/audio assets. The file contains the engine and demo, not a copy of projects stored in a different browser origin. Project exports do not include the local playthrough state.

## Storage and offline use

The file contains no external code, styles or production-art downloads. It does not register a service worker. Images and sounds you import remain in the browser's IndexedDB and travel in JSON exports. Local-file IndexedDB support and the way browsers isolate local files vary: keep exports, particularly before moving, renaming or replacing the HTML file. If storage is unavailable, the editor reports the failure and project export remains available. A local HTTP server is an alternative where a browser restricts storage for file URLs.

**Export playable HTML** also works from the local editor while offline: its player bundle is embedded. That creates a player-only file for your story; the editor download contains authoring tools as well.

## AI and voice

The locally opened file has no server or provider key. It uses the offline preset helper and manual editing; optional browser dictation depends on microphone permissions and browser support. Use the existing hosted studio for real provider AI. Never embed an API key in this HTML. A hosting service's built-in managed AI is a separate integration and is not supplied by this file or a ChatGPT subscription.

## My Sites

This is a portable HTML app suitable for presenting to a publishing tool. It has not been added to ChatGPT's **My Sites**: this session exposes no such publishing action. The chat/service that created Colorwatch would need to publish or import the HTML, subject to its capabilities and policies. Neither local file generation nor a GitHub push establishes My Sites publication.

## Build and verification

`npm run build` generates `dist/stillframe-studio.html` after bundling the normal player and worker. Maintainers copy the generated file into `downloads/` when preparing a new committed distribution.

With `npm run preview -- --port 4173` running, execute `CHROMIUM_PATH=/usr/bin/chromium npm run test:standalone`. The test downloads the full editor, denies networking, serves only that captured HTML, edits dialogue, imports an image, applies/undoes the offline helper, reloads IndexedDB state, exports a player and plays it offline. It checks that no external code/image/font assets were requested. This environment's browser policy disallows direct `file://` navigation, so direct-file storage and microphone behavior still need testing on the user's own browser; that policy is not bypassed by the test.
