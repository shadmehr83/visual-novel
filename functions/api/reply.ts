import { providerCompletion } from "../../src/aiProviders";
import { characterReplyPrompt, echoesPlayer, finishReply, characterReplyRequestSchema, characterReplySchema, characterReplySystem } from "../../src/characterReply";
type Env = {
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_REPLY_MODEL?: string;
  STUDIO_ACCESS_TOKEN?: string;
  // Shared code embedded in Claude-integrated playable exports for testers.
  PLAYTEST_TOKEN?: string;
};
// Exported games run from a file or another site, so playtest requests are cross-origin.
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, X-Playtest-Token", "Access-Control-Allow-Methods": "POST, OPTIONS" };
export function onReplyOptions() {
  return new Response(null, { status: 204, headers: cors });
}
export async function onReplyGet({ env }: { env: Env }) {
  return Response.json({ configured: !!(env.ANTHROPIC_API_KEY && env.STUDIO_ACCESS_TOKEN), playtest: !!(env.ANTHROPIC_API_KEY && env.PLAYTEST_TOKEN), provider: "anthropic" });
}
export async function onReplyPost({ request, env }: { request: Request; env: Env }) {
  const playtest = request.headers.has("x-playtest-token");
  const reply = (error: string, status: number) => Response.json({ error }, { status, headers: playtest ? cors : {} });
  if (playtest) {
    if (!env.ANTHROPIC_API_KEY || !env.PLAYTEST_TOKEN) return reply("Claude replies are not set up on the game server yet.", 503);
    if (request.headers.get("x-playtest-token") !== env.PLAYTEST_TOKEN) return reply("This playtest link has expired. Ask the author for a new export.", 401);
  } else {
    if (!env.ANTHROPIC_API_KEY || !env.STUDIO_ACCESS_TOKEN)
      return reply("Claude replies are not configured. Add ANTHROPIC_API_KEY and STUDIO_ACCESS_TOKEN in Cloudflare Pages secrets.", 503);
    if (request.headers.get("origin") !== new URL(request.url).origin) return reply("Same-origin requests only.", 403);
    if (request.headers.get("authorization") !== `Bearer ${env.STUDIO_ACCESS_TOKEN}`)
      return reply("Enter the studio access password configured by the site owner.", 401);
  }
  if (Number(request.headers.get("content-length") || 0) > 40000) return reply("Request is too large.", 413);
  let body;
  try {
    const text = await request.text();
    if (text.length > 40000) return reply("Request is too large.", 413);
    body = characterReplyRequestSchema.parse(JSON.parse(text));
  } catch {
    return reply("Provide a reply of 1–1000 characters.", 400);
  }
  try {
    // The fastest, lightest model keeps in-game replies quick.
    const ask = async () => characterReplySchema.parse(JSON.parse((await providerCompletion("anthropic", { ...env, ANTHROPIC_MODEL: env.ANTHROPIC_REPLY_MODEL || "claude-haiku-5-5" }, characterReplySystem, characterReplyPrompt(body), 1000, true)).replace(/^```(?:json)?\s*|\s*```$/g, "")));
    let result = await ask();
    if (echoesPlayer(body, result.text)) result = await ask();
    result = finishReply(body, result);
    return Response.json(result, { headers: playtest ? cors : {} });
  } catch (e) {
    // The provider's status and message help diagnose setup; they never include the key.
    return Response.json({ error: "The character could not answer. The authored story continues unchanged.", detail: String((e as Error).message).slice(0, 300) }, { status: 502, headers: playtest ? cors : {} });
  }
}
