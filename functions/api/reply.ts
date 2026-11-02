import { providerCompletion } from "../../src/aiProviders";
import { characterReplyRequestSchema, characterReplySchema, characterReplySystem } from "../../src/characterReply";
type Env = { ANTHROPIC_API_KEY?: string; ANTHROPIC_MODEL?: string; STUDIO_ACCESS_TOKEN?: string };
export async function onReplyGet({ env }: { env: Env }) {
  return Response.json({ configured: !!(env.ANTHROPIC_API_KEY && env.STUDIO_ACCESS_TOKEN), provider: "anthropic" });
}
export async function onReplyPost({ request, env }: { request: Request; env: Env }) {
  const reply = (error: string, status: number) => Response.json({ error }, { status });
  if (!env.ANTHROPIC_API_KEY || !env.STUDIO_ACCESS_TOKEN)
    return reply("Claude replies are not configured. Add ANTHROPIC_API_KEY and STUDIO_ACCESS_TOKEN in Cloudflare Pages secrets.", 503);
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply("Same-origin requests only.", 403);
  if (request.headers.get("authorization") !== `Bearer ${env.STUDIO_ACCESS_TOKEN}`)
    return reply("Enter the studio access password configured by the site owner.", 401);
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
    const content = await providerCompletion("anthropic", env, characterReplySystem, body, 400);
    return Response.json(characterReplySchema.parse(JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/g, ""))));
  } catch {
    return reply("Claude could not answer in character. The authored story continues unchanged.", 502);
  }
}
