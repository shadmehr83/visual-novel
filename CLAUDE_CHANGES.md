# Changes made by Claude

Every change in this list was written by Claude (Anthropic) at the request of the repository owner. Matching commits start with `[Claude]` and carry a `Co-authored-by: Claude <noreply@anthropic.com>` trailer.

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
