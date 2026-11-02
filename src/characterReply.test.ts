import { afterEach, expect, it, vi } from "vitest";
import { demo } from "./demo";
import { respond, start } from "./model";
import { askCharacter, characterReplyMode, characterReplyPrompt, characterReplyRequest, finishReply, MAX_FREE_TURNS, setCharacterReplyMode } from "./characterReply";
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
  expect(await res.json()).toEqual({ text: "I am, thank you.", advance: false });
  expect(f.mock.calls[0][0]).toBe("https://api.anthropic.com/v1/messages");
  const sent = JSON.parse(f.mock.calls[0][1].body);
  expect(sent.model).toBe("claude-haiku-5-5");
  expect(sent.max_tokens).toBe(1000);expect(sent.thinking).toEqual({type:"disabled"});
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

it("defaults to Claude on this computer and sends local replies without a password", async () => {
  localStorage.clear();
  expect(characterReplyMode()).toBe("claude-local");
  setCharacterReplyMode("off");
  expect(characterReplyMode()).toBe("off");
  setCharacterReplyMode("claude-local");
  const f = vi.fn().mockResolvedValue(Response.json({ text: "Hi." }));
  vi.stubGlobal("fetch", f);
  const p = demo();
  expect(await askCharacter(characterReplyRequest(p, start(p), "Hello")!, "claude-local")).toEqual({ text: "Hi.", advance: false });
  expect(f.mock.calls[0][0]).toBe("/api/claude-local/reply");
  expect(f.mock.calls[0][1].headers.Authorization).toBeUndefined();
});

it("reads a self-reply through the chosen authored path and records the answer as the character's message", () => {
  const p = demo();
  const scene = p.scenes.find((s) => s.nodes.some((n) => n.choices.length))!;
  const node = scene.nodes.find((n) => n.choices.length)!;
  const r = { ...start(p), scene: scene.id, node: node.id };
  const choice = node.choices[0];
  const body = characterReplyRequest(p, r, "Depends why you're asking.", choice.id)!;
  expect(body.chosenPath).toBe(choice.text);
  const thread = [{ sender: node.speaker, text: "Fair. Suspicious answer." }, { sender: "You", text: "Where though?" }, { sender: node.speaker, text: "The Lantern Room." }];
  const result = respond(p, r, "Depends why you're asking.", choice.id, thread);
  expect(result.responses!.at(-1)).toMatchObject({ text: "Depends why you're asking.", thread });
  expect(result.history).toContain(`${node.speaker}: Fair. Suspicious answer.`);
  expect(result.history).toContain("Custom reply: Where though?");
});

it("skips the character's next plain authored line when Claude's answer bridges into it", () => {
  const p = demo();
  const scene = p.scenes[0];
  const line = { ...scene.nodes[0], choices: [], qte: undefined, speaker: "Maria" };
  const node = { ...line, id: "t-ask", text: "So, when?", next: "t-plan" };
  const authored = { ...line, id: "t-plan", text: "How about four?", next: "t-bye" };
  scene.nodes.push(node, authored, { ...line, id: "t-bye", text: "See you.", next: undefined });
  const r = { ...start(p), scene: scene.id, node: node.id };
  const plain = respond(p, r, "Hi", undefined, [{ sender: node.speaker, text: "Hello." }]);
  expect(plain.node).toBe(authored.id);
  const bridged = respond(p, r, "Hi", undefined, [{ sender: node.speaker, text: "Hello, and here's the plan.", bridge: true }]);
  expect(bridged.node).toBe(authored.next);
});

it("caps the free conversation and always returns to the story on the last turn", async () => {
  const p = demo();
  const body = { ...characterReplyRequest(p, start(p), "Anyway, do you like soup?")!, turn: MAX_FREE_TURNS };
  expect(finishReply(body, { text: "Soup is fine. Anywayâ€¦", advance: false }).advance).toBe(true);
  expect(characterReplyPrompt(body)).toContain("last free turn");
  expect(characterReplyPrompt({ ...body, turn: 1 })).not.toContain("last free turn");
});

it("lets Claude edition exports use the playtest code from any origin", async () => {
  const f = vi.fn().mockResolvedValue(Response.json({ content: [{ type: "text", text: '{"text":"Hey."}' }] }));
  vi.stubGlobal("fetch", f);
  const p = demo();
  const body = characterReplyRequest(p, start(p), "Hello")!;
  const play = (token: string) => new Request("https://studio.test/api/reply", { method: "POST", headers: { origin: "null", "x-playtest-token": token }, body: JSON.stringify(body) });
  const playEnv = { ANTHROPIC_API_KEY: "k", PLAYTEST_TOKEN: "share-me" };
  expect((await onReplyPost({ request: play("wrong"), env: playEnv })).status).toBe(401);
  const ok = await onReplyPost({ request: play("share-me"), env: playEnv });
  expect(ok.status).toBe(200);
  expect(ok.headers.get("access-control-allow-origin")).toBe("*");
  expect((await onReplyPost({ request: play("share-me"), env: { ANTHROPIC_API_KEY: "k" } })).status).toBe(503);
});
