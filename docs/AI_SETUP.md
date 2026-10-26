# AI and voice assistant

Open the **Assistant** tab (sparkle icon). Type a request or press **Speak your request**, review the transcript, then ask the AI. Review the operations and choose **Apply approved changes** or **Reject / revise**. Undo reverses the entire approved proposal.

Examples:
- “Dim the café and add gentle rain inside its existing window mask.”
- “Rewrite this dialogue so Mara sounds warmer, without revealing anything she does not know.”
- “Create a park scene, then add a choice at the end of the café to go there.”
- “Move Mara's existing sprite to the left and make it slightly smaller.”
- “Attach the imported café ambience at low volume and loop it.”
- “Add a five-second QTE to this dialogue and use these existing success and timeout nodes.”

The assistant can propose supported effects, scene titles, dialogue rewrites, new scenes, choices, sprites, imported audio settings and QTEs. It cannot execute code, invent image/audio files, change protected flags, confirm clues, or implement new software features. Unsupported requests get an explanation rather than arbitrary code execution. Narrative outcomes still come from authored state/actions.

## Required Cloudflare server configuration

This is separate from the Cloudflare token that authorises Codex deployment. Your AI provider key is never a browser key.

In the connected Cloudflare Pages project, add these **server-side secrets** for the production environment, then redeploy:

- `AI_API_KEY`: an OpenAI API key with available API billing. A ChatGPT subscription does not itself supply API credit.
- `STUDIO_ACCESS_TOKEN`: a long, private studio password you choose. Enter this password in the Assistant panel to authorise requests; it is held only in component memory and is not exported or saved to the project. Use it only on your trusted HTTPS deployment. It is not the AI provider key.
- Optional plain variable `AI_MODEL`: defaults to `gpt-4.1-mini`.

**Do not put either secret into Vite variables, GitHub files, project exports, or chat.** The AI worker at `/api/assistant` calls the provider on the server; the browser never receives the provider key. GET reports whether setup is complete without returning credentials. POST requires same-origin requests and the studio password. Deployments without the two secrets remain usable in offline mode and clearly show AI as unconfigured. Shared-password auth is a small private-studio solution, not per-user account management. Configure Cloudflare rate limiting / Access before sharing a paid AI deployment widely; requests have bounded size, output and timeouts, but this release has no distributed per-user quota system.

The production build includes `dist/_worker.js` (Cloudflare Pages advanced mode), so both Git deployments and the refreshed Direct Upload ZIP include the API. A plain static host or `vite preview` does not execute this worker; the offline helper remains available there. No request goes to a remote provider until the user checks the text-sharing consent and presses Ask AI. Scene/dialogue text, character notes and asset names/IDs are sent; artwork and audio bytes are omitted. Clear the consent checkbox to stop sending future requests.

## Voice

Dictation uses the browser's SpeechRecognition implementation. Chrome/Edge over HTTPS are the recommended starting point. Browser support and microphone permissions vary. The browser may use an external speech service; an explicit notice precedes microphone activation. Voice changes the request text only, and never applies edits automatically. Stop dictation with the same button. Errors leave typing available. Proposal read-aloud uses browser speech synthesis. Real microphone quality and regional speech-service availability need testing on your own device; automated tests use a simulated recognition service.

## Verification limits

The implementation is tested with mocked provider responses, error cases, invalid proposals, approval/undo and simulated speech input. No live provider request was possible without a server key. A successful GitHub push does not prove Cloudflare deployed or that provider billing/secrets are correct. Check the Pages deployment result and Assistant connection indicator after configuring secrets.
