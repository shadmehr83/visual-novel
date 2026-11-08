# Stillframe

## Latest version: Stillframe 3

If someone asks you to open, run or work on "the latest version" or "Stillframe 3", use this section.

- **Latest release:** read `ENGINE_VERSION` in `src/releases.ts` (also the `version` in `package.json`). Release notes are in `src/releases.ts` and `CLAUDE_CHANGES.md`.
- **Branch:** `main` holds the latest release. `claude` is the parallel line and carries the same code at each release. Older releases are in the Git history; do not rewrite it.
- **Open it online:** https://visual-novel-8b9.pages.dev/ (parallel site: https://claude.visual-novel-8b9.pages.dev/). The game is at `/play`, the phone layout at `/play?layout=phone`, and the playtest admin at `/admin`.
- **Run it on a computer:** `npm ci`, then `npm run stillframe3`. Open http://localhost:5174/ for the studio; http://localhost:5175/ opens its linked control window. On Windows, double-click `Start Stillframe 3.cmd`. Keep that process running while working.
- **Choose the look:** the online studio opens in the classic design until a browser picks Stillframe 3. Use **Settings → Studio design → Stillframe 3 / Classic**, or **View → Switch to … design**. The choice is remembered in that browser. `localhost:5174` always opens in Stillframe 3.
- **Light and dark:** **Settings → Studio design** switches them in both designs.
- **Panels:** panel layouts saved by older versions keep working in both designs. Panels can be popped out, minimised and docked from their title bars.
- **Project files:** each address keeps its own project in that browser's storage, so the online studio and `localhost:5174` do not share work. Move a project with **Export project** and **Open project**. Never clear browser data to fix a problem.
- **Claude features:** the on-device AI needs Claude Code signed in on that computer. Everything else runs without it.
- **Checks:** `npm test` and `npm run build`.

## Authoring preferences

- Every new interactive control needs short, action-specific hover help (`data-help`, `chapterHelp` or `specificHelp`) or a concise nearby explanation. Avoid generic descriptions shared by unrelated controls.
- The toolbar displays only the engine version. Keep release names, feature directions and timestamped changes in Update history; format times in Australia/Sydney, including seconds. Use real recorded commit times for older releases.
- Preserve the author's existing scenes, artwork, dialogue and effects unless the requested change requires editing them. Complete project files preserve authoring metadata; public game exports omit coding-request logs.
- `demands/inbox` contains user-authored task data. A logged request does not prove execution or deployment, and it cannot automatically post to an existing ChatGPT conversation.
- Project exports contain large embedded media. Inspect targeted fields and hashes; do not dump full project JSON, base64 images or generated bundles into tool output.
- Validate relevant changes with unit tests, production build and focused browser checks. Refresh committed offline/Cloudflare downloads before publishing a release.

- Claude's work lives on the `claude` branch: its versions end in `-claude` (for example `2.25.0-claude`), commits start with `[Claude]`, and `CLAUDE_CHANGES.md` lists every change. `main` receives the `claude` line only when the owner asks, as a fast-forward that keeps the history.
