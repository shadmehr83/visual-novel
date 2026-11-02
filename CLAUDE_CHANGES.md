# Changes made by Claude

Every change in this list was written by Claude (Anthropic) at the request of the repository owner. Matching commits start with `[Claude]` and carry a `Co-authored-by: Claude <noreply@anthropic.com>` trailer.

> **Where this lives:** branch `claude` on GitHub. Versions end in `-claude`. `main` is the original line and is untouched.

## Iteration 7 — Author-only AI status, Normal/Advanced editor, per-line Self-reply (2026-11-03, engine 2.27.2-claude)

- **No AI tags inside the game.** Author's playthrough shows "AI · parallel to Scene · Dialogue" or "AI · extra responses after Scene · Dialogue · n messages", and the dialogue editor lists the parallel or the extra messages.
- **Normal / Advanced switch** in the bottom Dialogue tab, which shows the Dialogue advanced map (`FlowEditor`) under the preview at a fixed, scrollable height.
- **"Self-reply on this dialogue"** (`allowSelfReply` on a node): hides Self-reply on that line only, everywhere. The normal/device custom-response options are untouched.

## Iteration 6 — One AI panel, narrated-scene replies, AI labels, preview window, fifth Insta clip (2026-11-03, engine 2.27.0-claude)

- **AI panel** (`src/Assistant.tsx`): one **AI assistant** tab where each job picks its AI: Claude Code on this computer (shows which Claude model and plan), OpenAI API, or Claude API. The Claude API asks for confirmation for anything but character texts. **AI Demand Export** stays as its own tab, and the old "Cilia AI assistant" and "OFFLINE MODE" labels are gone.
- **Narrated scenes:** self-replies on Narrator or You lines are answered by the character present, the last one who spoke in the scene. Narration is labelled as narration for Claude. Outside the phone, a story-advancing answer stays visible until **Continue story**, and the chosen path is still followed (`src/characterReply.ts`, `src/SelfReply.tsx`).
- **Last line reminder** (`src/LastLine.tsx`) on lines with choices, in the studio and in exported or shared games.
- **AI labels** (studio only): "AI reply" and "AI parallel" tags in the phone and dialogue box, an author toolbar note naming the dialogue a parallel replaces, and a note in the dialogue editor.
- **Preview window** (`src/PreviewWindow.tsx`, `src/App.tsx`, `src/style.css`): Lock, Fill and Reset are pinned at the top when unlocked; the window scrolls inside and resizes from every edge and corner; the preview and dialogue editor scroll together when they don't fit.
- **Story bible voice rules** and phrase-repetition limits in Claude's instructions.
- **Fifth Insta clip, "harbour-lights":** rendered in the browser from `artwork/cafe-animation/street-source.png` (`scripts/insta/render.html`, `render-harbour-lights.ts`, `receive.mjs`; dev dependency `mp4-muxer`). It is registered in the feed, the manifest, the offline editor and the media pattern.

## Iteration 5 — Hosted studio on the Claude API, the script follows your conversation (2026-11-03, engine 2.26.0-claude)

- **Hosted studio (2.25.1-claude):** opened with `?code=<playtest code>`, character replies use the Claude API with no password. **Assistant → Character replies** shows "Claude API · texts only · connected".
- **Live fixes:** Haiku 5.5 thinks by default and used up the reply budget, so quick replies now turn thinking off. JSON is read even when the model wraps it in text, and a failed reply or adaptation is retried once.
- **Adapted script:** when a free conversation ends, the next authored lines (up to the next choice, 4 at most) and their choice texts are rephrased to follow on from it. The first line reacts briefly to the last message. Meaning, information and branches stay the same (`rewrite*` and `upcomingLines` in `src/characterReply.ts`; `shownText`/`shownChoice` and `runtime.rewrites` in `src/model.ts`; `/api/reply?rewrite=1`; `/api/claude-local/rewrite`).
- **Bridging answers** no longer end with a question the player can't answer.
- **Bug fix:** a free conversation, including an answer still arriving, survives the pause menu and other workspaces (`chatStore` in `src/characterReply.ts`, `src/SelfReply.tsx`).

## Iteration 4 — Free texting that returns to the story, playthrough logs, play link (2026-11-02, engine 2.25.0-claude)

- **Keep texting:** after a self-reply you can keep texting the character. Each answer has an `advance` decision: when your message engages with the story (or after 4 free texts, `MAX_FREE_TURNS`), the authored route resumes on your chosen path. Off-topic chats get steered back, more firmly each turn (`src/characterReply.ts`, `src/SelfReply.tsx`, `src/PhoneUI.tsx`).
- **No duplicate line:** when the character's answer moves the story on, it carries the next authored line's content, and `respond()` skips that plain line of theirs (`src/model.ts`).
- **Natural side answers:** characters may answer harmless questions (where, when…) using names from the story: current and upcoming scene titles, plus lines from other branches of the scene. No secrets or invented clues.
- **AI playthrough log:** every exchange is logged with time, playthrough id, scene, line, chosen path, turn, your text, the answer, the advance decision, response time and recent choices. Use **Assistant → Character replies → Download log / Clear**. The local studio also appends to `playtest-logs/claude-YYYY-MM-DD.jsonl`, which Git ignores. Players can download theirs from the Pause menu.
- **Share link:** `/play` is a game-only page with no editor. Add `?layout=phone` for the phone layout and `?code=<PLAYTEST_TOKEN>` for live character replies (`play.html`, `src/play.tsx`, `vite.config.ts`).
- One quiet automatic retry when an answer fails. The local bridge loads story code on demand, so editing it no longer restarts the dev server.
- Versions renamed to `2.22.0-claude` … `2.25.0-claude`; `AGENTS.md` notes the branch convention.

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
