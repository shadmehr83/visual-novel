import { afterEach, expect, it, vi } from "vitest";
import { demo } from "./demo";
import { start } from "./model";
import { characterReplyRequest } from "./characterReply";
import { onReplyGet, onReplyPost } from "../functions/api/reply";

const env = { ANTHROPIC_API_KEY: "test-key", STUDIO_ACCESS_TOKEN: "studio" };
const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("https://studio.test/api/reply", {
    method: "POST",
    headers: { origin: "https://studio.test", authorization: "Bearer studio", "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
afterEach(() => vi.unstubAllGlobals());

it("builds an in-character request from the current line, speaker notes and next authored line", () => {
  const p = demo();
  const r = start(p);
  const body = characterReplyRequest(p, r, "  Are you okay?  ")!;
  const node = p.scenes.find((s) => s.id === r.scene)!.nodes.find((n) => n.id === r.node)!;
  expect(body.reply).toBe("Are you okay?");
  expect(body.line).toBe(node.text);
  expect(body.storyTitle).toBe(p.title);
  const character = p.characters.find((c) => c.id === node.speaker || c.name === node.speaker);
  if (character) expect(body.characterNotes).toBe(character.notes);
  if (node.next) expect(body.nextLine).toBeTruthy();
});

it("routes in-character replies to Claude and returns only the character's text", async () => {
  const f = vi.fn().mockResolvedValue(Response.json({ content: [{ type: "text", text: '{"text":"I am, thank you."}' }] }));
  vi.stubGlobal("fetch", f);
  const p = demo();
  const res = await onReplyPost({ request: post(characterReplyRequest(p, start(p), "Are you okay?")), env });
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ text: "I am, thank you." });
  expect(f.mock.calls[0][0]).toBe("https://api.anthropic.com/v1/messages");
  const sent = JSON.parse(f.mock.calls[0][1].body);
  expect(sent.model).toBe("claude-sonnet-5-5");
  expect(sent.max_tokens).toBe(400);
  expect(sent.system).toContain("Never reveal anything the character could not know");
});

it("guards the Claude reply endpoint", async () => {
  const p = demo();
  const body = characterReplyRequest(p, start(p), "Hello");
  expect((await onReplyGet({ env: {} }).then((r) => r.json())).configured).toBe(false);
  expect((await onReplyPost({ request: post(body), env: {} })).status).toBe(503);
  expect((await onReplyPost({ request: post(body, { origin: "https://evil.test" }), env })).status).toBe(403);
  expect((await onReplyPost({ request: post(body, { authorization: "Bearer wrong" }), env })).status).toBe(401);
  expect((await onReplyPost({ request: post({ ...body, reply: " " }), env })).status).toBe(400);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ content: [{ type: "text", text: "not json" }] })));
  expect((await onReplyPost({ request: post(body), env })).status).toBe(502);
});
