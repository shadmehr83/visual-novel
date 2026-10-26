# Ready-to-upload app

`stillframe-cloudflare.zip` contains the built browser app. Open this ZIP's file page on GitHub, then select **Download raw file** (the download-arrow button). You do not need to install Node or run code to use this package.

In Cloudflare, go to **Workers & Pages**, create a **Pages** project, choose **Direct Upload**, and upload this ZIP. If prompted for a folder, extract the ZIP and upload its contents. Cloudflare provides your HTTPS `pages.dev` website address when deployment finishes.

If you prefer no downloads, connect this repository directly through Cloudflare Pages Git integration. Select the branch containing the app. Set build command `npm run build`, output directory `dist`, Node version `24`. Core editing requires no secrets. The optional AI assistant needs the server-side secrets described in ../docs/AI_SETUP.md. The refreshed ZIP includes the Cloudflare worker.

Projects are stored in each browser's local database. Use **Export project** regularly for backups and **Open project** to move work to another device. This deployment does not provide shared cloud storage.

For future changes: run `npm ci`, then `npm run build`, and replace this ZIP with a ZIP of the contents of `dist`.

## Single-file HTML editor

Open `stillframe-studio.html` on GitHub and choose **Download raw file**, then save it and open it in a modern desktop browser. This is the full authoring editor in one file, with a bundled player exporter. The local file supports the offline preset helper; real provider AI needs the hosted backend. Export/Open project transfers your authored work between browser locations. See ../docs/LOCAL_EDITOR.md for details and My Sites publication limitations.
