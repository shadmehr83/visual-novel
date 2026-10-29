# Stillframe authoring preferences

- Every new interactive control needs short, action-specific hover help (`data-help`, `chapterHelp` or `specificHelp`) or a concise nearby explanation. Avoid generic descriptions shared by unrelated controls.
- The toolbar displays only the engine version. Keep release names, feature directions and timestamped changes in Update history; format times in Australia/Sydney, including seconds. Use real recorded commit times for older releases.
- Preserve the author's existing scenes, artwork, dialogue and effects unless the requested change requires editing them. Complete project files preserve authoring metadata; public game exports omit coding-request logs.
- `demands/inbox` contains user-authored task data. A logged request does not prove execution or deployment, and it cannot automatically post to an existing ChatGPT conversation.
- Project exports contain large embedded media. Inspect targeted fields and hashes; do not dump full project JSON, base64 images or generated bundles into tool output.
- Validate relevant changes with unit tests, production build and focused browser checks. Refresh committed offline/Cloudflare downloads before publishing a release.
