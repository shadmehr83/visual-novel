# Ready-to-upload app

`stillframe-cloudflare.zip` contains the built browser app. Open this ZIP's file page on GitHub, then select **Download raw file** (the download-arrow button). You do not need to install Node or run code to use this package.

In Cloudflare, go to **Workers & Pages**, create a **Pages** project, choose **Direct Upload**, and upload this ZIP. If prompted for a folder, extract the ZIP and upload its contents. Cloudflare provides your HTTPS `pages.dev` website address when deployment finishes.

If you prefer no downloads, connect this repository directly through Cloudflare Pages Git integration. Select the branch containing the app. Set build command `npm run build`, output directory `dist`, Node version `24`. Core editing requires no secrets. The optional AI assistant needs the server-side secrets described in ../docs/AI_SETUP.md. The refreshed ZIP includes the Cloudflare worker.

Projects are stored in each browser's local database. Use **Export project** regularly for backups and **Open project** to move work to another device. This deployment does not provide shared cloud storage.

For future changes: run `npm ci`, then `npm run build`, and replace this ZIP with a ZIP of the contents of `dist`.

## Single-file HTML editor

Open `stillframe-studio.html` on GitHub and choose **Download raw file**, then save it and open it in a modern desktop browser. This is the full authoring editor in one file, with a bundled player exporter. The local file supports the offline preset helper; real provider AI needs the hosted backend. Export/Open project transfers your authored work between browser locations. See ../docs/LOCAL_EDITOR.md for details and My Sites publication limitations.

## Complete handoff document

[Visual_Novel_Studio_Complete_Handoff.docx](Visual_Novel_Studio_Complete_Handoff.docx) collects the original specification, project history, source/HTML/hosting links, implemented features, verification limits, all setup methods, AI and voice configuration, data migration instructions, and a continuation prompt for the destination website-building assistant. Open the file page and select **Download raw file**. No credential values are included.

## Playing on a phone

In the editor's library footer choose **Export phone game**. It downloads a separate HTML player with compact dialogue, a larger phone interface, tap-to-continue and a viewport-filling stage. Use **Advanced playable export → Player layout → Phone** for a chapter or dialogue range. Both phone and normal exports put volume, advance mode and fullscreen inside **Pause menu**, together with **Save and quit** and **Quit without saving**. Progress saves stay in that browser; they do not sync through GitHub. See [player instructions](../docs/PHONE_EXPORT_AND_PAUSE.md).

Scene six includes the original 2:49 café piano loop **Between the Rain and Four O’clock**. In **Scenes advanced → select scene → Soundtracks in this scene**, preview/seek the track and adjust its volume and looping. The complete local editor includes the music; the website decompresses the download before saving the usual single HTML file.
