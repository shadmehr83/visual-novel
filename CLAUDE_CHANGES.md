# Changes made by Claude

Every change in this list was written by Claude (Anthropic) at the request of the repository owner. Matching commits start with `[Claude]` and carry a `Co-authored-by: Claude <noreply@anthropic.com>` trailer.

## Iteration 3 — Phone chat replies, chosen-path intent, Claude edition export, bigger stage (2026-11-02, engine 2.24.0)

- **Phone chat:** your self-reply appears as your chat bubble, the contact shows typing dots, and their answer arrives as their own message before the authored conversation continues (`src/PhoneUI.tsx`, `src/SelfReply.tsx`, `src/model.ts` `respond(…, answer)`, `src/playerSave.ts`).
- **Chosen path:** the authored reply you pick under *Follow this authored path* is sent as the intent behind your own words. Claude reacts to that tone and consequence and steers toward the route without repeating the authored text (`src/characterReply.ts`: transcript prompt, perspective note, echo retry).
- **Speed:** in-game replies use Haiku, the fastest and lightest model. The local bridge passes the character rules as the system prompt and skips MCP and session saving (`scripts/claude-local-plugin.ts`, `functions/api/reply.ts`). Replies take about 4–8 seconds through Claude Code.
- **No Claude tag inside the story:** tags stay in the studio only.
- **Claude edition export:** Advanced playable export → Character replies → Claude edition, for both desktop and phone layouts. The file embeds the game server address and a playtest code, has its own title badge and warm accent, and calls `/api/reply` with `X-Playtest-Token`. The server needs the `ANTHROPIC_API_KEY` and `PLAYTEST_TOKEN` secrets (`src/AdvancedExport.tsx`, `src/playerExport.ts`, `src/Player.tsx`, `functions/api/reply.ts`, `functions/worker.ts`).
- **Author's playthrough:** controls compacted to one row, and the game stage keeps a playable minimum size (`src/style.css`).
- Update history 2.24.0, ✓ New markers, tests, and a refreshed `downloads/stillframe-studio.html`.

## Iteration 2 — Claude on this computer, automatic replies, Claude and ✓ New markers (2026-11-02, engine 2.23.0)

Uses your own Claude Pro sign-in, through Claude Code on this computer, instead of an API key. Self-reply now gets an answer automatically: no tick box and no password.

- `scripts/claude-local-plugin.ts` (new): local studio bridge at `/api/claude-local`, active only in `npm run dev`. It runs the signed-in `claude` CLI with tools disabled. Story text goes in through stdin, and only requests from this computer are accepted.
- `vite.config.ts`: loads the bridge.
- `functions/api/assistant.ts`: the assistant's instructions are now a shared `assistantSystem` constant, so the local bridge uses the same rules.
- `src/characterReply.ts`: reply mode setting (Claude on this computer / Claude API / Off), connection status and local requests.
- `src/SelfReply.tsx`: removed the tick box and password. The character answers automatically ("… is typing…") and the answer carries a Claude tag.
- `src/Assistant.tsx`: new **Character replies** section showing "Claude Pro connected", plus **Claude (this computer)** as a provider choice for assistant tasks (no password needed).
- `src/ClaudeMark.tsx` (new): the small CLAUDE tag with hover description.
- `src/ReleaseHistory.tsx`, `src/RecentFeatures.tsx`, `src/releases.ts`: releases record who made them, Claude releases show a CLAUDE tag, the newest release's features show a ✓ New mark with hover descriptions, and new controls get a ✓ (✓ Claude) marker.
- `src/style.css`, `src/characterReply.test.ts`, `package.json`: styles, test, version 2.23.0.

Setup on another computer: install Claude Code (`npm install -g @anthropic-ai/claude-code`) and run `claude auth login` once. The public Cloudflare site cannot use a personal Claude subscription; it still needs `ANTHROPIC_API_KEY`.

## Iteration 1 — In-character Claude replies (2026-11-02, engine 2.22.0)

When a player uses **Self-reply**, they can tick **Let Claude answer in character**. The speaking character then answers what the player typed, in their own voice, before the authored story continues unchanged.

- `functions/api/reply.ts` (new): `/api/reply` server endpoint. Calls Claude, requires the studio password and same-origin requests, and validates input and output.
- `src/characterReply.ts` (new): builds the request (reply, current and next lines, speaker notes, recent scene lines) and holds Claude's instructions. Claude stays in character, respects what the character knows and never changes the plot.
- `src/SelfReply.tsx`: Claude toggle, studio password field, "thinking…" state, answer panel and Continue story or Skip.
- `src/PlaySession.tsx`: shares the current story position with the reply box. Turned off in exported games.
- `functions/worker.ts`: routes `/api/reply`.
- `src/aiProviders.ts`: default Claude model updated to `claude-sonnet-5-5`; per-request token limit.
- `src/style.css`: styles for the answer panel.
- `src/characterReply.test.ts` (new): request building, Claude routing and endpoint guards.
- `src/releases.ts`, `package.json`, `docs/AI_SETUP.md`: Update history entry 2.22.0 and setup notes.

Needs `ANTHROPIC_API_KEY` and `STUDIO_ACCESS_TOKEN` set as Cloudflare Pages secrets to work on the live site.
